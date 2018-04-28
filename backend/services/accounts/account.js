const moment = require('moment');
const _ = require('lodash');

const users = require('../../model/users/users');
const usersPassword = require('../../model/users/usersPasswordRequests');

const { sendActivationEmail, sendNewPasswordEmail } = require('../external/MailGun/mailGun');

const { PASSWORD_REQUEST_INTERVAL } = require('../../commons/consts/accounts');
const { generateTemporaryPassword, hashPassword } = require('../../commons/crypto');
const { NotAuthorized, NotFound, BadRequest } = require('../../commons/errors');
const dates = require('../../commons/dates');

const reSendActivation = email => users.getUserByEmail(email)
    .then((account) => {
        const { name, activated, activation_key } = account;

        if (!activated) {
            return sendActivationEmail(email, name, activation_key);
        }

        throw new BadRequest('This account is already activated.');
    });

const getAccountAndPasswordRequest = email => users.getUserByEmail(email)
    .then(account => usersPassword
        .getPasswordRequest(account.id)
        .then(passwordRequest => ({ account, passwordRequest }))
        .catch((err) => {
            if (err instanceof NotFound) {
                return { account };
            }

            throw err;
        }));

const checkAccountAndPasswordRequest = ({ account, passwordRequest }) => {
    const { activated } = account;

    if (!activated) {
        throw new BadRequest('This account is not activated.');
    }

    if (!_.isNil(passwordRequest)) {
        const now = moment.utc();
        const minimumTimeRequired = dates
            .readDate(passwordRequest.created)
            .add(PASSWORD_REQUEST_INTERVAL, 'minutes');

        if (now.isBefore(minimumTimeRequired, 'seconds')) {
            const message = 'You can attempt to generate a new password every 5 minutes.';

            throw new NotAuthorized(message);
        }
    }

    return account;
};

const generateAndSendNewPassword = (email, account) => {
    const { id, name, password } = account;

    const newPassword = generateTemporaryPassword(password);
    const hashedPassword = hashPassword(newPassword);

    return usersPassword.addPasswordRequest(id, hashedPassword)
        .then(() => sendNewPasswordEmail(email, name, newPassword));
};

const sendNewPassword = email => getAccountAndPasswordRequest(email)
    .then(checkAccountAndPasswordRequest)
    .then(account => generateAndSendNewPassword(email, account));

module.exports = {
    reSendActivation,
    sendNewPassword,
};
