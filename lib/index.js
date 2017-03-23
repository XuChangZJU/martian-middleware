'use strict';

/**
 * Created by lavystord on 17/2/10.
 */

module.exports = {
    apiMiddleware: require('./apiMiddleware').apiMiddleware,
    errorMiddleware: require('./errorMiddleware').errorMiddleware,
    genPopulateHttpHeaderMiddleware: require('./populateHttpHeaderMiddleware').genPopulateHttpHeaderMiddleware,
    //
    setNetAvailable: require('./apiMiddleware').setNetAvailable,
    addEvent: require('./apiMiddleware').addEvent,
    removeEvent: require('./apiMiddleware').removeEvent,
    API_MW_SYMBOL: require('./apiMiddleware').API_MW_SYMBOL,
    //
    POPULATE_HTTP_HEADER_MW_SYMBOL: require('./populateHttpHeaderMiddleware').POPULATE_HTTP_HEADER_MW_SYMBOL,
    //
    registerErrorHandler: require('./errorMiddleware').registerErrorHandler
};