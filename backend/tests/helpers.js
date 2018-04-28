const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const getNewAppInstance = () => {
    const app = express();

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cookieParser(process.env['RARENCHR_COOKIE_PARSER_SECRET']));

    return app;
};

module.exports = {
    getNewAppInstance,
};
