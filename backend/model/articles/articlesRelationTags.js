const db = require('../../db');
const helpers = require('./../helpers');

const TABLE_NAME = 'articles_relation_tags';
const INDEX_NAME = 'articles_relation_tags_indexes';

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'article_id BIGINT UNSIGNED NOT NULL, '
        + 'tag_id BIGINT UNSIGNED NOT NULL, '
        + 'FOREIGN KEY (article_id) REFERENCES articles(id), '
        + 'FOREIGN KEY (tag_id) REFERENCES articles_tags(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (article_id, tag_id)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);


module.exports = {
    createTable,
    dropTable,
    truncateTable,
};
