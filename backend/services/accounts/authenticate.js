const _ = require('lodash');

const { NotAuthorized, NotFound } = require('../../commons/errors');

const users = require('../../model/users/users');
const usersPermissions = require('../../model/users/usersPermissions');
const usersBans = require('../../model/users/usersBans');
const userRelationsGroups = require('../../model/users/usersRelationGroups');
const usersInfos = require('../../model/users/usersInfos');
const usersTokens = require('../../model/users/usersTokens');

const handleNotFoundBans = (err) => {
    if (err instanceof NotFound) {
        return [];
    }

    throw err;
};

const getFullUserByToken = (token, userId) => users.getActivatedUserById(userId)
    .then((account) => {
        const { salt } = account;

        return usersTokens.checkTokenExistence(userId, token, salt)
            .then(() => account);
    })
    .then((account) => Promise.all([
        usersPermissions.getUserPermissions(userId),
        usersBans.getUserBans(userId).catch(handleNotFoundBans),
        userRelationsGroups.getUserGroups(userId),
        usersInfos.getUserInfos(userId),
        account,
    ]))
    .then(([permissions, bans, groups, infos, account]) => {
        const permissionsCheck = Array.isArray(permissions);
        const bansCheck = Array.isArray(bans);
        const groupsCheck = Array.isArray(groups);
        const infosCheck = !_.isEmpty(infos);

        const fullUser = {
            authenticated: false,
        };

        if (permissionsCheck && bansCheck && groupsCheck && infosCheck) {
            fullUser.authenticated = true;
            fullUser.id = userId;
            fullUser.name = account.name;
            fullUser.email = account.email;
            fullUser.created = account.created;
            fullUser.lastConnexion = account.last_connexion;
            fullUser.lastLoginAttempt = account.last_login_attempt;
            fullUser.activated = account.activated;
            fullUser.permissions = permissions.map(perms => perms.permission);
            fullUser.groups = groups.map(group => group.name);
            fullUser.bans = bans.map(ban => ban.type);
            fullUser.avatar = infos.avatar;
            fullUser.firstName = infos.first_name;
            fullUser.lastName = infos.last_name;
            fullUser.phone1 = infos.phone1;
            fullUser.phone2 = infos.phone2;
            fullUser.address = infos.address;
            fullUser.city = infos.city;
            fullUser.zipCode = infos.zip_code;
            fullUser.country = infos.country;
            fullUser.website = infos.web_site;
            fullUser.description = infos.description;
        }

        return fullUser;
    })
    .catch((err) => {
        if (err instanceof NotAuthorized || err instanceof NotFound) {
            return { authenticated: false };
        }

        throw err;
    });

module.exports = {
    getFullUserByToken,
};
