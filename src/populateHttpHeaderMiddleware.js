/**
 * Created by Administrator on 2016/3/14.
 */
'use strict'
var Symbol = require('es6-symbol');
//import merge from 'lodash/merge';
const merge = require("lodash/merge");


const POPULATE_HTTP_HEADER_MW_SYMBOL = Symbol('PREQUEST_MIDDLEWARE');
// import {API_MW_SYMBOL} from 'api-middleware';
const API_MW_SYMBOL = require("./apiMiddleware").API_MW_SYMBOL;

/**
 *  此中间件用于构建http header，这个域(在state树上)的值由创建这个middleware的回调函数决定。
 *  此中间件在完成操作后会继续调用apiMiddleware中间件执行网络请求
 * @param genHeader
 * @returns {Function}
 */
function genPopulateHttpHeaderMiddleware(genHeader) {

    return ({dispatch, getState}) => next => action  => {
        const prequest = action[POPULATE_HTTP_HEADER_MW_SYMBOL];

        if (typeof prequest === 'undefined') {
            return next(action);
        }

        const request = prequest[API_MW_SYMBOL];

        if(typeof  request != 'object') {
            throw new Error("Specify a request in [API_MW_SYMBOL] attribute");
        }

        // 暂时只加入access_token域在头上
        prequest[API_MW_SYMBOL].init = merge({}, request.init,{
            "headers": genHeader(getState())
        });

        return next(prequest);
    }

}


module.exports = {
    POPULATE_HTTP_HEADER_MW_SYMBOL,
    genPopulateHttpHeaderMiddleware
}
