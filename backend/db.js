const _ = require('lodash');
const mysql = require('mysql');

const { DBInconsistencyError, NotFound, SQLError } = require('./commons/errors');

const state = {
    pool: null,
};

const connect = (done) => {
    state.pool = mysql.createPool({
        host: process.env.RARENCHR_MYSQL_HOST,
        user: process.env.RARENCHR_MYSQL_USER,
        password: process.env.RARENCHR_MYSQL_PASSWORD,
        database: process.env.RARENCHR_MYSQL_DATABASE,
    });

    done();
};

const query = (sqlQuery, args) => new Promise((resolve, reject) => state.pool
    .query(sqlQuery, args, (err, results) => {
        if (err) {
            return reject(err);
        }

        return resolve(results);
    }));

const end = () => new Promise((resolve, reject) => {
    state.pool.end((err) => {
        if (err) {
            return reject(err);
        }

        return resolve();
    });
});

const insertOne = (request, values, errorMessage = '') => query(request, values)
    .then((sqlResult) => {
        if (sqlResult.affectedRows === 1) {
            return sqlResult.insertId;
        }

        throw new SQLError(errorMessage);
    });

const updateOne = (request, values, notFoundMessage = '') => query(request, values)
    .then((sqlResult) => {
        const { affectedRows } = sqlResult;

        switch (affectedRows) {
        case 0: throw new NotFound(notFoundMessage, request, values);
        case 1: return true;
        default: throw new DBInconsistencyError();
        }
    });

const updateMany = (request, values, notFoundMessage = '') => query(request, values)
    .then((sqlResult) => {
        if (sqlResult.affectedRows > 0) {
            return sqlResult.affectedRows;
        }

        throw new NotFound(notFoundMessage, request, values);
    });

const deleteOne = (request, values, notFoundMessage = '') => query(request, values)
    .then((sqlResult) => {
        const { affectedRows } = sqlResult;

        switch (affectedRows) {
        case 0: throw new NotFound(notFoundMessage, request, values);
        case 1: return true;
        default: throw new DBInconsistencyError();
        }
    });

const deleteMany = (request, values, notFoundMessage = '') => query(request, values)
    .then((sqlResult) => {
        if (sqlResult.affectedRows > 0) {
            return sqlResult.affectedRows;
        }

        throw new NotFound(notFoundMessage, request, values);
    });

const selectOne = (request, values, notFoundMessage = '') => query(request, values)
    .then((sqlResult) => {
        const resultLength = sqlResult.length;

        switch (resultLength) {
        case 0: throw new NotFound(notFoundMessage, request, values);
        case 1: return _.first(sqlResult);
        default: throw new DBInconsistencyError();
        }
    });

const selectMany = (request, values, notFoundMessage = '') => query(request, values)
    .then((sqlResult) => {
        if (sqlResult.length > 0) {
            return sqlResult;
        }

        throw new NotFound(notFoundMessage);
    });

module.exports = {
    connect,
    query,
    end,
    deleteMany,
    deleteOne,
    insertOne,
    selectMany,
    selectOne,
    updateMany,
    updateOne,

};
