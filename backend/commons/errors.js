class BadRequest extends Error {
    constructor(message) {
        super(message);

        this.name = this.constructor.name;
        this.code = 400;
    }
}

class NotAuthorized extends Error {
    constructor(message) {
        super(message);

        this.name = this.constructor.name;
        this.code = 403;
    }
}

class NotFound extends Error {
    constructor(message, query, values) {
        super(message);

        this.name = this.constructor.name;
        this.code = 404;
        this.query = query;
        this.values = values;
    }
}

class ExpiredError extends Error {
    constructor(message) {
        super(message);

        this.name = this.constructor.name;
        this.code = 460;
    }
}

class FileError extends Error {
    constructor(message) {
        super(message);

        this.name = this.constructor.name;
        this.code = 480;
    }
}

class ServerError extends Error {
    constructor(message) {
        super(message);

        this.name = this.constructor.name;
        this.code = 500;
    }
}

class SQLError extends Error {
    constructor(message) {
        super(message);

        this.name = this.constructor.name;
        this.code = 520;
    }
}

class DBInconsistencyError extends Error {
    constructor(message) {
        super(message);

        this.name = this.constructor.name;
        this.code = 530;
    }
}

class EmailError extends Error {
    constructor(message) {
        super(message);

        this.name = this.constructor.name;
        this.code = 550;
    }
}

module.exports = {
    DBInconsistencyError,
    BadRequest,
    EmailError,
    FileError,
    NotAuthorized,
    NotFound,
    ExpiredError,
    ServerError,
    SQLError,
};
