const cookieLoginOptions = {
    signed: true,
    expires: new Date(Date.now() + (86400 * 365 * 1000)), // 1 year
};

module.exports = {
    cookieLoginOptions,
};
