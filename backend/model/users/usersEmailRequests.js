const moment = require('moment');

const db = require('../../db');
const helpers = require('./../helpers');

const { NotFound } = require('../../commons/errors');
const dates = require('../../commons/dates');
const { EMAIL_REQUEST_DURATION } = require('../../commons/consts/profile');

const TABLE_NAME = 'users_email_requests';
const INDEX_NAME = 'users_email_requests_indexes';

/*
 * Only one email request per user is allowed simultaneously
 */

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'id BIGINT UNSIGNED UNIQUE NOT NULL AUTO_INCREMENT , '
        + 'user_id BIGINT UNSIGNED NOT NULL, '
        + 'new_email TEXT NOT NULL, '
        + 'created DATETIME NOT NULL, '
        + 'expired DATETIME NOT NULL, '
        + 'activation_key VARCHAR(200) NOT NULL, '
        + 'FOREIGN KEY (user_id) REFERENCES users(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (user_id)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

const getEmailRequestToActivate = (activationKey) => {
    const query = `SELECT * FROM ${TABLE_NAME}`
        + ' WHERE activation_key = ? ';

    return db.selectOne(query, [activationKey]);
};

const deleteRequests = (userId) => {
    const query = `DELETE FROM ${TABLE_NAME} WHERE user_id = ?`;

    return db.deleteMany(query, [userId])
        .catch((err) => {
            if (err instanceof NotFound) {
                return 0;
            }

            throw err;
        });
};

const addEmailRequest = (userId, email, activationKey) => {
    const now = dates.now();
    const expired = moment.utc().add(EMAIL_REQUEST_DURATION, 'seconds');
    const query = `INSERT INTO ${TABLE_NAME}`
        + ' (user_id, new_email, created, expired, activation_key)'
        + ' VALUES (?, ?, ?, ?, ?)';
    const values = [userId, email.trim(), now, dates.toSQLDate(expired), activationKey];

    return db.insertOne(query, values);
};

const hasEmailRequest = (userId) => {
    const now = dates.now();
    const query = `SELECT * FROM ${TABLE_NAME}`
        + ' WHERE user_id = ? AND (expired IS NULL OR expired > ?)';

    return db.selectOne(query, [userId, now]);
};

module.exports = {
    createTable,
    dropTable,
    truncateTable,
    getEmailRequestToActivate,
    deleteRequests,
    addEmailRequest,
    hasEmailRequest,
};
