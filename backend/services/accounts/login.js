const moment = require('moment');

const users = require('../../model/users/users');
const usersTokens = require('../../model/users/usersTokens');
const usersPassword = require('../../model/users/usersPasswordRequests');

const dates = require('../../commons/dates');
const { hashPassword } = require('../../commons/crypto');
const {
    BadRequest,
    NotAuthorized,
    NotFound,
    SQLError,
} = require('../../commons/errors');

const checkAccount = (account) => {
    const { last_login_attempt, activated } = account;
    const now = moment.utc();
    const lastLoginAttempt = dates.readDate(last_login_attempt).add(3, 'seconds');
    const isTimingOk = !lastLoginAttempt.isValid() || now.isAfter(lastLoginAttempt);

    if (!isTimingOk) {
        throw new NotAuthorized('Login can be attempted every 3 seconds.');
    }

    if (!activated) {
        throw new BadRequest('This account is not activated.');
    }

    return users.addLastLoginAttemptLog(account.id)
        .then(() => account);
};

const handlePassword = password => (account) => {
    const { id, salt } = account;
    const hashedPassword = hashPassword(password.trim(), salt);

    if (hashedPassword !== account.password) {
        return usersPassword.getPasswordRequest(id)
            .then((passwordRequest) => {
                const now = dates.now();
                const { new_password, expired } = passwordRequest;
                const isNotExpired = now.isBefore(dates.readDate(expired));
                const matchPassword = hashedPassword === new_password;

                if (isNotExpired && matchPassword) {
                    const deleteQuery = usersPassword.deleteByUserId(id);
                    const passwordQuery = users.updatePassword(account, password);

                    return Promise.all([deleteQuery, passwordQuery])
                        .then(() => account)
                        .catch((err) => {
                            if (err instanceof NotFound) {
                                throw new SQLError();
                            }

                            throw err;
                        });
                }

                throw new BadRequest('Incorrect password.');
            })
            .catch((err) => {
                // if no password request pending
                if (err instanceof NotFound) {
                    throw new BadRequest('Incorrect password.');
                }

                throw err;
            });
    }

    return account;
};

const manualLogin = (email, password) => users.getUserByEmail(email)
    .then(checkAccount)
    .then(handlePassword(password))
    .then(account => users.addLastConnexionLog(account.id).then(() => account))
    .then(account => usersTokens.addToken(account)
        .then(userToken => ({
            userToken,
            userId: account.id,
        }))
    );

const logout = (userId, token) => users.getActivatedUserById(userId)
    .then(account => usersTokens.deleteTokenByUserId(account, token));

const logoutAll = userId => usersTokens.deleteAllTokensByUserId(userId);

module.exports = {
    manualLogin,
    logout,
    logoutAll,
};
