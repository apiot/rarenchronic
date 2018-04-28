const crypto = require('crypto');
const moment = require('moment');

const hashToken = (token, salt) => {
    const sentence = `${salt}-${token}`;
    return crypto.createHmac('sha256', sentence).digest('hex');
};

const hashPassword = (password, salt) => {
    const sentence = `${password}-${salt}`;
    return crypto.createHmac('sha256', sentence).digest('hex');
};

const generateToken = (password, salt) => {
    const nowMilliseconds = moment.utc().valueOf();
    const sentence = `${salt}-${password}-${nowMilliseconds}`;
    return crypto.createHmac('sha256', sentence).digest('hex');
};

const generateSalt = () => {
    const nowMilliseconds = moment.utc().valueOf();
    const saltSecret = process.env.RARENCHR_SALT_SECRET;
    const sentence = `${saltSecret}-${nowMilliseconds}`;
    return crypto.createHmac('sha256', sentence).digest('hex');
};

const generateActivationKey = (password) => {
    const nowMilliseconds = moment.utc().valueOf();
    const sentence = `${password}-${nowMilliseconds}`;
    return crypto.createHmac('sha256', sentence).digest('hex');
};

const generateActivationKeyForEmail = (hashedPassword) => {
    const nowMilliseconds = moment.utc().valueOf();
    const sentence = `${hashedPassword}-${nowMilliseconds}`;
    return crypto.createHmac('sha256', sentence).digest('hex');
};

const generateTemporaryPassword = (oldPassword) => {
    const nowMilliseconds = moment.utc().valueOf();
    const saltSecret = process.env.RARENCHR_SALT_SECRET;
    const sentence = `${oldPassword}-${nowMilliseconds}-${saltSecret}`;
    return crypto.createHmac('sha256', sentence).digest('hex');
};

module.exports = {
    generateActivationKey,
    generateActivationKeyForEmail,
    generateSalt,
    generateTemporaryPassword,
    generateToken,
    hashPassword,
    hashToken,
};
