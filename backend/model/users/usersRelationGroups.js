const db = require('../../db');
const helpers = require('./../helpers');

const groups = require('../groups/groups');

const TABLE_NAME = 'users_relation_groups';
const INDEX_NAME = 'users_relation_groups_indexes';

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'user_id BIGINT UNSIGNED NOT NULL, '
        + 'group_id BIGINT UNSIGNED NOT NULL, '
        + 'FOREIGN KEY (user_id) REFERENCES users(id), '
        + 'FOREIGN KEY (group_id) REFERENCES groups(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (user_id, group_id)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

const addRelationUser = userId => groups.getUsersGroupId()
    .then((group) => {
        const { id } = group;
        const query = `INSERT INTO ${TABLE_NAME} (user_id, group_id) VALUES (?, ?)`;

        return db.insertOne(query, [userId, id]);
    });

const getUserGroups = (userId) => {
    const findGroups = `SELECT * FROM ${TABLE_NAME} AS related, groups WHERE`
        + ' related.user_id = ? AND groups.id = related.group_id';
    const findGroupsValues = [userId];

    return db.selectMany(findGroups, findGroupsValues);
};

module.exports = {
    addRelationUser,
    createTable,
    getUserGroups,
    dropTable,
    truncateTable,
};
