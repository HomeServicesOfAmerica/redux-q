// @flow

type callback = (action: Object) => void
type enqueueCallbacks = callback | Array<callback>
type callbackQueue = Array<callback>
type middleware = () => (
  next: () => middleware
) => (action: Object) => middleware

export const queueMap: { [actionType: string]: callbackQueue} = {}

export const enqueue = (
  callbacks: enqueueCallbacks,
  actionType: string
): typeof queueMap => {
  const queue: callbackQueue = queueMap[actionType] || []
  callbacks = Array.isArray(callbacks)
    ? callbacks
    : [callbacks]
  queueMap[actionType] = queue.concat(callbacks)
  return queueMap
}

export const dequeue = (
  callbacks: enqueueCallbacks,
  actionType: string
): typeof queueMap => {
  let queue: callbackQueue = queueMap[actionType]
  if (queue === undefined) return null
  queueMap[actionType] = queue.filter(
    Array.isArray(callbacks)
      ? callback => callbacks.indexOf(callback) === -1
      : callback => callback !== callbacks
  );
  return queueMap
}

export const queueMiddleware: middleware = () => next => action => {
  const { type } = action
  if (queueMap[type]) {
    const queue = queueMap[type]
    queue.forEach(callback => callback(action))
    queue.length = 0
  }
  return next(action)
}
