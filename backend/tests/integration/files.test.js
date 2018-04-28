const moment = require('moment');
const request = require('supertest');

const { getNewAppInstance } = require('../helpers');

const db = require('../../db');

const startScripts = require('../../startScripts');
const environement = require('../../environment');
const { allRoutes } = require('../../routes/routes');

const dates = require('../../commons/dates');

const users = require('../../model/users/users');
const usersInfos = require('../../model/users/usersInfos');

describe('routes/back-office/files', () => {
    let app;

    before(async () => {
        db.connect((err) => {
            if (err) {
                console.log('Unable to connect to database.');
                process.exit(1);
            }
        });

        environement.checkEnvVariables();
    });

    after(async () => {
        await startScripts.testModeReinitializeTables();
    });

    describe('[POST] /api/back/files/upload', () => {
        let token;

        const name = 'admin';
        const password = 'password1234';
        const email = 'contact@rarenchronic.net';
        const activationKey = 'a_correct_activation_key_1234567890_1234567890_1234567890';

        before(async () => {
            await startScripts.testModeReinitializeTables();

            // add activated account
            await users.addAccount(name, password, email, activationKey)
                .then(users.activateUser);
        });

        describe('with authenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = {
                        authenticated: true,
                        id: 1,
                        groups: ['users'],
                        permissions: ['user.default'],
                    };
                    next();
                });

                allRoutes(app);
            });

            describe('with one file', () => {
                it('expect status 200 (file is uploaded)', (done) => {
                    request(app)
                        .post('/api/back/files/upload')
                        .attach('image', './tests/fixtures/files/truck.9super.PNG')
                        .expect(200, done);
                });
            });

            describe('with one incorrect file', async () => {
                it('expect status 480 (file upload failed)', (done) => {
                    request(app)
                        .post('/api/back/files/upload')
                        .attach('image', './tests/fixtures/files/badDoc.bad')
                        .expect(480, done);
                });
            });

            describe('with two files', () => {
                it('expect status 200 (files are uploaded)', (done) => {
                    request(app)
                        .post('/api/back/files/upload')
                        .attach('image', './tests/fixtures/files/--droits[humains--.pdf')
                        .attach('image', './tests/fixtures/files/word-File-For-Test.doc')
                        .expect(200, done);
                });
            });

            describe('with one correct file and one incorrect file', () => {
                it('expect status 480 (files upload failed)', (done) => {
                    request(app)
                        .post('/api/back/files/upload')
                        .attach('image', './tests/fixtures/files/badDoc.bad')
                        .attach('image', './tests/fixtures/files/word-File-For-Test.doc')
                        .expect(480, done);
                });
            });

            describe('with no file', () => {
                it('expect status 200 (no op)', (done) => {
                    request(app)
                        .post('/api/back/files/upload')
                        .expect(200, done);
                });
            });
        });
    });
});
