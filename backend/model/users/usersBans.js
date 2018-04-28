const db = require('../../db');
const helpers = require('./../helpers');

const dates = require('../../commons/dates');

const TABLE_NAME = 'users_bans';
const INDEX_NAME = 'users_bans_indexes';

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'user_id BIGINT UNSIGNED NOT NULL, '
        + 'type VARCHAR(50) NOT NULL, '
        + 'created DATETIME NOT NULL, '
        + 'expired DATETIME, '
        + 'FOREIGN KEY (user_id) REFERENCES users(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (user_id)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

const getUserBans = (userId) => {
    const now = dates.now();
    const findBans = `SELECT * FROM ${TABLE_NAME} WHERE`
        + ' user_id = ? AND (expired IS NULL OR expired > ?)';
    const findBansValues = [userId, now];

    return db.selectMany(findBans, findBansValues);
};

module.exports = {
    createTable,
    getUserBans,
    dropTable,
    truncateTable,
};
