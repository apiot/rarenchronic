const isJoiError = (err, req, res, next) => {
    if (err.isJoi) {
        res.status(400);
        res.send({
            message: err.details[0].message
        });
    } else {
        next(err);
    }
};

/**
 * @param {object} err: Error(message)
 */
const isErrorWithCode = (err, req, res, next) => {
    if (err.code && err.code >= 400 && err.code <= 599) {
        // eslint-disable-next-line
        console.error(err);
        const { code, message, name } = err;
        /*
            400: bad request
            403: not authorized
            404: not found
            500: server error
            520: SQL error
            530: DBInconsistencyError
            550: EmailError
        */
        res.status(code);
        res.send({ message: message || name });
    } else {
        next(err);
    }
};

const isNotFound = (req, res) => {
    res.sendStatus(404);
};

module.exports = {
    isErrorWithCode,
    isJoiError,
    isNotFound,
};
