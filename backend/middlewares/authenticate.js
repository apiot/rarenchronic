const { getFullUserByToken } = require('../services/accounts/authenticate');

const { BadRequest, NotAuthorized } = require('../commons/errors');

const authenticateWithCookies = (req, res, next) => {
    const { userToken, userId } = req.signedCookies;

    if (userToken && userId) {
        getFullUserByToken(userToken, userId)
            .then((fullUser) => {
                req.user = fullUser;
                next();
            })
            .catch(next);
    } else {
        req.user = { authenticated: false };
        next();
    }
};

const isNotAuthenticated = (req, res, next) => {
    if (req.user.authenticated) {
        next(new BadRequest('You should not be authenticated.'));
    } else {
        next();
    }
};

const isAuthenticated = (req, res, next) => {
    if (req.user.authenticated) {
        next();
    } else {
        next(new NotAuthorized('You must be authenticated.'));
    }
};

module.exports = {
    authenticateWithCookies,
    isAuthenticated,
    isNotAuthenticated,
};
