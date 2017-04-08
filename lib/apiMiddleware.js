'use strict';

/*
 import { Schema, arrayOf, normalize } from 'normalizr';
 import { camelizeKeys } from 'humps';
 import {errorCode} from "yr-domains";
 */

var _assign = require("lodash/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var normalizr = require("normalizr");
var Schema = normalizr.Schema,
    arrayOf = normalizr.arrayOf,
    normalize = normalizr.normalize;

var humps = require("humps");
var camelizeKeys = humps.camelizeKeys;


var errorCode = require('martian-domain/lib/constants/errorCode');
//import 'isomorphic-fetch'
var Symbol = require('es6-symbol');


function callApi(apiEndPoint, init, schema) {

    return fetch(apiEndPoint, init).then(function (response) {
        return response.json().then(function (json) {
            return { json: json, response: response };
        });
    }).then(function (_ref) {
        var json = _ref.json,
            response = _ref.response;

        if (!response.ok || json.error != undefined) {
            // 为了避免运营商劫持，服务器可能以200的code来返回错误
            var error;
            if (json.error != undefined) {
                error = {
                    httpCode: response.status,
                    // ...json.error
                    code: json.error.code,
                    message: json.error.message
                };
            } else {
                error = {
                    httpCode: response.status,
                    code: errorCode.errorUndefined.code,
                    message: errorCode.errorUndefined.message
                };
            }
            return Promise.reject(error);
        }

        var camelizedJson = camelizeKeys(json);

        if (schema) {
            return Promise.resolve((0, _assign2["default"])({}, normalize(camelizedJson, schema)));
        } else {
            return Promise.resolve({
                result: camelizedJson
            });
        }
    });
}

var API_MW_SYMBOL = Symbol('Call_API');
var netAvailable = true;
function setNetAvailable(value) {
    netAvailable = value;
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
var apiMiddleware = function apiMiddleware(_ref2) {
    var dispatch = _ref2.dispatch,
        getState = _ref2.getState;
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
                var finalAction = (0, _assign2["default"])({}, action, data);
                delete finalAction[API_MW_SYMBOL];
                return finalAction;
            }

            var requestType = types[0],
                successType = types[1],
                failureType = types[2];


            if (!netAvailable) {
                return Promise.reject(next({
                    type: failureType,
                    error: errorCode.errorNetUnavailable
                }));
            }

            next(actionWith({ type: requestType }));

            return callApi(endpoint, init, schema).then(function (response) {
                var successAction = actionWith({
                    response: response,
                    type: successType
                });
                var result = next(successAction);
                execEvent(successType, successAction, failureType);
                return result;
            }, function (err) {
                var error = err ? err instanceof Error ? { // 似乎唯一有可能返回Error对象就是因为网络无法连接
                    code: errorCode.errorFailToAccessServer.code,
                    message: errorCode.errorFailToAccessServer.message
                } : err : {
                    code: errorCode.errorUndefined.code,
                    message: errorCode.errorUndefined.message
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
    addEvent: addEvent,
    removeEvent: removeEvent
};