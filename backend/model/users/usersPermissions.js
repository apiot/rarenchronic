const db = require('../../db');
const helpers = require('../helpers');

const dates = require('../../commons/dates');

const TABLE_NAME = 'users_permissions';
const INDEX_NAME = 'users_permissions_indexes';

/*
 * default PERMISSIONS sets
 */
const USER_PERMISSIONS = {
    DEFAULT: 'user.default',
};
const FOUNDATOR_PERMISSIONS = {
    DEFAULT: 'foundator.default',
};
const ADMINISTRATOR_PERMISSIONS = {
    DEFAULT: 'administrator.default',
};
const MODERATOR_PERMISSIONS = {
    DEFAULT: 'moderator.default',
};
const PHYSICIAN_PERMISSIONS = {
    DEFAULT: 'physician.default',
};

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'user_id BIGINT UNSIGNED NOT NULL, '
        + 'permission VARCHAR(50) NOT NULL, '
        + 'created DATETIME NOT NULL, '
        + 'expired DATETIME, '
        + 'FOREIGN KEY (user_id) REFERENCES users(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (user_id)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

const getUserPermissions = (userId) => {
    const now = dates.now();
    const findPermissions = `SELECT * FROM ${TABLE_NAME} WHERE`
        + ' user_id = ? AND (expired IS NULL OR expired > ?)';
    const findPermissionsValues = [userId, now];

    return db.selectMany(findPermissions, findPermissionsValues);
};

const addPermissionsUser = (userId) => {
    const now = dates.now();
    const query = `INSERT INTO ${TABLE_NAME} (user_id, permission, created) VALUES (?, ?, ?)`;

    return db.insertOne(query, [userId, USER_PERMISSIONS.DEFAULT, now]);
};

module.exports = {
    addPermissionsUser,
    createTable,
    getUserPermissions,
    dropTable,
    truncateTable,
};
