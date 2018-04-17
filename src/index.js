/**
 * Created by lavystord on 17/2/10.
 */

import { apiMiddleware, setNetAvailable, setMessage, addEvent, removeEvent, API_MW_SYMBOL } from './apiMiddleware';
import { errorMiddleware, registerErrorHandler } from './errorMiddleware';
import { genPopulateHttpHeaderMiddleware, POPULATE_HTTP_HEADER_MW_SYMBOL } from './populateHttpHeaderMiddleware';

module.exports = {
    apiMiddleware,
    errorMiddleware,
    genPopulateHttpHeaderMiddleware,
    //
    setNetAvailable,
    setMessage,
    addEvent,
    removeEvent,
    API_MW_SYMBOL,
    //
    POPULATE_HTTP_HEADER_MW_SYMBOL,
    //
    registerErrorHandler,
};
