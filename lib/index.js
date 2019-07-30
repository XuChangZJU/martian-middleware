'use strict';

var _apiMiddleware = require('./apiMiddleware');

var _errorMiddleware = require('./errorMiddleware');

var _populateHttpHeaderMiddleware = require('./populateHttpHeaderMiddleware');

module.exports = {
    apiMiddleware: _apiMiddleware.apiMiddleware,
    errorMiddleware: _errorMiddleware.errorMiddleware,
    genPopulateHttpHeaderMiddleware: _populateHttpHeaderMiddleware.genPopulateHttpHeaderMiddleware,
    //
    setNetAvailable: _apiMiddleware.setNetAvailable,
    setMessage: _apiMiddleware.setMessage,
    setFetch: _apiMiddleware.setFetch,
    addEvent: _apiMiddleware.addEvent,
    removeEvent: _apiMiddleware.removeEvent,
    API_MW_SYMBOL: _apiMiddleware.API_MW_SYMBOL,
    //
    POPULATE_HTTP_HEADER_MW_SYMBOL: _populateHttpHeaderMiddleware.POPULATE_HTTP_HEADER_MW_SYMBOL,
    //
    registerErrorHandler: _errorMiddleware.registerErrorHandler
}; /**
    * Created by lavystord on 17/2/10.
    */