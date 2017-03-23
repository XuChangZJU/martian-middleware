/**
 * Created by lavystord on 17/2/10.
 */

module.exports = {
    apiMiddleware: require('./src/apiMiddleware').apiMiddleware,
    errorMiddleware: require('./src/errorMiddleware').errorMiddleware,
    genPopulateHttpHeaderMiddleware: require('./src/populateHttpHeaderMiddleware').genPopulateHttpHeaderMiddleware,
    //
    setNetAvailable: require('./src/apiMiddleware').setNetAvailable,
    addEvent: require('./src/apiMiddleware').addEvent,
    removeEvent: require('./src/apiMiddleware').removeEvent,
    API_MW_SYMBOL: require('./src/apiMiddleware').API_MW_SYMBOL,
    //
    POPULATE_HTTP_HEADER_MW_SYMBOL: require('./src/populateHttpHeaderMiddleware').POPULATE_HTTP_HEADER_MW_SYMBOL,
    //
    registerErrorHandler: require('./src/errorMiddleware').registerErrorHandler,
};
