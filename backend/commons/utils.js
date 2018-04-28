const moment = require('moment');
const _ = require('lodash');

const { MAX_FILE_SIZE } = require('./consts/files');

const getIp = request => (request.headers['x-forwarded-for']
    || request.connection.remoteAddress
    || request.socket.remoteAddress
    || request.connection.socket.remoteAddress).split(',')[0];

const getUserAgent = request => request.headers['user-agent'];

const getFileExtension = (filename) => {
    const splitted = filename.split('.');
    return _.last(splitted).toLowerCase();
};

/* remove accents and lowercase: useful to search with a regex */
const forRegexText = text => text.trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase();

const formatStringToKebabText = (text) => {
    const lowerWithoutAccents = forRegexText(text);
    const kebabText = lowerWithoutAccents.replace(/[^a-z0-9]/g, '-');
    const formattedKebabText = kebabText.replace(/-+/g, '-');

    let result = ` ${formattedKebabText}`.slice(1); // copy
    if (result[0] === '-') {
        result = result.slice(1);
    }
    if (result[result.length - 1] === '-') {
        const len = result.length;
        result = result.slice(0, len - 1);
    }

    return result;
};

// File URL: /upload/:userId/fileIdentifier_YYYYMMDDHHMMSS_filename.extension
const getFormattedFilename = (userId, fileId, filename) => {
    const formattedNow = moment.utc().format('YYYYMMDDHHmmss');
    const splitted = filename.split('.');
    const extension = splitted[splitted.length - 1];
    const ext = extension.toLowerCase();
    const filenameWithoutExtension = splitted.slice(0, splitted.length - 1);
    const formattedFilename = formatStringToKebabText(filenameWithoutExtension.join('.'));

    return `/upload/${userId}/${fileId}_${formattedNow}_${formattedFilename}.${ext}`;
};

const checkFileSize = (user, fileSize) => { // fileSize is in Bytes
    const { groups } = user;

    const selectedGroup = _.maxBy(
        Object.keys(MAX_FILE_SIZE),
        key => groups.includes(key) ? MAX_FILE_SIZE[key] : 0,
    );
    const amountAllowedInMo = MAX_FILE_SIZE[selectedGroup];
    const amountInBytes = amountAllowedInMo * 1048576;

    return amountInBytes >= fileSize;
};

const getTempPathFromPath = (fullPath) => {
    const splitted = fullPath.split('/upload/');

    return `/upload/${_.last(splitted)}`;
};

module.exports = {
    checkFileSize,
    formatStringToKebabText,
    forRegexText,
    getIp,
    getUserAgent,
    getFormattedFilename,
    getFileExtension,
    getTempPathFromPath,
};
