const db = require('../../db');
const helpers = require('../helpers');

const dates = require('../../commons/dates');

const TABLE_NAME = 'ip_banned';
const INDEX_NAME = 'ip_banned_indexes';

const BANS_TYPE = {
    BACK_OFFICE: 'backOffice',
    FRONT_OFFICE: 'frontOffice',
    ARTICLES_PRIVATE: 'articlesPrivate',
    ARTICLES_COMMENT_HARD: 'articlesCommentHard',
    ARTICLES_COMMENT_SOFT: 'articlesCommentSoft',
    MESSAGES_PRIVATE: 'messagesPrivate',
    CHAT_HARD: 'chatHard', // can't read the chat
    CHAT_SOFT: 'chatSoft', // can't write in the chat
};

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'ip VARCHAR(100) NOT NULL, '
        + 'user_id BIGINT UNSIGNED, ' // optional
        + 'comment TEXT, ' // optional
        + 'created DATETIME NOT NULL, '
        + 'expired DATETIME, '
        + 'FOREIGN KEY (user_id) REFERENCES users(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (ip, user_id)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

const addBannedIp = (ip, userId = null, comment = null, expired = null) => {
    const now = dates.now();
    const addQuery = `INSERT INTO ${TABLE_NAME}`
        + ' (ip, user_id, comment, created, expired)'
        + ' VALUES (?, ?, ?, ?, ?)';

    return db.insertOne(addQuery, [ip, userId, comment, now, expired]);
};

const findBannedIp = (ip) => {
    const now = dates.now();
    const findQuery = `SELECT * FROM ${TABLE_NAME} WHERE`
        + ' ip = ? AND (expired > ? OR expired = NULL)';

    return db.selectMany(findQuery, [ip, now]);
};

module.exports = {
    addBannedIp,
    findBannedIp,
    createTable,
    dropTable,
    truncateTable,
    BANS_TYPE,
};
