const db = require('../../db');
const helpers = require('./../helpers');

const TABLE_NAME = 'admin_comments';
const INDEX_NAME = 'admin_comments_indexes';

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'id BIGINT UNSIGNED UNIQUE NOT NULL AUTO_INCREMENT , '
        + 'user_id BIGINT UNSIGNED NOT NULL, '
        + 'type VARCHAR(100), ' // external table
        + 'ext_id BIGINT UNSIGNED NOT NULL, ' // id on the external table
        + 'comment TEXT, '
        + 'created DATETIME NOT NULL, '
        + 'FOREIGN KEY (user_id) REFERENCES users(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (user_id, type, ext_id)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

module.exports = {
    createTable,
    dropTable,
    truncateTable,
};
