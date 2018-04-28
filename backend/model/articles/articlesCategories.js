const db = require('../../db');
const helpers = require('./../helpers');

const TABLE_NAME = 'articles_categories';
const INDEX_NAME = 'articles_categories_indexes';

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'id BIGINT UNSIGNED UNIQUE NOT NULL, '
        + 'user_id BIGINT UNSIGNED NOT NULL, '
        + 'name VARCHAR(50) NOT NULL, '
        + 'name_regex VARCHAR(50) NOT NULL, '
        + 'created DATETIME NOT NULL, '
        + 'deleted BOOLEAN NOT NULL, '
        + 'FOREIGN KEY (user_id) REFERENCES users(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (id, name_regex)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

module.exports = {
    createTable,
    dropTable,
    truncateTable,
};
