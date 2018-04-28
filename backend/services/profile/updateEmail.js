const moment = require('moment');

const users = require('../../model/users/users');
const usersEmailRequests = require('../../model/users/usersEmailRequests');

const dates = require('../../commons/dates');
const { generateActivationKeyForEmail } = require('../../commons/crypto');
const { ExpiredError } = require('../../commons/errors');

const { sendActivationEmailAfterEmailChange } = require('../external/MailGun/mailGun');

const activateEmail = activationKey => usersEmailRequests
    .getEmailRequestToActivate(activationKey)
    .then((emailRequest) => {
        const { user_id, new_email, expired } = emailRequest;
        const isExpired = moment.utc().isAfter(dates.readDate(expired));

        if (isExpired) {
            throw new ExpiredError('This email request has expired.');
        }

        return usersEmailRequests.deleteRequests(user_id)
            .then(() => users.updateEmail(user_id, new_email));
    });

const createEmailRequest = (userId, email) => users.getActivatedUserById(userId)
    .then((account) => {
        const { id, name, password } = account;
        const activationKey = generateActivationKeyForEmail(password.trim());

        return usersEmailRequests.deleteRequests(id)
            .then(() => usersEmailRequests.addEmailRequest(id, email, activationKey))
            .then(() => sendActivationEmailAfterEmailChange(email, name, activationKey));
    });

const hasEmailRequest = userId => usersEmailRequests
    .hasEmailRequest(userId)
    .then(({ new_email }) => new_email);

module.exports = {
    activateEmail,
    hasEmailRequest,
    createEmailRequest,
};
