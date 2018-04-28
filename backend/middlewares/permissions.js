const _ = require('lodash');

const { NotAuthorized, ServerError } = require('../commons/errors');

/**
 * @param {array} permissions: array of strings
 * @param {boolean} all: true: all permissions are required, false, only one
 *
 * this middleware must be after the authenticate middleware.
 */
const hasPermissions = (permissions, all = false) => (req, res, next) => {
    if (!req.user) {
        next(new ServerError('Wrong middlewares order.'));
        return;
    }

    const { user } = req;
    const hasAllRequiredPermissions = !permissions
        .some(perm => !user.permissions.includes(perm));
    const hasOnePermission = permissions
        .some(perm => user.permissions.includes(perm));

    const validAllPerms = user.authenticated && all && hasAllRequiredPermissions;
    const validOnePerm = user.authenticated && !all && hasOnePermission;

    if (validAllPerms || validOnePerm) {
        next();
    } else {
        throw new NotAuthorized('You don’t have enough permissions.');
    }
};

module.exports = {
    hasPermissions,
};
