const db = require('../../db');
const helpers = require('./../helpers');

const TABLE_NAME = 'articles_relation_categories';
const INDEX_NAME = 'articles_relation_categories_indexes';

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'article_id BIGINT UNSIGNED NOT NULL, '
        + 'category_id BIGINT UNSIGNED NOT NULL, '
        + 'FOREIGN KEY (article_id) REFERENCES articles(id), '
        + 'FOREIGN KEY (category_id) REFERENCES articles_categories(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (article_id, category_id)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

module.exports = {
    createTable,
    dropTable,
    truncateTable,
};
