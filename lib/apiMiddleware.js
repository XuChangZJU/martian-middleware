'use strict';

var normalizr = require("normalizr");
var normalize = normalizr.normalize;

var humps = require("humps");
var camelizeKeys = humps.camelizeKeys;


var Symbol = require('es6-symbol');
var sha1 = require('sha1');
var merge = require("lodash/merge");
var VERSION = '1.3.0';
var fetch2 = void 0;

function setFetch(fetch3) {
    //由外层注入fetch请求 注意返回值
    fetch2 = fetch3;
}

function fortify(url, init) {
    var url2 = void 0;
    if (url.indexOf('?') !== -1) {
        url2 = url + ("&time=" + Date.now());
    } else {
        url2 = url + ("?time=" + Date.now());
    }
    merge(init, {
        headers: {
            mnVersion: VERSION,
            mnCode: sha1("url2/" + VERSION)
        }
    });

    return url2;
}

function callApi(apiEndPoint, init, schema, fortifyRequest) {
    var apiEndPoint2 = apiEndPoint;

    if (fortifyRequest) {
        apiEndPoint2 = fortify(apiEndPoint, init);
    }
    var fetch3 = fetch2 ? fetch2 : fetch;
    return fetch3(apiEndPoint2, init).then(function (response) {
        if (!response.ok) {
            // response.ok不为true是 返回reject
            var error = {
                httpCode: response.status,
                message: Messages.messageUnknown || '未定义的错误'
            };
            if (response.status >= 500) {
                error = {
                    httpCode: response.status,
                    message: Messages.messageUnreach || '服务器响应错误'
                };
            } else if (response.status >= 400) {
                error = {
                    httpCode: response.status,
                    message: Messages.messageClientRequest || '客户端请求错误'
                };
            }

            return Promise.reject(error);
        }
        var headers = response.headers;

        var contentType = headers.get('Content-Type');

        if (contentType.includes('application/json')) {
            return response.json().then(function (json) {
                if (json.error !== undefined) {
                    var _error = Object.assign(json.error, {
                        httpCode: response.status
                    });

                    return Promise.reject(_error);
                }

                var camelizedJson = camelizeKeys(json);

                if (schema) {
                    return Promise.resolve(Object.assign({}, normalize(camelizedJson, schema)));
                } else {
                    return Promise.resolve({
                        result: camelizedJson
                    });
                }
            });
        } else if (contentType.includes('text') || contentType.includes('xml') || contentType.includes('html')) {
            return response.text().then(function (text) {
                return Promise.resolve(text);
            });
        } else if (contentType.includes('application/octet-stream')) {
            return response.arrayBuffer().then(function (arrayBuffer) {
                return Promise.resolve(arrayBuffer);
            });
        }

        return Promise.resolve(response);
    });
}

var API_MW_SYMBOL = Symbol('Call_API');
var netAvailable = true;
function setNetAvailable(value) {
    netAvailable = value;
}

var Messages = {};

function setMessage(messageNetUnavailble, messageUnreach, messageUnknown, messageClientRequest) {
    Object.assign(Messages, { messageNetUnavailble: messageNetUnavailble, messageUnreach: messageUnreach, messageUnknown: messageUnknown, messageClientRequest: messageClientRequest });
}

var EventTable = {};

function execEvent(type, response, antiType) {
    var callbacks = void 0;
    if (EventTable[type] && EventTable[type] instanceof Array && EventTable[type].length > 0) {
        callbacks = EventTable[type];
        delete EventTable[type];
    }
    if (EventTable[antiType]) {
        // 将对应的反回调清空
        delete EventTable[antiType];
    }
    if (callbacks) {
        callbacks.forEach(function (callback) {
            callback(response);
        });
    }
}

// A Redux middleware that interprets actions with API_MW_SYMBOL info specified.
// Performs the call and promises when such actions are dispatched.
var apiMiddleware = function apiMiddleware(fortify) {
    return function (_ref) {
        var dispatch = _ref.dispatch,
            getState = _ref.getState;
        return function (next) {
            return function (action) {
                var callAPI = action[API_MW_SYMBOL];

                if (typeof callAPI === 'undefined') {
                    return next(action);
                }

                var endpoint = callAPI.endpoint;
                var schema = callAPI.schema,
                    types = callAPI.types,
                    init = callAPI.init;


                if (typeof endpoint === 'function') {
                    endpoint = endpoint(getState());
                }

                if (typeof endpoint !== 'string') {
                    throw new Error('Specify a string endpoint URL.');
                }
                if (!schema) {
                    // throw new Error('Specify one of the exported Schemas.');
                }
                if (!Array.isArray(types) || types.length !== 3) {
                    throw new Error('Expected an array of three action types.');
                }
                if (!types.every(function (type) {
                    return typeof type === 'string';
                })) {
                    throw new Error('Expected action types to be strings.');
                }

                if (init != null && typeof init !== 'object') {
                    throw new Error("属性init必须是对象形式");
                }

                function actionWith(data) {
                    var finalAction = Object.assign({}, action, data);
                    delete finalAction[API_MW_SYMBOL];
                    return finalAction;
                }

                var requestType = types[0],
                    successType = types[1],
                    failureType = types[2];


                if (!netAvailable) {
                    return Promise.reject(next({
                        type: failureType,
                        error: {
                            message: Messages.messageNetUnavailble || '不明错误'
                        }
                    }));
                }

                next(actionWith({ type: requestType }));

                return callApi(endpoint, init, schema, fortify).then(function (response) {
                    var successAction = actionWith({
                        response: response,
                        type: successType
                    });
                    var result = next(successAction);
                    execEvent(successType, successAction, failureType);
                    return result;
                }, function (err) {
                    var error = err ? err instanceof Error ? { // 似乎唯一有可能返回Error对象就是因为网络无法连接
                        message: Messages.messageUnreach || '无法访问服务器'
                    } : err : {
                        message: Messages.messageNetUnavailble || '不明错误'
                    };
                    var failureAction = actionWith({
                        type: failureType,
                        error: error
                    });
                    var result = next(failureAction);
                    execEvent(failureType, failureAction, successType);
                    return Promise.reject(result);
                });
            };
        };
    };
};

function addEvent(type, callback) {
    if (!callback || typeof callback !== 'function') {
        return;
    }
    if (EventTable[type] && EventTable[type] instanceof Array) {
        EventTable[type].push(callback);
        return;
    }
    EventTable[type] = [callback];
}

function removeEvent(type, callback) {
    if (!callback || typeof callback !== 'function') {
        return;
    }
    if (EventTable[type] && EventTable[type] instanceof Array) {
        var idx = EventTable[type].findIndex(callback);
        if (idx !== -1) {
            EventTable[type].splice(idx, 1);
        }
    }
}

module.exports = {
    API_MW_SYMBOL: API_MW_SYMBOL,
    apiMiddleware: apiMiddleware,
    setNetAvailable: setNetAvailable,
    setMessage: setMessage,
    addEvent: addEvent,
    removeEvent: removeEvent,
    setFetch: setFetch
};