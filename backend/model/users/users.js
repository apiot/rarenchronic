const moment = require('moment');

const db = require('../../db');
const helpers = require('./../helpers');

const { ACTIVATION_KEY_DURATION } = require('../../commons/consts/accounts');
const dates = require('../../commons/dates');
const { generateSalt, hashPassword } = require('../../commons/crypto');
const { BadRequest, NotFound } = require('../../commons/errors');
const { forRegexText } = require('../../commons/utils');

const TABLE_NAME = 'users';
const INDEX_NAME = 'users_indexes';

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'id BIGINT UNSIGNED NOT NULL UNIQUE AUTO_INCREMENT, '
        + 'name VARCHAR(100) NOT NULL, '
        + 'name_regex VARCHAR(100) NOT NULL, '
        + 'email VARCHAR(200) NOT NULL, '
        + 'password VARCHAR(100) NOT NULL, '
        + 'salt VARCHAR(100) NOT NULL, '
        + 'last_connexion DATETIME, '
        + 'last_login_attempt DATETIME, '
        + 'created DATETIME NOT NULL, '
        + 'activated BOOLEAN NOT NULL, '
        + 'activation_key TEXT, '
        + 'deleted BOOLEAN NOT NULL '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (id, name_regex, email)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

const activateUser = (userId) => {
    const query = `UPDATE ${TABLE_NAME}`
        + ' SET activated = TRUE'
        + ' WHERE id = ?';

    return db.updateOne(query, [userId]);
};

const addAccount = (name, password, email, activationKey) => {
    const now = dates.now();
    const regexName = forRegexText(name);
    const salt = generateSalt();
    const hashedPassword = hashPassword(password.trim(), salt);
    const query = `INSERT INTO ${TABLE_NAME}`
        + ' (name, name_regex, email, password, salt,'
        + ' created, activated, activation_key, deleted)'
        + ' VALUES'
        + ' (?, ?, ?, ?, ?, ?, ?, ?, FALSE)';
    const activated = false;
    const values = [name.trim(), regexName, email.trim(), hashedPassword]
        .concat([salt, now, activated, activationKey]);

    return db.insertOne(query, values);
};

const addLastConnexionLog = (userId) => {
    const now = dates.now();
    const query = `UPDATE ${TABLE_NAME} SET last_connexion = ?`
        + ' WHERE id = ? AND deleted = FALSE';
    const notFoundMessage = 'This account does not exist.';

    return db.updateOne(query, [now, userId], notFoundMessage);
};

const addLastLoginAttemptLog = (userId) => {
    const now = dates.now();
    const query = `UPDATE ${TABLE_NAME} SET last_login_attempt = ?`
        + ' WHERE id = ? AND deleted = FALSE';
    const notFoundMessage = 'This account does not exist.';

    return db.updateOne(query, [now, userId], notFoundMessage);
};

const deleteByEmail = (email) => {
    const query = `UPDATE ${TABLE_NAME} SET deleted = TRUE WHERE`
        + ' email = ? AND deleted = FALSE';

    return db.deleteMany(query, [email.trim()]);
};

const checkAlreadyExistingAccountByEmail = (email) => {
    const query = `SELECT * FROM ${TABLE_NAME}`
        + ' WHERE email = ? AND deleted = FALSE';

    return db.selectOne(query, [email.trim()])
        .then((account) => {
            const { activated, created } = account;
            const now = moment.utc();
            const difference = now.diff(dates.readDate(created), 'seconds');
            const lessThanAllowedTime = difference < ACTIVATION_KEY_DURATION;

            if (activated || lessThanAllowedTime) {
                throw new BadRequest('This email is already taken by another account.');
            }

            return deleteByEmail(email);
        })
        .catch((err) => {
            if (err instanceof NotFound) {
                return true;
            }

            throw err;
        });
};

const getUserByActivationKey = (key) => {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE`
        + ' activated = FALSE AND activation_key = ? AND deleted = FALSE';
    const notFoundMessage = 'This activation key matches no account.';

    return db.selectOne(query, [key.trim()], notFoundMessage);
};

const getActivatedUserById = (userId) => {
    const getUser = `SELECT * FROM ${TABLE_NAME} WHERE`
        + ' id = ? AND activated = TRUE AND deleted = FALSE';
    const notFoundMessage = 'This account does not exist.';

    return db.selectOne(getUser, [userId], notFoundMessage);
};

const getUserByEmail = (email) => {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE`
        + ' email = ? AND deleted = FALSE';
    const errorMessage = 'This account does not exist.';

    return db.selectOne(query, [email.trim()], errorMessage);
};

const updatePassword = (account, password) => {
    const { id, salt } = account;
    const hashedPassword = hashPassword(password.trim(), salt);
    const query = `UPDATE ${TABLE_NAME} SET password = ?`
        + ' WHERE id = ? AND deleted = FALSE';

    return db.updateOne(query, [hashedPassword, id]);
};

const updateEmail = (userId, email) => {
    const query = `UPDATE ${TABLE_NAME} SET email = ?`
        + 'WHERE id = ? AND deleted = FALSE';

    return db.updateOne(query, [email.trim(), userId]);
};

module.exports = {
    activateUser,
    addAccount,
    addLastConnexionLog,
    addLastLoginAttemptLog,
    checkAlreadyExistingAccountByEmail,
    createTable,
    getActivatedUserById,
    getUserByActivationKey,
    getUserByEmail,
    updatePassword,
    updateEmail,
    dropTable,
    truncateTable,
};
