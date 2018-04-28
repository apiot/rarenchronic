const db = require('../../db');
const helpers = require('./../helpers');

const TABLE_NAME = 'users_blocks';
const INDEX_NAME = 'users_blocks_indexes';

/*
 * When a user wants to block another user:
 * - for private message
 * - for articles’ comments
 */
const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'user_id BIGINT UNSIGNED NOT NULL, '
        + 'blocked_user_id BIGINT UNSIGNED NOT NULL, '
        + 'comment TEXT, '
        + 'created DATETIME NOT NULL, '
        + 'expired DATETIME, '
        + 'FOREIGN KEY (user_id) REFERENCES users(id), '
        + 'FOREIGN KEY (blocked_user_id) REFERENCES users(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (user_id, blocked_user_id)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

module.exports = {
    createTable,
    dropTable,
    truncateTable,
};
