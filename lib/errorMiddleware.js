"use strict";

/**
 * Created by lavystord on 17/2/10.
 */
var onError = void 0;
function registerErrorHandler(handler) {
    onError = handler;
}

var errorMiddleware = function errorMiddleware(_ref) {
    var dispatch = _ref.dispatch,
        getState = _ref.getState;
    return function (next) {
        return function (action) {
            if (!action.error) {
                return next(action);
            }
            next(action);
            return dispatch(onError && onError(action.error));
        };
    };
};

module.exports = {
    errorMiddleware: errorMiddleware,
    registerErrorHandler: registerErrorHandler
};