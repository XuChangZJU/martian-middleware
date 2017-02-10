/**
 * Created by lavystord on 17/2/10.
 */
let onError;
function registerErrorHandler(handler) {
    onError = handler;
}

const errorMiddleware = ({ dispatch, getState }) => next => (action) => {
    if (!action.error) {
        return next(action);
    }
    next(action);
    return dispatch(onError && onError(action.error));
};

module.exports = {
    errorMiddleware,
    registerErrorHandler,
};
