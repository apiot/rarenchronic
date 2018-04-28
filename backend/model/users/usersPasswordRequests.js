const _ = require('lodash');
const moment = require('moment');

const db = require('../../db');
const helpers = require('./../helpers');

const { PASSWORD_REQUEST_DURATION } = require('../../commons/consts/accounts');
const dates = require('../../commons/dates');

const TABLE_NAME = 'users_password_requests';
const INDEX_NAME = 'users_paswword_requests_indexes';

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'id BIGINT UNSIGNED UNIQUE NOT NULL AUTO_INCREMENT, '
        + 'user_id BIGINT UNSIGNED NOT NULL, '
        + 'new_password TEXT NOT NULL, '
        + 'created DATETIME NOT NULL, '
        + 'expired DATETIME NOT NULL, '
        + 'FOREIGN KEY (user_id) REFERENCES users(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (user_id)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

const addPasswordRequest = (userId, password, expired) => {
    const query = `INSERT INTO ${TABLE_NAME}`
    + ' (user_id, new_password, created, expired)'
    + ' VALUES (?, ?, ?, ?)';

    const now = dates.now();

    const expiredDate = _.isNil(expired)
        ? moment.utc().add(PASSWORD_REQUEST_DURATION, 'minutes')
        : expired;

    return db.insertOne(query, [userId, password, now, dates.toSQLDate(expiredDate)]);
};

const getPasswordRequest = (userId) => {
    const now = dates.now();
    const query = `SELECT * FROM ${TABLE_NAME}`
        + ' WHERE user_id = ? AND (expired IS NULL OR expired > ?) ';
    const notFoundMessage = 'No password request available.';

    const getLastPasswordRequest = passwordRequests => _(passwordRequests)
        .sortBy(passwordRequest => passwordRequest.created)
        .last();

    return db.selectMany(query, [userId, now], notFoundMessage)
        .then(getLastPasswordRequest);
};

const deleteByUserId = (userId) => {
    const query = `DELETE FROM ${TABLE_NAME} WHERE user_id = ?`;

    return db.deleteOne(query, [userId]);
};

module.exports = {
    addPasswordRequest,
    createTable,
    deleteByUserId,
    getPasswordRequest,
    dropTable,
    truncateTable,
};
