const db = require('../db');

const createTableHelper = (
    createQuery,
    addIndexQuery,
    tableName,
    { silent } = { silent: false },
) => db.query(createQuery)
    .then(() => {
        if (!silent) {
            // eslint-disable-next-line
            console.log(`TABLE CREATED: ${tableName}.`);
        }
        return db.query(addIndexQuery);
    })
    .then(() => {
        if (!silent) {
            // eslint-disable-next-line
            console.log(`INDEX CREATED: ${tableName}.`);
        }
    })
    .catch((err) => {
        throw Object.assign(err, { table: tableName });
    });

const dropTableHelper = tableName => db
    .query(`DROP TABLE IF EXISTS ${tableName}`);

const truncateTableHelper = tableName => db
    .query(`TRUNCATE TABLE ${tableName}`);

module.exports = {
    createTableHelper,
    dropTableHelper,
    truncateTableHelper,
};
