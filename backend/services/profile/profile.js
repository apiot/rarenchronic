const users = require('../../model/users/users');
const usersInfos = require('../../model/users/usersInfos');
const usersTokens = require('../../model/users/usersTokens');
const usersEmailRequests = require('../../model/users/usersEmailRequests');

const { hashPassword } = require('../../commons/crypto');
const { BadRequest, NotFound } = require('../../commons/errors');
const dates = require('../../commons/dates');

const deleteConnexion = (userId, userToken) => users.getActivatedUserById(userId)
    .then(account => usersTokens.deleteConnexion(account, userToken))
    .catch((err) => {
        if (err instanceof NotFound) {
            return true;
        }

        throw err;
    });

const getAccountInfos = userId => usersEmailRequests.hasEmailRequest(userId)
    .then(emailRequest => emailRequest)
    .catch((err) => {
        if (err instanceof NotFound) {
            return {}
        }

        throw err;
    })
    .then(emailRequest => usersTokens.getAvailableTokens(userId)
        .then(tokens => ({ emailRequest, tokens }))
        .catch((err) => {
            if (err instanceof NotFound) {
                return { emailRequest, tokens: [] };
            }

            throw err;
        })
    )
    .then(({ emailRequest, tokens}) => usersInfos.getUserInfos(userId)
        .then((infosResult) => ({
            tokensQuantity: tokens.length,
            emailRequest: {
                email: emailRequest.new_email,
                expired: dates.readDate(emailRequest.expired),
            },
            displayAvatar: infosResult.display_avatar,
            displayFirstName: infosResult.display_first_name,
            displayLastName: infosResult.display_last_name,
            displayPhone1: infosResult.display_phone1,
            displayPhone2: infosResult.display_phone2,
            displayAddress: infosResult.display_address,
            displayCity: infosResult.display_city,
            displayZipCode: infosResult.display_zip_code,
            displayCountry: infosResult.display_country,
            displayWebSite: infosResult.display_web_site,
        }))
    );

const updatePassword = (userId, newPassword, oldPassword) => users.getActivatedUserById(userId)
    .then((account) => {
        const { password, salt } = account;

        if (password === hashPassword(oldPassword, salt)) {
            return users.updatePassword(account, newPassword);
        }

        throw new BadRequest('Incorrect password.');
    });

const updateAvatar = (userId, avatarUrl) => usersInfos.updateAvatar(userId, avatarUrl);

const updateInfos = (userId, infos) => usersInfos.updateInfos(userId, infos);

const updateWebsite = (userId, website) => usersInfos.updateWebsite(userId, website);

const updateDescription = (userId, description) => usersInfos
    .updateDescription(userId, description);

const updateDisplay = (userId, display) => usersInfos.updateDisplay(userId, display);

module.exports = {
    deleteConnexion,
    getAccountInfos,
    updatePassword,
    updateAvatar,
    updateInfos,
    updateWebsite,
    updateDescription,
    updateDisplay,
};
