const db = require('../../db');
const helpers = require('./../helpers');

const TABLE_NAME = 'messages';
const INDEX_NAME = 'messages_indexes';

/*
 * Private messages between users
 */
const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'id BIGINT UNSIGNED UNIQUE NOT NULL AUTO_INCREMENT , '
        + 'sender BIGINT UNSIGNED NOT NULL, '
        + 'receiver BIGINT UNSIGNED NOT NULL, '
        + 'message TEXT NOT NULL, '
        + 'created DATETIME NOT NULL, '
        + 'deleted BOOLEAN NOT NULL, '
        + 'viewed_by_receiver BOOLEAN NOT NULL, '
        + 'viewed_by_admin BOOLEAN NOT NULL, '
        + 'FOREIGN KEY (sender) REFERENCES users(id), '
        + 'FOREIGN KEY (receiver) REFERENCES users(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (sender, receiver)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

module.exports = {
    createTable,
    dropTable,
    truncateTable,
};
