const db = require('../../db');
const helpers = require('./../helpers');

const TABLE_NAME = 'articles_comments';
const INDEX_NAME = 'articles_comments_indexes';

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'id BIGINT UNSIGNED UNIQUE NOT NULL, '
        + 'user_id BIGINT UNSIGNED NOT NULL, '
        + 'article_id BIGINT UNSIGNED, '
        + 'comment_id BIGINT UNSIGNED, '
        + 'comment TEXT NOT NULL, '
        + 'active BOOLEAN NOT NULL, ' // if article is not deleted
        + 'created DATETIME NOT NULL, '
        + 'deleted BOOLEAN NOT NULL, '
        + 'viewed_by_admin BOOLEAN NOT NULL, '
        + 'FOREIGN KEY (user_id) REFERENCES users(id), '
        + 'FOREIGN KEY (article_id) REFERENCES articles(id), '
        + 'FOREIGN KEY (comment_id) REFERENCES articles_comments(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (id, article_id, created)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

module.exports = {
    createTable,
    dropTable,
    truncateTable,
};
