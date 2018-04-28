const _ = require('lodash');

const usersFiles = require('../model/users/usersFiles');

const { NotAuthorized } = require('../commons/errors');

const checkPermission = (user, requiredPermission) => user.permissions
    .includes(requiredPermission);

const checkFileReadRights = (req, res, next) => {
    const { originalUrl, user } = req;

    usersFiles.getFileByUrl(originalUrl)
        .then((fileRow) => {
            const { is_public, required_permission } = fileRow;
            const userOkAndNoPermission = user.authenticated && !required_permission;
            const userOkAndPermissionOk = user.authenticated
                && checkPermission(user, required_permission);

            if (is_public || userOkAndNoPermission || userOkAndPermissionOk) {
                next();
            } else {
                next(new NotAuthorized('You don’t have enough permissions.'));
            }
        })
        .catch(next);
};

module.exports = {
    checkFileReadRights,
};
