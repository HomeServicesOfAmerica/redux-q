const expect = require('chai').expect
const sinon = require('sinon')

const { createStore, applyMiddleware } = require('redux')
const { enqueue, queueMiddleware, queueMap } = require('./dist')


const INCREMENT = 'INCREMENT'
const DECREMENT = 'DECREMENT'

function counter(state = 0, action) {
  switch (action.type) {
    case INCREMENT:
      return state + 1
    case DECREMENT:
      return state + 2
    default:
      return state
  }
}

describe('redux-q', () => {

  beforeEach(() => {
    store = createStore(
      counter,
      applyMiddleware(
        queueMiddleware
      )
    )
  })

  afterEach(() => {
    delete queueMap[INCREMENT]
    delete queueMap[DECREMENT]
  })


  describe('enqueue', () => {
    it('should queue callbacks in the queueMap', () => {
      const func = () => {}
      enqueue(func, INCREMENT)
      expect(queueMap[INCREMENT].length).to.equal(1)
      expect(queueMap[INCREMENT][0]).to.equal(func)
    })

    it('should queue arrays of callbacks in the queueMap', () => {
      const func = () => {}
      enqueue([func, func], INCREMENT)
      expect(queueMap[INCREMENT].length).to.equal(2)
      expect(queueMap[INCREMENT][0]).to.equal(func)
      expect(queueMap[INCREMENT][1]).to.equal(func)
    })
  })

  describe('enqueueMiddleware', () => {
    it('should call all enqueued functions once', () => {
      let first = sinon.spy()
      let second = sinon.spy()
      enqueue([first, second], INCREMENT)
      store.dispatch({ type: INCREMENT })
      store.dispatch({ type: DECREMENT })
      store.dispatch({ type: INCREMENT })
      expect(first.calledOnce).to.equal(true)
      expect(second.calledOnce).to.equal(true)
    })
    it('should clear the queue after calling all callbacks', () => {
      let callback = sinon.spy()
      enqueue([callback, callback, callback], DECREMENT)
      store.dispatch({ type: DECREMENT })
      expect(callback.calledThrice).to.equal(true)
      expect(queueMap[DECREMENT].length).to.equal(0)
    })
    it('should process callbacks as a FIFO queue', () => {
      var calls = []
      const first = () => calls.push('first')
      const second = () => calls.push('second')
      enqueue(first, INCREMENT)
      enqueue(second, INCREMENT)
      store.dispatch({ type: INCREMENT })
      expect(calls[0]).to.equal('first')
      expect(calls[1]).to.equal('second')
    })
  })
})
