const moment = require('moment');

const db = require('../../db');
const helpers = require('./../helpers');

const { TOKEN_DURATION } = require('../../commons/consts/accounts');
const dates = require('../../commons/dates');
const { generateToken, hashToken } = require('../../commons/crypto');

const TABLE_NAME = 'users_tokens';
const INDEX_NAME = 'users_tokens_indexes';

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'user_id BIGINT UNSIGNED NOT NULL, '
        + 'vendor ENUM(\'local\',\'google\',\'facebook\') NOT NULL, '
        + 'token VARCHAR(300) NOT NULL, '
        + 'refresh_token VARCHAR(300), '
        + 'user_vendor_id VARCHAR(300), '
        + 'created DATETIME NOT NULL, '
        + 'expired DATETIME, '
        + 'FOREIGN KEY (user_id) REFERENCES users(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (user_id, token)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

const addToken = (account) => {
    const now = dates.now();
    const expired = moment.utc().add(TOKEN_DURATION, 'seconds');
    const { id, password, salt } = account;
    const token = generateToken(password, salt);
    const hashedToken = hashToken(token, salt);
    const query = `INSERT INTO ${TABLE_NAME}`
        + ' (user_id, vendor, token, created, expired) VALUES'
        + ' (?, "local", ?, ?, ?)';

    return db.insertOne(query, [id, hashedToken, now, dates.toSQLDate(expired)])
        .then(() => token);
};

const getAvailableTokens = (userId) => {
    const now = dates.now();
    const query = `SELECT * FROM ${TABLE_NAME}`
        + ' WHERE user_id = ? AND (expired IS NULL OR expired > ?)';

    return db.selectMany(query, [userId, now]);
};

const checkTokenExistence = (userId, token, salt) => {
    const now = dates.now();
    const hashedToken = hashToken(token, salt);

    const query = `SELECT * FROM ${TABLE_NAME} WHERE`
        + ' user_id = ? AND token = ?'
        + ' AND (expired IS NULL OR expired > ?)';
    const notFoundMessage = 'Wrong token.';

    return db.selectOne(query, [userId, hashedToken, now], notFoundMessage);
};

const deleteTokenByUserId = (account, token) => {
    const { id, salt } = account;
    const hashedToken = hashToken(token, salt);
    const query = `DELETE FROM ${TABLE_NAME}`
        + ' WHERE user_id = ? AND token = ?';

    return db.deleteOne(query, [id, hashedToken]);
};

const deleteAllTokensByUserId = (userId) => {
    const query = `DELETE FROM ${TABLE_NAME}`
        + ' WHERE user_id = ?';

    return db.deleteMany(query, [userId]);
};

const deleteConnexion = (account, token) => {
    const { id, salt } = account;
    const hashedToken = hashToken(token, salt);
    const query = `DELETE FROM ${TABLE_NAME}`
        + ' WHERE user_id = ? AND token <> ?';

    return db.deleteMany(query, [id, hashedToken]);
};

module.exports = {
    addToken,
    checkTokenExistence,
    createTable,
    deleteAllTokensByUserId,
    deleteConnexion,
    deleteTokenByUserId,
    dropTable,
    getAvailableTokens,
    truncateTable,
};
