"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var queueMap = exports.queueMap = {};

var enqueue = exports.enqueue = function enqueue(callbacks, actionType) {
  var queue = queueMap[actionType] || [];
  callbacks = Array.isArray(callbacks) ? callbacks : [callbacks];
  queueMap[actionType] = queue.concat(callbacks);
  return queueMap;
};

var dequeue = exports.dequeue = function dequeue(callbacks, actionType) {
  var queue = queueMap[actionType];
  if (queue === undefined) return null;
  // callbacks = Array.isArray(callbacks)
  //   ? callbacks
  //   : [callbacks]
  // callbacks.forEach(callback => {
  // queue = queue.filter(
  //   queuedCallback => queuedCallback.toString() !== callback.toString()
  // )
  // })
  queueMap[actionType] = queue.filter(Array.isArray(callbacks) ? function (callback) {
    return callbacks.indexOf(callback) === -1;
  } : function (callback) {
    return callback !== callbacks;
  });
  return queueMap;
};

var queueMiddleware = exports.queueMiddleware = function queueMiddleware() {
  return function (next) {
    return function (action) {
      var type = action.type;

      if (queueMap[type]) {
        var queue = queueMap[type];
        queue.forEach(function (callback) {
          return callback(action);
        });
        queue.length = 0;
      }
      return next(action);
    };
  };
};
