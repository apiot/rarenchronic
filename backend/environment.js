const _ = require('lodash');

const checkEnvVariables = () => {
    const ENV_VARS = [
        'RARENCHR_MYSQL_USER',
        'RARENCHR_MYSQL_PASSWORD',
        'RARENCHR_MYSQL_HOST',
        'RARENCHR_MYSQL_DATABASE',
        'RARENCHR_BACKEND_PORT',
        'RARENCHR_COOKIE_PARSER_SECRET',
        'RARENCHR_SALT_SECRET',
        'RARENCHR_DEV_RELOAD_DB_TABLES',
        'RARENCHR_MAILGUN_API_URL',
        'RARENCHR_MAILGUN_DOMAIN',
        'RARENCHR_MAILGUN_API_KEY',
    ];

    ENV_VARS.forEach((name) => {
        if (_.isNil(process.env[name])) {
            throw { message: `Missing env var: ${name}` }; // eslint-disable-line no-throw-literal
        }
    });

    // eslint-disable-next-line
    console.log('BOOT CHECK: All environment variables are corrects.');
};

module.exports = {
    checkEnvVariables,
};
