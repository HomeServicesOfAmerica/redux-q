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
