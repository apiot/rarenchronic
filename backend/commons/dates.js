const moment = require('moment');

const now = () => moment.utc().format('YYYY-MM-DD HH:mm:ss');

const readDate = (date) => {
    // WARNING mysql package read date as a local time date
    const dateRead = moment(date, 'YYYY-MM-DD HH:mm:ss');
    const offset = dateRead.utcOffset();

    return dateRead.add(offset, 'minutes');
};

const toSQLDate = date => date.format('YYYY-MM-DD HH:mm:ss');

module.exports = {
    now,
    readDate,
    toSQLDate,
};
