const moment = require('moment');

const users = require('../../model/users/users');

const { ACTIVATION_KEY_DURATION } = require('../../commons/consts/accounts');
const { BadRequest, NotFound } = require('../../commons/errors');
const dates = require('../../commons/dates');

const activateUser = (key) => users.getUserByActivationKey(key)
    .then((account) => {
        const { id, created } = account;

        const now = moment.utc();
        const difference = now.diff(dates.readDate(created), 'seconds');
        const lessThanAllowedTime = difference < ACTIVATION_KEY_DURATION;

        if (lessThanAllowedTime) {
            return users.activateUser(id);
        }

        throw new BadRequest('Expired activation key.');
    })
    .catch((err) => {
        if (err instanceof NotFound) {
            throw new BadRequest('Invalid activation key.');
        }

        throw err;
    });

module.exports = {
    activateUser,
};
