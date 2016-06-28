# redux-q

> Provides a way to queue callbacks until an action is dispatched.


## Overview

redux-q lets you enqueue any function in a queue that is mapped to an action type. The next time that action is dispatched each callback will be called
with that action and the queue will be cleared.

Using a queue like this lets you avoid having to do conditional checks
in middleware if you need to wait for some action (like the user profile being returned from your API). This is especially useful in combination with thunks,
as you can check the current store state and either enqueue or perform
and action.
___

* This project is still in pre-release stage and corner cases are sure to arise

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

### `queueMiddleware`

This is your standard redux middleware. You just import it and add it to your
middleware when creating your store.

```js

import { queueMiddleware } from ''
createStore(
  rootReducer,
  applyMiddleware(
    // Any middleware like redux-thunk should come before it
    queueMiddleware
  )
)
