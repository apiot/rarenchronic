const db = require('../../db');
const helpers = require('./../helpers');

const TABLE_NAME = 'users_infos';
const INDEX_NAME = 'users_infos_indexes';

const createTable = ({ silent }) => {
    const create = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (`
        + 'user_id BIGINT UNSIGNED UNIQUE NOT NULL, '
        + 'avatar VARCHAR(300), ' // url
        + 'first_name VARCHAR(200), '
        + 'last_name VARCHAR(200), '
        + 'phone1 VARCHAR(50), '
        + 'phone2 VARCHAR(50), '
        + 'address VARCHAR(300), '
        + 'city VARCHAR(100), '
        + 'zip_code VARCHAR(20), '
        + 'country VARCHAR(100), '
        + 'web_site VARCHAR(200), '
        + 'description TEXT, '
        + 'display_avatar BOOLEAN, '
        + 'display_first_name BOOLEAN, '
        + 'display_last_name BOOLEAN, '
        + 'display_phone1 BOOLEAN, '
        + 'display_phone2 BOOLEAN, '
        + 'display_address BOOLEAN, '
        + 'display_city BOOLEAN, '
        + 'display_zip_code BOOLEAN, '
        + 'display_country BOOLEAN, '
        + 'display_web_site BOOLEAN, '
        + 'FOREIGN KEY (user_id) REFERENCES users(id) '
    + ') ENGINE=InnoDB, CHARSET=utf8, COLLATE=utf8_unicode_ci';
    const addIndex = `CREATE INDEX ${INDEX_NAME} on ${TABLE_NAME} (user_id)`;

    return helpers.createTableHelper(create, addIndex, TABLE_NAME, { silent });
};

const dropTable = () => helpers.dropTableHelper(TABLE_NAME);

const truncateTable = () => helpers.truncateTableHelper(TABLE_NAME);

const addNewInfos = (userId) => {
    const query = `INSERT INTO ${TABLE_NAME}`
        + ' (user_id, avatar, first_name, last_name, phone1, phone2, address, city, zip_code, country,'
        + ' web_site, description, display_avatar, display_first_name, display_last_name, display_phone1, display_phone2,'
        + ' display_address, display_city, display_zip_code, display_country, display_web_site)'
        + ' VALUES'
        + ' (?, "", "", "", "", "", "", "", "", "", "", "", TRUE, TRUE, TRUE, TRUE, TRUE,'
        + ' TRUE, TRUE, TRUE, TRUE, TRUE)';

    return db.insertOne(query, [userId]);
};

const getUserInfos = (userId) => {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE user_id = ?`;

    return db.selectOne(query, [userId]);
};

const updateAvatar = (userId, avatar) => {
    const query = `UPDATE ${TABLE_NAME} SET avatar = ? WHERE user_id = ?`;

    return db.updateOne(query, [avatar.trim(), userId]);
};

const updateInfos = (userId, infos = {}) => {
    const {
        firstName = '',
        lastName = '',
        phone1 = '',
        phone2 = '',
        address = '',
        city = '',
        zipCode = '',
        country = '',
    } = infos;
    const query = `UPDATE ${TABLE_NAME}`
        + ' SET first_name = ?, last_name = ?, phone1 = ?, phone2 = ?,'
        + ' address = ?, city = ?, zip_code = ?, country = ?'
        + ' WHERE user_id = ?';
    const values = [
        firstName.trim(),
        lastName.trim(),
        phone1.trim(),
        phone2.trim(),
        address.trim(),
        city.trim(),
        zipCode.trim(),
        country.trim(),
        userId,
    ];

    return db.updateOne(query, values);
};

const updateWebsite = (userId, website) => {
    const query = `UPDATE ${TABLE_NAME} SET web_site = ?`
        + ' WHERE user_id = ?';

    return db.updateOne(query, [website.trim(), userId]);
};

const updateDescription = (userId, description) => {
    const query = `UPDATE ${TABLE_NAME} SET description = ?`
        + ' WHERE user_id = ?';

    return db.updateOne(query, [description.trim(), userId]);
};

const updateDisplay = (userId, display = {}) => {
    const values = [
        display.avatar,
        display.firstName,
        display.lastName,
        display.phone1,
        display.phone2,
        display.address,
        display.city,
        display.zipCode,
        display.country,
        display.website,
        userId,
    ];

    const query = `UPDATE ${TABLE_NAME}`
        + ' SET display_avatar = ?,'
        + ' display_first_name = ?,'
        + ' display_last_name = ?,'
        + ' display_phone1 = ?,'
        + ' display_phone2 = ?,'
        + ' display_address = ?,'
        + ' display_city = ?,'
        + ' display_zip_code = ?,'
        + ' display_country = ?,'
        + ' display_web_site = ?'
        + ' WHERE user_id = ?';

    return db.updateOne(query, values);
};

module.exports = {
    createTable,
    addNewInfos,
    getUserInfos,
    dropTable,
    truncateTable,
    updateAvatar,
    updateInfos,
    updateWebsite,
    updateDescription,
    updateDisplay,
};
