const users = require('../../model/users/users');
const usersInfos = require('../../model/users/usersInfos');
const relationGroups = require('../../model/users/usersRelationGroups');
const userPermissions = require('../../model/users/usersPermissions');

const { generateActivationKey } = require('../../commons/crypto');

const { sendActivationEmail } = require('../external/MailGun/mailGun');

const addAccountInfosIntoDatabase = (userId) => {
    const addInfos = usersInfos.addNewInfos(userId);
    const addGroups = relationGroups.addRelationUser(userId);
    const addPermissions = userPermissions.addPermissionsUser(userId);

    return Promise.all([addInfos, addGroups, addPermissions]);
};

const createUser = ({ name, password, email }) => {
    const activationKey = generateActivationKey(password.trim());

    return users.checkAlreadyExistingAccountByEmail(email)
        .then(() => users.addAccount(name, password, email, activationKey))
        .then(addAccountInfosIntoDatabase)
        .then(() => sendActivationEmail(email, name, activationKey));
};

module.exports = {
    createUser,
};
