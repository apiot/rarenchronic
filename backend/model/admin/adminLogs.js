const db = require('../../db');
const helpers = require('./../helpers');

const dates = require('../../commons/dates');
const { getIp, getUserAgent } = require('../../commons/utils');

const TABLE_NAME = 'admin_logs';
const INDEX_NAME = 'admin_logs_indexes';

const LOGS_TYPES = {
    ACCOUNTS: 'accounts',
};

const LOGS_CATEGORIES = {
    CREATE: 'create',
    LOGIN: 'login',
    LOGOUT: 'logout',
};

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'id BIGINT UNSIGNED UNIQUE NOT NULL AUTO_INCREMENT, '
        + 'user_id BIGINT UNSIGNED, '
        + 'type TEXT, '
        + 'category TEXT, '
        + 'message TEXT, '
        + 'created DATETIME NOT NULL, '
        + 'ip VARCHAR(100) NOT NULL, '
        + 'user_agent TEXT, '
        + 'FOREIGN KEY (user_id) REFERENCES users(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (user_id)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

const addAdminLog = (req, type, category, message) => {
    const { user = {} } = req;
    const now = dates.now();
    const userIp = getIp(req);
    const userAgent = getUserAgent(req);

    const addLog = `INSERT INTO ${TABLE_NAME}`
        + ' (user_id, type, category, message, created, ip, user_agent)'
        + ' VALUES (?, ?, ?, ?, ?, ?, ?)';
    const addLogValues = [user.id, type, category, message, now, userIp, userAgent];

    return db.insertOne(addLog, addLogValues);
};

module.exports = {
    addAdminLog,
    createTable,
    truncateTable,
    dropTable,
    LOGS_TYPES,
    LOGS_CATEGORIES,
};
