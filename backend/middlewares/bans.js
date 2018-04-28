const { findBannedIp } = require('../model/ip/ipBanned');

const { getIp } = require('../commons/utils');
const { NotAuthorized, NotFound } = require('../commons/errors');

const isBannedByIp = (req, res, next) => {
    findBannedIp(getIp(req))
        .then(() => {
            next(new NotAuthorized('You have been banned.'));
        })
        .catch((err) => {
            if (err instanceof NotFound) {
                next();
            } else {
                next(err);
            }
        });
};

// user must be authenticated
const isBannedByType = type => (req, res, next) => {
    if (req.user.bans.includes(type)) {
        next(new NotAuthorized('You have been banned.'));
    } else {
        next();
    }
};

module.exports = {
    isBannedByIp,
    isBannedByType,
};
