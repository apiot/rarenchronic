// vendor libraries
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// custom libraries
const environement = require('./environment');
const db = require('./db');
const startScripts = require('./startScripts');
const { allRoutes } = require('./routes/routes');

const { checkFileReadRights } = require('./middlewares/files');

const app = express();

// perform tests
environement.checkEnvVariables();

// connect and check/create database
db.connect((err) => {
    if (err) {
        // eslint-disable-next-line
        console.log('Unable to connect to database.');
        process.exit(1);
    } else {
        // eslint-disable-next-line
        console.log('BOOT CHECK: Connexion to database succeeded. Pool created.');
        startScripts.devModeReinitializeTables();
    }
});

/* *****************************  START ROAD  ******************************* */

const { authenticateWithCookies } = require('./middlewares/authenticate');
const { isBannedByIp } = require('./middlewares/bans');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(process.env['RARENCHR_COOKIE_PARSER_SECRET']));
app.use(isBannedByIp);
app.use(authenticateWithCookies);

// for static files
app.use('/upload', checkFileReadRights);
app.use('/upload', express.static('./upload'));

/* ******************************  END ROAD  ******************************** */

// load routes
allRoutes(app);

// listen
const listenedPort = process.env.RARENCHR_BACKEND_PORT;
app.listen(listenedPort);
// eslint-disable-next-line
console.log(`START: Server started on port: ${listenedPort}`);
