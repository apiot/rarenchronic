const db = require('../../db');
const helpers = require('./../helpers');

const TABLE_NAME = 'articles_tags';
const INDEX_NAME = 'articles_tags_indexes';

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'id BIGINT UNSIGNED UNIQUE NOT NULL, '
        + 'name VARCHAR(50) NOT NULL, '
        + 'name_regex VARCHAR(50) NOT NULL, '
        + 'created DATETIME NOT NULL, '
        + 'deleted BOOLEAN NOT NULL, '
        + 'viewed_by_admin BOOLEAN NOT NULL '
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
