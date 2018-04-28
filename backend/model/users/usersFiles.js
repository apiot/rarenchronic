const _ = require('lodash');

const db = require('../../db');
const helpers = require('./../helpers');

const { NotFound, SQLError } = require('../../commons/errors');
const { forRegexText } = require('../../commons/utils');
const dates = require('../../commons/dates');

const TABLE_NAME = 'users_files';
const INDEX_NAME = 'users_files_indexes';

/*
 * File URL: /upload/:userId/fileIdentifier_YYYYMMDDHHMMSS_filename.extension
 */
const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'id BIGINT UNSIGNED NOT NULL UNIQUE AUTO_INCREMENT, '
        + 'user_id BIGINT UNSIGNED NOT NULL, '
        + 'name VARCHAR(200), '
        + 'name_regex VARCHAR(200), '
        + 'type TEXT NOT NULL, '
        + 'category TEXT, '
        + 'url TEXT, '
        + 'is_public BOOLEAN, '
        + 'required_permission VARCHAR(200), '
        + 'file_size BIGINT UNSIGNED NOT NULL,'
        + 'created DATETIME NOT NULL, '
        + 'FOREIGN KEY (user_id) REFERENCES users(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (user_id)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

const addFile = (userId, fileSize, mimeType, tempPath) => {
    const now = dates.now();
    const query = `INSERT INTO ${TABLE_NAME}`
        + ' (user_id, type, url, is_public, file_size, created)'
        + ' VALUES (?, ?, ?, TRUE, ?, ?)';

    return db.insertOne(query, [userId, mimeType, tempPath, fileSize, now]);
};

const hardDeleteFile = (fileId) => {
    const query = `DELETE FROM ${TABLE_NAME}`
        + ' WHERE id = ?';

    return db.deleteOne(query, [fileId]);
};

const getCategories = (accountId) => {
    const query = `SELECT category FROM ${TABLE_NAME}`
        + ' WHERE user_id = ?';

    return db.selectMany(query, [accountId]);
};

const getPaginatedFilteredFilesCount = (accountId, params) => {
    const { categories, name, isPublic } = params;
    const regexName = forRegexText(name);
    const sqlCategories = categories
        .map(cat => 'category = ?')
        .join(' OR ');

    const query = `SELECT COUNT(*) as total FROM ${TABLE_NAME} WHERE`
        + ' user_id = ?'
        + (name ? ` AND name_regex REGEXP ".*${_.escapeRegExp(name.trim())}.*"` : '')
        + ' AND is_public = ?'
        + (categories.length > 0 ? ` AND (${sqlCategories})` : '');

    const queryValues = [accountId];

    queryValues.push(isPublic);
    if (categories.length > 0) {
        categories.forEach(cat => queryValues.push(cat));
    }

    return db.query(query, queryValues)
        .then(sqlResult => sqlResult[0].total)
        .catch(() => { throw new SQLError(); });
};

const getPaginatedFilteredFiles = (accountId, params) => {
    const { offset, quantity, categories, name, isPublic } = params;

    const regexName = forRegexText(name);
    const sqlCategories = categories
        .map(cat => 'category = ?')
        .join(' OR ');

    const query = `SELECT * FROM ${TABLE_NAME} WHERE`
        + ' user_id = ?'
        + (name ? ` AND name_regex REGEXP ".*${_.escapeRegExp(name)}.*"` : '')
        + ' AND is_public = ?'
        + (categories.length > 0 ? ` AND (${sqlCategories})` : '')
        + ' LIMIT ?, ?';

    const queryValues = [accountId];

    queryValues.push(isPublic);
    if (categories.length > 0) {
        categories.forEach(cat => queryValues.push(cat));
    }
    queryValues.push(offset);
    queryValues.push(quantity);

    return db.selectMany(query, queryValues)
        .catch((err) => {
            if (err instanceof NotFound) {
                return [];
            }

            throw err;
        });
};

const getFileById = (fileId) => {
    const query = `SELECT * FROM ${TABLE_NAME}`
        + ' WHERE id = ?';

    return db.selectOne(query, [fileId]);
};

const getFilesByUserId = (userId) => {
    const query = `SELECT * FROM ${TABLE_NAME}`
        + ' WHERE user_id = ? ORDER BY id DESC';

    return db.selectMany(query, [userId]);
};

const getFileByUrl = (url) => {
    const query = `SELECT * FROM ${TABLE_NAME}`
        + ' WHERE url = ?';

    return db.selectOne(query, [url]);
};

const updateName = (fileId, name) => {
    const regexName = forRegexText(name);
    const query = `UPDATE ${TABLE_NAME}`
        + ' SET name = ?, name_regex = ?'
        + ' WHERE id = ?';

    return db.updateOne(query, [name.trim(), regexName, fileId]);
};

const updateCategory = (fileId, category) => {
    const query = `UPDATE ${TABLE_NAME}`
        + ' SET category = ?'
        + ' WHERE id = ?';

    return db.updateOne(query, [category.trim(), fileId]);
};

const updateIsPublic = (fileId, isPublic) => {
    const query = `UPDATE ${TABLE_NAME}`
        + ' SET is_public = ?'
        + ' WHERE id = ?';

    return db.updateOne(query, [isPublic, fileId]);
};

const updateRequiredPermission = (fileId, requiredPermission) => {
    const query = `UPDATE ${TABLE_NAME}`
        + ' SET required_permission = ?'
        + ' WHERE id = ?';

    return db.updateOne(query, [requiredPermission.trim(), fileId]);
};

const updateUrl = (fileId, url) => {
    const query = `UPDATE ${TABLE_NAME}`
        + ' SET url = ?'
        + ' WHERE id = ?';

    return db.updateOne(query, [url.trim(), fileId]);
};

const fixIncorrectFileUrl = () => {
    const query = `SELECT * FROM ${TABLE_NAME}`
        + ' WHERE url REGEXP "^/upload/[0-9]+/upload_.+"';

    return db.selectMany(query)
        .then((fileRows) => {
            fileRows.forEach((fileRow) => {
                const { id, user_id, created, url } = fileRow;
                const splittedUrl = url.split('_');
                const shorttenUrl = splittedUrl.slice(1);
                const filename = shorttenUrl.join('_');
                const creationDate = dates.readDate(created).format('YYYYMMDDHHmmss');
                const newUrl = `/upload/${user_id}/${id}_${creationDate}_${filename}`;

                return updateUrl(id, newUrl);
            });
        });
};

module.exports = {
    createTable,
    dropTable,
    truncateTable,
    addFile,
    getCategories,
    getFileById,
    getFileByUrl,
    getPaginatedFilteredFilesCount,
    getPaginatedFilteredFiles,
    getFilesByUserId,
    hardDeleteFile,
    updateName,
    updateCategory,
    updateIsPublic,
    updateRequiredPermission,
    updateUrl,
    fixIncorrectFileUrl,
};
