const express = require('express');
const { isJoiError, isErrorWithCode, isNotFound } = require('../middlewares/errors');
const routesBackend = require('./back-office/back-office.routes');
const routesFrontend = require('./front-office/front-office.routes');

const allRoutes = (app) => {
    const router = express.Router();

    router.use('/back', routesBackend);
    router.use('/front', routesFrontend);

    router.use(isJoiError);
    router.use(isErrorWithCode);
    router.use(isNotFound);

    app.use('/api', router);
};

module.exports = {
    allRoutes,
};
