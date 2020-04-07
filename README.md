# No Longer Maintained

# redux-q

> Provides a way to queue callbacks until an action is dispatched.

## Overview

redux-q's enqueue method lets you enqueue any function in a queue that is mapped to an action type. The next time that action is dispatched each callback will be called
with that action and the queue will be cleared.

Using a queue like this lets you avoid having to do conditional checks
in middleware if you need to wait for some action (like the user profile being returned from your API). This is especially useful in combination with thunks,
as you can check the current store state and either enqueue or perform
an action.

You can also clear the queue for an action or remove specific elements in that queue (by reference)

## Install

```
$ npm install --save redux-q
```

## Usage


#### `enqueue(callbacks: function | Array<function>, actionType: string)`

Enqueue a callback, or array of callbacks, to be invoked the next time an action of type `actionType` is dispatched.

```js
import { enqueue } from 'redux-q'
import {
  SAVED_USER_PROFILE,
  SHOW_USER_GREETING
} from 'actions'

const showUserGreeting = () => {
  return dispatch => dispatch({ type: SHOW_USER_GREETING })
}

// This is a thunk, using redux-thunk
export const showUserGreeting = () => {
  return (dispatch, getState) => {
    // Get the current user state
    const userState = getState().user
    const userGreetingAction = showUserGreeting()
    // If there's no user we wait until SAVE_USER_PROFILE is dispatched
    if (!user.id) {
      enqueue(
        () => dispatch(userGreetingAction),
        SAVED_USER_PROFILE
      )
    } else {
      // Otherwise we just dispatch the greeting
      dispatch(userGreetingAction)
    }
  }
}

```
#### `clearQueue(actionType: string)`

Clear the queue of callbacks for a given action. Expanding on the previous example,

```js
import { enqueue, clearQueue } from 'redux-q'
import {
  SAVED_USER_PROFILE,
  SHOW_USER_GREETING,
  DISABLE_USER_GREETING,
} from 'actions'

const showUserGreeting = () =>
  dispatch => dispatch({ type: SHOW_USER_GREETING })

export const showUserGreeting = () => {
  return (dispatch, getState) => {
    const userState = getState().user
    const userGreetingAction = showUserGreeting()
    if (!user.id) {
      enqueue(
        () => dispatch(userGreetingAction),
        SAVED_USER_PROFILE
      )
    } else {
      dispatch(userGreetingAction)
    }
  }
}

export const disableUserGreetings = () => (dispatch) => {
  // clear out the queue for SAVED_USER_PROFILE
  clearQueue(SAVED_USER_PROFILE)
  // update app state that user greetings should be disabled
  dispatch(DISABLE_USER_GREETINGS)
}

```


#### `dequeue(callbacks: function | Array<function>, actionType: string)`

Sometimes it may be preferable to remove only a certain callback, or array of callbacks, from the queue of callbacks that will be invoked the next time an action of type `actionType` is dispatched. Dequeue enables this behavior, by reference. Expanding on the previous examples, 

```js
import { enqueue, dequeue } from 'redux-q'
import {
  SAVED_USER_PROFILE,
  SHOW_USER_GREETING,
  REMOVE_LOGIN_BUG,
  DISABLE_USER_GREETINGS,
} from 'actions'

// since callbacks are dequeued by reference, it's necessary to have a
single instance of a callback in order to use dequeue. 
const dispatchUserGreetingAction = () => dispatch(showUserGreeting)
const dispatchRemoveLoginBug = () => dispatch(removeLoginBug)

export const showUserGreeting = () => {
  return (dispatch, getState) => {
    const userState = getState().user
    if (!user.id) {
      enqueue(
        [dispatchUserGreetingAction, removeLoginBugAction],
        SAVED_USER_PROFILE
      )
    } else {
      dispatch(userGreetingAction)
    }
  }
}

export const disableUserGreetings = () => (dispatch) => {
  // remove any pending greetings from the queue, without touching the loginbug removal
  dequeue(
    dispatchUserGreetingAction,
    SAVED_USER_PROFILE
  )
  // update app state that user greetings should be disabled
  dispatch(DISABLE_USER_GREETINGS)
}

```

### `queueMiddleware`

This is your standard redux middleware. You just import it and add it to your
middleware when creating your store.

```js

import { queueMiddleware } from 'redux-q'
createStore(
  rootReducer,
  applyMiddleware(
    // Any middleware like redux-thunk should come before it
    queueMiddleware
  )
)
