const ACTIVATION_KEY_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds
const PASSWORD_REQUEST_INTERVAL = 5 * 60; // 5 minutes
const PASSWORD_REQUEST_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds
const TOKEN_DURATION = 365 * 24 * 60 * 60; // 1 year in seconds

module.exports = {
    ACTIVATION_KEY_DURATION,
    PASSWORD_REQUEST_DURATION,
    PASSWORD_REQUEST_INTERVAL,
    TOKEN_DURATION,
};
