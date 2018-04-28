const _ = require('lodash');

const db = require('../../db');
const helpers = require('./../helpers');

const dates = require('../../commons/dates');
const { formatStringToKebabText } = require('../../commons/utils');
const { ARTICLE_STATUS } = require('../../commons/consts/articles');
const { NotFound } = require('../../commons/errors');

const TABLE_NAME = 'articles';
const INDEX_NAME = 'articles_indexes';

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'id BIGINT UNSIGNED UNIQUE NOT NULL AUTO_INCREMENT, '
        + 'author BIGINT UNSIGNED NOT NULL, '
        + 'status VARCHAR(50) NOT NULL, '
        + 'img TEXT NOT NULL, ' // img url
        + 'title TEXT NOT NULL, '
        + 'url_title TEXT NOT NULL, '
        + 'content TEXT NOT NULL, '
        + 'comments_opened BOOLEAN NOT NULL, '
        + 'public BOOLEAN NOT NULL, '
        + 'created DATETIME NOT NULL, '
        + 'start DATETIME NOT NULL, '
        + 'end DATETIME, '
        + 'updated_by BIGINT UNSIGNED, '
        + 'updated DATETIME, '
        + 'deleted BOOLEAN NOT NULL, '
        + 'viewed_by_admin BOOLEAN NOT NULL, '
        + 'FOREIGN KEY (author) REFERENCES users(id), '
        + 'FOREIGN KEY (updated_by) REFERENCES users(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (id, author, status, created)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

const addArticle = (article) => {
    const { author, status, img, title, content, commentsOpened, isPublic, from, to } = article;
    const now = dates.now();
    const deleted = false;
    const viewedByAdmin = false;
    const urlTitle = formatStringToKebabText(title);
    const query = `INSERT INTO ${TABLE_NAME}`
        + ' (author, status, img, title, url_title, content, comments_opened,'
        + ' public, created, start, end, deleted, viewed_by_admin) VALUES'
        + ' (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    const values = [author, status, img, title, urlTitle, content, commentsOpened]
        .concat([isPublic, now, from, to, deleted, viewedByAdmin]);

    return db.insertOne(query, values);
};

const buildStatusesQuery = (statuses) => {
    if (!statuses.length) {
        return '';
    }

    const query = statuses.map(status => (`status = "${status}"`)).join(' OR ');

    return ` (${query})`;
};

const buildTitleQuery = title => title
    ? `title REGEXP ".*${_.escapeRegExp(title.trim().toLowerCase())}.*"`
    : '';

const buildIsPublicQuery = isPublic => {
    switch (isPublic.length) {
        case 1:
            return isPublic[0] === 'public'
                ? 'public = TRUE'
                : 'public = FALSE';
            break;
        case 2:
        case 0:
            return ''
            break;
    }
};

const getArticlesByUserCount = ({ categories, tags, statuses, title, isPublic }) => {
    const values = categories.concat(tags);
    const addWhere = values.length > 2 || statuses.length || title || isPublic.length === 1;
    const query = `SELECT count(*) as total FROM ${TABLE_NAME}`
    + (addWhere ? ' WHERE ' : '')
    + buildStatusesQuery(statuses)
    + (statuses.length && title ? ' AND ' : '')
    + buildTitleQuery(title)
    + ((title || statuses.length) && isPublic.length === 1 ? ' AND ': '')
    + buildIsPublicQuery(isPublic);

    return db.query(query, values)
        .then(sqlResults => sqlResults[0].total)
        .catch((err) => {
            if (err instanceof NotFound) {
                return 0;
            }

            throw err;
        });
};

const getArticlesByUser = ({ categories, tags, statuses, title, isPublic, offset, quantity }) => {
    const values = categories
        .concat(tags)
        .concat([offset, quantity]);
    const addWhere = values.length > 2 || statuses.length || title || isPublic.length === 1;
    const query = `SELECT * FROM ${TABLE_NAME}`
    + (addWhere ? ' WHERE ' : '')
    + buildStatusesQuery(statuses)
    + (statuses.length && title ? ' AND ' : '')
    + buildTitleQuery(title)
    + ((title || statuses.length) && isPublic.length === 1 ? ' AND ': '')
    + buildIsPublicQuery(isPublic)
    + ' LIMIT ?, ?';

    return db.query(query, values)
        .catch((err) => {
            if (err instanceof NotFound) {
                return [];
            }

            throw err;
        });
};

const getArticlesCategoriesByUserId = (userId) => {
 const query =  `SELECT cat.${TABLE_NAME} AS art`
    + ', articles_relation_categories AS rel, articles_categories AS cat'
    + ` WHERE art.author = ${userId} AND deleted = FALSE`

};

module.exports = {
    createTable,
    dropTable,
    truncateTable,
    addArticle,
    getArticlesByUserCount,
    getArticlesByUser,
    getArticlesCategoriesByUserId,
};
