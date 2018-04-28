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
const usersEmailRequests = require('../../model/users/usersEmailRequests');

describe('routes/back-office/profile', () => {
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

    describe('[POST] /email/activation', () => {
        const emailActivationKey1 = 'correct_email_activation_key1_123567890_1234567890';
        const emailActivationKey2 = 'correct_email_activation_key2_123567890_1234567890';

        const name = 'admin';
        const password = 'password1234';
        const email1 = 'contact@rarenchronic1.net';
        const email2 = 'contact@rarenchronic2.net';
        const activationKey1 = 'a_correct_activation_key1_1234567890_1234567890_1234567890';
        const activationKey2 = 'a_correct_activation_key2_1234567890_1234567890_1234567890';

        before(async () => {
            await startScripts.testModeReinitializeTables();

            // add activated account
            await users.addAccount(name, password, email1, activationKey2)
                .then(users.activateUser);
            // add activated account
            await users.addAccount(name, password, email2, activationKey2)
                .then(users.activateUser);
            // add email request
            await usersEmailRequests.addEmailRequest(1, email1, emailActivationKey1);
            // add email request
            await usersEmailRequests.addEmailRequest(2, email2, emailActivationKey2);
            const oneHourBefore = moment.utc().add(-24, 'hours');
            const values = [dates.toSQLDate(oneHourBefore), 2];
            await db.query('UPDATE users_email_requests SET expired = ? WHERE user_id = ?', values);
        });

        describe('activate email request (delete email request and update email in user database)', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: false };
                    next();
                });

                allRoutes(app);
            });

            describe('with correct activation key', () => {
                it('expect status 200 (activate email)', (done) => {
                    request(app)
                        .patch('/api/back/profile/email/activation')
                        .send({ key: emailActivationKey1 })
                        .expect(200, done);
                });
            });

            describe('with incorrect activation key', () => {
                it('expect status 404 (no email request found)', (done) => {
                    request(app)
                        .patch('/api/back/profile/email/activation')
                        .send({ key: 'bad activation key 123457890_12357890_1234567890' })
                        .expect(404, done);
                });
            });

            describe('with correct activation key but request has expired', () => {
                it('expect status 460 (email request has expired)', (done) => {
                    request(app)
                        .patch('/api/back/profile/email/activation')
                        .send({ key: emailActivationKey2 })
                        .expect(460, {
                            message: 'This email request has expired.',
                        }, done);
                });
            });
        });
    });

    describe('[POST/GET] /email/request', () => {
        const emailActivationKey1 = 'correct_email_activation_key1_123567890_1234567890';
        const emailActivationKey2 = 'correct_email_activation_key2_123567890_1234567890';

        const name = 'admin';
        const password = 'password1234';
        const email = 'contact@rarenchronic.net';
        const activationKey = 'a_correct_activation_key_1234567890_1234567890_1234567890';

        before(async () => {
            await startScripts.testModeReinitializeTables();

            // add activated account
            await users.addAccount(name, password, email, activationKey)
                .then(users.activateUser);
            // add email request
            await usersEmailRequests.addEmailRequest(1, email, emailActivationKey1);
        });

        describe('with authenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: true, id: 1 };
                    next();
                });

                allRoutes(app);
            });

            describe('user is authenticated, with correct parameters', () => {
                it('expect status 200 (add email request)', (done) => {
                    request(app)
                        .post('/api/back/profile/email/request')
                        .send({ email })
                        .expect(200, done);
                });
            });

            describe('user is authenticated, with correct parameters', () => {
                it('expect status 200 (get pending email)', (done) => {
                    request(app)
                        .get('/api/back/profile/email/request')
                        .expect(200, {
                            email
                        }, done);
                });
            });
        });

        describe('with authenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: true, id: 6 };
                    next();
                });

                allRoutes(app);
            });

            describe('user is authenticated, with incorrect parameters', () => {
                it('expect status 404 (no email request found)', (done) => {
                    request(app)
                        .get('/api/back/profile/email/request')
                        .expect(404, done);
                });
            });
        });

        describe('with unauthenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: false };
                    next();
                });

                allRoutes(app);
            });

            describe('user is unauthenticated', () => {
                it('expect status 403', (done) => {
                    request(app)
                        .post('/api/back/profile/email/request')
                        .send({
                            message: 'You must be authenticated.',
                        })
                        .expect(403, done);
                });
            });

            describe('user is authenticated', () => {
                it('expect status 403', (done) => {
                    request(app)
                        .get('/api/back/profile/email/request')
                        .expect(403, {
                            message: 'You must be authenticated.',
                        }, done);
                });
            });
        });
    });

    describe('[PATCH] /password /avatar /infos /website /description /display ', () => {
        const name = 'admin';
        const password = 'password1234';
        const email = 'contact@rarenchronic.net';
        const activationKey = 'a_correct_activation_key_1234567890_1234567890_1234567890';

        before(async () => {
            await startScripts.testModeReinitializeTables();

            // add activated account
            await users.addAccount(name, password, email, activationKey)
                .then(users.activateUser);
            // add user infos
            await usersInfos.addNewInfos(1);
        });

        describe('with unauthenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: false };
                    next();
                });

                allRoutes(app);
            });

            describe('user is unauthenticated', () => {
                it('expect status 403', (done) => {
                    request(app)
                        .patch('/api/back/profile/password')
                        .expect(403, done);
                });

                it('expect status 403', (done) => {
                    request(app)
                        .patch('/api/back/profile/avatar')
                        .expect(403, done);
                });

                it('expect status 403', (done) => {
                    request(app)
                        .patch('/api/back/profile/infos')
                        .expect(403, done);
                });

                it('expect status 403', (done) => {
                    request(app)
                        .patch('/api/back/profile/website')
                        .expect(403, done);
                });

                it('expect status 403', (done) => {
                    request(app)
                        .patch('/api/back/profile/description')
                        .expect(403, done);
                });

                it('expect status 403', (done) => {
                    request(app)
                        .patch('/api/back/profile/display')
                        .expect(403, done);
                });
            });
        });

        describe('with authenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: true, id: 1 };
                    next();
                });

                allRoutes(app);
            });

            describe('user is authenticated', () => {
                it('expect status 200 (password updated)', (done) => {
                    request(app)
                        .patch('/api/back/profile/password')
                        .send({
                            password: '12345789012357890',
                        })
                        .expect(200, done);
                });

                it('expect status 200 (avatar updated)', (done) => {
                    request(app)
                        .patch('/api/back/profile/avatar')
                        .send({
                            avatar: 'new avatar url',
                        })
                        .expect(200, done);
                });

                it('expect status 200 (infos updated)', (done) => {
                    request(app)
                        .patch('/api/back/profile/infos')
                        .send({
                            firstName: 'my first name',
                            lastName: 'my last name',
                            phone1: 'my phone 1',
                            phone2: 'my phone 2',
                            address: 'my address',
                            city: 'my city',
                            zipCode: 'my zip code',
                            country: 'my country',
                        })
                        .expect(200, done);
                });

                it('expect status 200 (website updated)', (done) => {
                    request(app)
                        .patch('/api/back/profile/website')
                        .send({
                            website: 'my website url',
                        })
                        .expect(200, done);
                });

                it('expect status 200 (description updated)', (done) => {
                    request(app)
                        .patch('/api/back/profile/description')
                        .send({
                            description: 'my new description',
                        })
                        .expect(200, done);
                });

                it('expect status 200 (display updated)', (done) => {
                    request(app)
                        .patch('/api/back/profile/display')
                        .send({
                            avatar: true,
                            firstName: false,
                            lastName: true,
                            phone1: true,
                            phone2: true,
                            address: false,
                            city: true,
                            zipCode: false,
                            country: true,
                            webSite: true,
                        })
                        .expect(200, done);
                });
            });
        });
    });
});
