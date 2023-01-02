require('dotenv').config();

const { hasProps } = require('./obj-utils');

let isDebugging = false;

const log = function () {
    if (isDebugging)
        console.log(...arguments);
}

const logEr = function () {
    if (isDebugging)
        console.error(...arguments);
}

const setDebugging = (debug) => {
    isDebugging = debug;
};

const logPropsOf = (label, obj, indent = 2) => {
    if (isDebugging && hasProps(obj)) {
        for (var i = 0; i < indent; i++)
            console.group();
        console.log(label);
        console.dir(obj, { compact: false, colors: true });
        for (var i = 0; i < indent; i++)
            console.groupEnd();
    }
}

const logRequest = (req, res, next) => {
    log('');
    log(">>", req.method, ":", req.originalUrl, "from:", req.ip);
    next();
}

const logParams = (req, res, next) => {
    logPropsOf('req.params', req.params);
    next();
};

const logQuery = (req, res, next) => {
    logPropsOf('req.query', req.query);
    next();
};

const logBody = (req, res, next) => {
    logPropsOf('req.body', req.body);
    next();
}

/**
 * A middleware generator that will log req object base on set propertyName or options.
 * @param {String} propertyName the property of req to log.
 * @param {Object}  options set option flase
 * @description available options default: { declare = true, body = false, query = false, params = false, reqProps = []}
 * @returns a middleware that logs req object based on set propertyName or options.
 */
function logReq({ declare = true, body = false, query = false, params = false, reqProps = [] }) {
    if (typeof arguments[0] == 'string')
        reqProps.push(arguments[0]);
    else if (arguments[0] instanceof Array)
        reqProps.push(...arguments[0]);
    else if (!typeof arguments[0] == 'object')
        throw TypeError("Only accepts a propertyName (string) or options (object) or listOfProperyNames[]");

    for (let i = 1; i < arguments.length; i++)
        if (typeof arguments[i] == 'string' || typeof arguments[i] == 'number')
            reqProps.push(arguments[i]);

    const declareReq = (req) => {
        log('- - - - - - - - - - - - - - - - - - - - - - - - - - - -');
        log(">> REQUEST: ", req.method, ":", req.originalUrl, "from", req.ip);
    }
    return (req, res, next) => {
        declare && declareReq(req);
        query && logPropsOf('query', req.query);
        params && logPropsOf('params', req.params);
        body && logPropsOf('body', req.body);
        if (reqProps.length > 0)
            for (let prop of reqProps)
                logPropsOf(prop, req[prop]);
        next();
    }
}

/**
 * A middleware for logging the response.
 */
function logRes(req, res, next) {
    const sendInterceptor = (res, send) => (content) => {
        res.content = content;
        send.apply(res, [content]);
    };

    res.send = sendInterceptor(res, res.send);

    const onFinish = () => {
        log("<< RESPONSE: ");
        console.group();
        if (res.get('content-type').split('; ')[0] == 'application/json')
            logPropsOf('json object:', JSON.parse(res.content));
        else
            log(res.content);
        console.groupEnd();
        log('* * * * * * * * * * * * * * * * * * * * * * * * * * * *');
        res.removeListener('finish', onFinish);
        res.removeListener('close', onFinish);
        next();
    }

    res.on('finish', onFinish);
    res.on('close', onFinish);
    next();
}

module.exports = {
    setDebugging,
    log,
    logEr,
    logRequest,
    logParams,
    logBody,
    logQuery,
    logPropsOf,
    logReq,
    logRes
};