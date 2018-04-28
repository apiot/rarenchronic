const tableGroups = require('./model/groups/groups');

const tableUser = require('./model/users/users');
const tableUserRelationGroups = require('./model/users/usersRelationGroups');
const tableUserTokens = require('./model/users/usersTokens');
const tableUserPermissions = require('./model/users/usersPermissions');
const tableUserBans = require('./model/users/usersBans');
const tableUserBlocks = require('./model/users/usersBlocks');
const tableUserInfos = require('./model/users/usersInfos');
const tableUserFiles = require('./model/users/usersFiles');
const tableUserEmailRequests = require('./model/users/usersEmailRequests');
const tableUserPasswordRequests = require('./model/users/usersPasswordRequests');

const tableMessages = require('./model/messages/messages');

const tableAdminLogs = require('./model/admin/adminLogs');
const tableAdminComments = require('./model/admin/adminComments');

const tableArticles = require('./model/articles/articles');
const tableArticlesTags = require('./model/articles/articlesTags');
const tableArticlesCategories = require('./model/articles/articlesCategories');
const tableArticlesComments = require('./model/articles/articlesComments');
const tableArticlesRelationCategories = require('./model/articles/articlesRelationCategories');
const tableArticlesRelationTags = require('./model/articles/articlesRelationTags');

const tableIpBanned = require('./model/ip/ipBanned');

const createDBTables = ({ silent }) => Promise.resolve() // order matters because of foreign keys
    .then(() => tableGroups.createTable({ silent }))
    .then(() => tableUser.createTable({ silent }))
    .then(() => tableUserRelationGroups.createTable({ silent }))
    .then(() => tableUserTokens.createTable({ silent }))
    .then(() => tableUserPermissions.createTable({ silent }))
    .then(() => tableUserBans.createTable({ silent }))
    .then(() => tableUserBlocks.createTable({ silent }))
    .then(() => tableUserInfos.createTable({ silent }))
    .then(() => tableUserFiles.createTable({ silent }))
    .then(() => tableUserEmailRequests.createTable({ silent }))
    .then(() => tableUserPasswordRequests.createTable({ silent }))
    .then(() => tableMessages.createTable({ silent }))
    .then(() => tableAdminLogs.createTable({ silent }))
    .then(() => tableAdminComments.createTable({ silent }))
    .then(() => tableArticles.createTable({ silent }))
    .then(() => tableArticlesTags.createTable({ silent }))
    .then(() => tableArticlesCategories.createTable({ silent }))
    .then(() => tableArticlesComments.createTable({ silent }))
    .then(() => tableArticlesRelationCategories.createTable({ silent }))
    .then(() => tableArticlesRelationTags.createTable({ silent }))
    .then(() => tableIpBanned.createTable({ silent }))
    .catch((err) => {
        // eslint-disable-next-line
        console.log('ERROR WHILE CREATING DB TABLES.');
        // eslint-disable-next-line
        console.log(err);
        process.exit(1);
    });

const dropDBTables = () => Promise.resolve() // order matters because of foreign keys
    .then(() => tableArticlesRelationCategories.dropTable())
    .then(() => tableArticlesRelationTags.dropTable())
    .then(() => tableArticlesCategories.dropTable())
    .then(() => tableArticlesTags.dropTable())
    .then(() => tableArticlesComments.dropTable())
    .then(() => tableArticles.dropTable())
    .then(() => tableAdminComments.dropTable())
    .then(() => tableAdminLogs.dropTable())
    .then(() => tableMessages.dropTable())
    .then(() => tableIpBanned.dropTable())
    .then(() => tableUserPasswordRequests.dropTable())
    .then(() => tableUserEmailRequests.dropTable())
    .then(() => tableUserFiles.dropTable())
    .then(() => tableUserInfos.dropTable())
    .then(() => tableUserBlocks.dropTable())
    .then(() => tableUserBans.dropTable())
    .then(() => tableUserPermissions.dropTable())
    .then(() => tableUserRelationGroups.dropTable())
    .then(() => tableUserTokens.dropTable())
    .then(() => tableGroups.dropTable())
    .then(() => tableUser.dropTable())
    .catch((err) => {
        // eslint-disable-next-line
        console.log('ERROR WHILE DELETING DB TABLES.');
        // eslint-disable-next-line
        console.log(err);
        process.exit(1);
    });

const devModeReinitializeTables = () => {
    // If in dev mode, drop tables first
    if (process.env['RARENCHR_DEV_RELOAD_DB_TABLES'] === 'true') {
        return dropDBTables()
            .then(() => createDBTables({ silent: false }))
            .then(() => tableGroups.addGroupsSet()); // add groups
    }

    return null;
};

const prodModeCreateTables = () => createDBTables()
    .then(() => tableGroups.addGroupsSet()); // add groups

const testModeReinitializeTables = () => dropDBTables()
    .then(() => createDBTables({ silent: true }))
    .then(() => tableGroups.addGroupsSet()); // add groups

module.exports = {
    devModeReinitializeTables,
    prodModeCreateTables,
    testModeReinitializeTables,
};
