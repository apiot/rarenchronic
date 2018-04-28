const db = require('../../db');
const helpers = require('./../helpers');
const dates = require('../../commons/dates');

const TABLE_NAME = 'groups';
const INDEX_NAME = 'groups_indexes';

const { GROUPS_SET } = require('../../commons/consts/groups');

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'id BIGINT UNSIGNED NOT NULL UNIQUE AUTO_INCREMENT, '
        + 'name VARCHAR(50) NOT NULL, '
        + 'created DATETIME NOT NULL '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (id, name)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

const addGroupsSet = () => {
    const now = dates.now();
    const query = `INSERT INTO ${TABLE_NAME} (name, created) VALUES (?, ?)`;

    const values = [
        [GROUPS_SET.USERS, now],
        [GROUPS_SET.FOUNDATORS, now],
        [GROUPS_SET.ADMINISTRATORS, now],
        [GROUPS_SET.MODERATORS, now],
        [GROUPS_SET.PHYSICIANS, now],
    ];

    db.insertOne(query, values[0])
        .then(() => db.insertOne(query, values[1]))
        .then(() => db.insertOne(query, values[3]))
        .then(() => db.insertOne(query, values[2]))
        .then(() => db.insertOne(query, values[4]));
};

const getUsersGroupId = () => {
    const query = `SELECT id FROM ${TABLE_NAME} WHERE name = ?`;

    return db.selectOne(query, [GROUPS_SET.USERS]);
};

module.exports = {
    addGroupsSet,
    createTable,
    getUsersGroupId,
    dropTable,
    truncateTable,
    GROUPS_SET,
};
