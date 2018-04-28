const request = require('supertest');

const { getNewAppInstance } = require('../helpers');

const db = require('../../db');

const startScripts = require('../../startScripts');
const environement = require('../../environment');
const { allRoutes } = require('../../routes/routes');

const users = require('../../model/users/users');
const usersTokens = require('../../model/users/usersTokens');
const usersPassword = require('../../model/users/usersPasswordRequests');

describe('routes/back-office/accounts', () => {
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

    describe('[POST] /create', () => {
        before(async () => {
            await startScripts.testModeReinitializeTables();
        });

        describe('With unauthenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: false };
                    next();
                });

                allRoutes(app);
            });

            describe('user is unauthenticated, with incorrect name', () => {
                it('expect status 400', (done) => {
                    request(app)
                        .post('/api/back/accounts/create')
                        .send({
                            name: 'a',
                            password: 'password1234',
                            email: 'contact@rarenchronic.net',
                        })
                        .expect(400, done);
                });
            });

            describe('user is unauthenticated, with incorrect password', () => {
                it('expect status 400', (done) => {
                    request(app)
                        .post('/api/back/accounts/create')
                        .send({
                            name: 'admin',
                            password: 'a',
                            email: 'contact@rarenchronic.net',
                        })
                        .expect(400, done);
                });
            });

            describe('user is unauthenticated, with incorrect email', () => {
                it('expect status 400', (done) => {
                    request(app)
                        .post('/api/back/accounts/create')
                        .send({
                            name: 'admin',
                            password: 'password1234',
                            email: 'bad email',
                        })
                        .expect(400, done);
                });
            });

            describe('user is unauthenticated, with correct parameters, create an unactivated account', () => {
                it('expect status 200', (done) => {
                    request(app)
                        .post('/api/back/accounts/create')
                        .send({
                            name: 'admin',
                            password: 'password1234',
                            email: 'contact@rarenchronic.net',
                        })
                        .expect(200, done);
                });
            });

            describe('user is unauthenticated, with correct parameters, email already taken (less than 7 days)', () => {
                it('expect status 400', (done) => {
                    request(app)
                        .post('/api/back/accounts/create')
                        .send({
                            name: 'admin',
                            password: 'password1234',
                            email: 'contact@rarenchronic.net',
                        })
                        .expect(400, {
                            message: 'This email is already taken by another account.'
                        }, done);
                });
            });
        });

        describe('With authenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: true };
                    next();
                });

                allRoutes(app);
            });

            describe('user is authenticated, with incorrect parameters', () => {
                it('expect status 400 (authenticate middleware first)', (done) => {
                    request(app)
                        .post('/api/back/accounts/create')
                        .send({
                            name: 'a',
                            password: 'a',
                            email: 'bad email',
                        })
                        .expect(400, {
                            message: 'You should not be authenticated.'
                        }, done);
                });
            });

            describe('user is authenticated, with correct parameters', () => {
                it('expect status 400 (authenticate middleware first)', (done) => {
                    request(app)
                        .post('/api/back/accounts/create')
                        .send({
                            name: 'admin',
                            password: 'password1234',
                            email: 'contact@rarenchronic.net',
                        })
                        .expect(400, {
                            message: 'You should not be authenticated.'
                        }, done);
                });
            });
        });
    });

    describe('[PATCH] /activation', () => {
        const name = 'admin';
        const password = 'password1234';
        const email1 = 'contact@rarenchronic1.net';
        const email2 = 'contact@rarenchronic2.net';
        const email3 = 'contact@rarenchronic3.net';
        const email4 = 'contact@rarenchronic4.net';
        const email5 = 'contact@rarenchronic5.net';
        const activationKey1 = 'a_correct_activation_key1_1234567890_1234567890_1234567890';
        const activationKey2 = 'a_correct_activation_key2_1234567890_1234567890_1234567890';
        const activationKey3 = 'a_correct_activation_key3_1234567890_1234567890_1234567890';
        const activationKey4 = 'a_correct_activation_key4_1234567890_1234567890_1234567890';
        const badActivationKey = 'bad_activation_key_1234567890_1234567890_1234567890';

        before(async () => {
            await startScripts.testModeReinitializeTables();

            // add unactivated account
            await users.addAccount(name, password, email1, activationKey1);
            // add unactivated account
            await users.addAccount(name, password, email2, activationKey2);
            // add activated account
            await users.addAccount(name, password, email3, activationKey3);
            await db.query('UPDATE users SET activated = TRUE WHERE email = ?', [email3]);
            // add deleted account
            await users.addAccount(name, password, email4, activationKey4);
            await db.query('UPDATE users SET deleted = TRUE WHERE email = ?', [email4]);
            // add duplicate key for an unactivated account
            await users.addAccount(name, password, email5, activationKey2);
        });

        describe('With unauthenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: false };
                    next();
                });

                allRoutes(app);
            });

            describe('user is unauthenticated, with correct parameters', () => {
                it('expect status 200 (activate account)', (done) => {
                    request(app)
                        .patch('/api/back/accounts/activation')
                        .send({ key: activationKey1 })
                        .expect(200, done);
                });
            });

            describe('user is unauthenticated, with correct parameters', () => {
                it('expect status 400 (account already activated)', (done) => {
                    request(app)
                        .patch('/api/back/accounts/activation')
                        .send({ key: activationKey3 })
                        .expect(400, {
                            message: 'Invalid activation key.'
                        }, done);
                });
            });

            describe('user is unauthenticated, with correct parameters', () => {
                it('expect status 400 (account is deleted)', (done) => {
                    request(app)
                        .patch('/api/back/accounts/activation')
                        .send({ key: activationKey4 })
                        .expect(400, {
                            message: 'Invalid activation key.'
                        }, done);
                });
            });

            describe('user is unauthenticated, with correct parameters', () => {
                it('expect status 400 (duplicated account with same key)', (done) => {
                    request(app)
                        .patch('/api/back/accounts/activation')
                        .send({ key: activationKey2 })
                        .expect(530, done);
                });
            });

            describe('user is unauthenticated, with incorrect parameters', () => {
                it('expect status 400 (incorrect activation key)', (done) => {
                    request(app)
                        .patch('/api/back/accounts/activation')
                        .send({ key: badActivationKey })
                        .expect(400, {
                            message: 'Invalid activation key.'
                        }, done);
                });
            });

            describe('user is unauthenticated, with incorrect parameters', () => {
                it('expect status 400 (key too small for celebrate)', (done) => {
                    request(app)
                        .patch('/api/back/accounts/activation')
                        .send({ key: 'too_small_key' })
                        .expect(400, done);
                });
            });
        });

        describe('With authenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: true };
                    next();
                });

                allRoutes(app);
            });

            describe('user is authenticated, with incorrect parameters', () => {
                it('expect status 400 (authenticate middleware first)', (done) => {
                    request(app)
                        .patch('/api/back/accounts/activation')
                        .query({ key: 'bad key' })
                        .expect(400, {
                            message: 'You should not be authenticated.'
                        }, done);
                });
            });
        });
    });

    describe('[POST]  /login', () => {
        const name = 'admin';
        const password = 'password1234';
        const email1 = 'contact@rarenchronic1.net';
        const email2 = 'contact@rarenchronic2.net';
        const email3 = 'contact@rarenchronic3.net';
        const email4 = 'contact@rarenchronic4.net';
        const activationKey1 = 'a_correct_activation_key1_1234567890_1234567890_1234567890';
        const activationKey2 = 'a_correct_activation_key2_1234567890_1234567890_1234567890';
        const activationKey3 = 'a_correct_activation_key3_1234567890_1234567890_1234567890';
        const activationKey4 = 'a_correct_activation_key4_1234567890_1234567890_1234567890';

        before(async () => {
            await startScripts.testModeReinitializeTables();

            // add unactivated account
            await users.addAccount(name, password, email1, activationKey1);
            // add activated account
            await users.addAccount(name, password, email2, activationKey2);
            await db.query('UPDATE users SET activated = TRUE WHERE email = ?', [email2]);
            // add deleted account
            await users.addAccount(name, password, email3, activationKey3);
            await db.query('UPDATE users SET deleted = TRUE WHERE email = ?', [email3]);
            // add activated account
            await users.addAccount(name, password, email4, activationKey4);
            await db.query('UPDATE users SET activated = TRUE WHERE email = ?', [email4]);
        });

        describe('With unauthenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: false };
                    next();
                });

                allRoutes(app);
            });

            describe('user is unauthenticated, with correct parameters', () => {
                it('expect status 200 (logged account)', (done) => {
                    request(app)
                        .post('/api/back/accounts/login')
                        .send({
                            email: email2,
                            password,
                         })
                        .expect(200, done);
                });
            });

            describe('user is unauthenticated, with correct parameters', () => {
                it('expect status 403 (login retry too soon)', (done) => {
                    request(app)
                        .post('/api/back/accounts/login')
                        .send({
                            email: email2,
                            password,
                         })
                         .expect(403, {
                             message: 'Login can be attempted every 3 seconds.'
                         }, done);
                });
            });

            describe('user is unauthenticated, with correct parameters', () => {
                it('expect status 400 (account is not activated)', (done) => {
                    request(app)
                        .post('/api/back/accounts/login')
                        .send({
                            email: email1,
                            password,
                         })
                         .expect(400, {
                             message: 'This account is not activated.'
                         }, done);
                });
            });

            describe('user is unauthenticated, with correct parameters', () => {
                it('expect status 404 (account is deleted)', (done) => {
                    request(app)
                        .post('/api/back/accounts/login')
                        .send({
                            email: email3,
                            password,
                         })
                         .expect(404, {
                             message: 'This account does not exist.'
                         }, done);
                });
            });

            describe('user is unauthenticated, with incorrect parameters', () => {
                it('expect status 400 (incorrect password)', (done) => {
                    request(app)
                        .post('/api/back/accounts/login')
                        .send({
                            email: email4,
                            password: 'bad password',
                         })
                         .expect(400, {
                             message: 'Incorrect password.'
                         }, done);
                });
            });
        });

        describe('With authenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: true };
                    next();
                });

                allRoutes(app);
            });

            describe('user is authenticated', () => {
                it('expect status 400 (authenticate middleware first)', (done) => {
                    request(app)
                        .post('/api/back/accounts/login')
                        .send({
                            email: email2,
                            password,
                         })
                        .expect(400, {
                            message: 'You should not be authenticated.'
                        }, done);
                });
            });
        });
    });

    describe('[POST]  /logout', () => {
        const name = 'admin';
        const password = 'password1234';
        const email = 'contact@rarenchronic.net';
        const activationKey = 'a_correct_activation_key_1234567890_1234567890_1234567890';

        let token;
        let salt;

        before(async () => {
            await startScripts.testModeReinitializeTables();

            // add activated account and a token
            await users.addAccount(name, password, email, activationKey).then(users.activateUser);
            await users.getUserByEmail(email)
                .then(async (account) => {
                    token = await usersTokens.addToken(account);
                    salt = account.salt;
                });
        });

        describe('With unauthenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: false };
                    next();
                });

                allRoutes(app);
            });

            describe('user is unauthenticated', () => {
                it('expect status 400 (authenticate middleware first)', (done) => {
                    request(app)
                        .post('/api/back/accounts/logout')
                        .expect(403, {
                            message: 'You must be authenticated.'
                        }, done);
                });
            });
        });

        describe('With authenticated user, with correct parameters', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: true, id: 1, salt };
                    req.signedCookies = { userToken: token };
                    next();
                });

                allRoutes(app);
            });

            describe('user is authenticated', () => {
                it('expect status 200 (user is logout)', (done) => {
                    request(app)
                        .post('/api/back/accounts/logout')
                        .expect(200, done);
                });
            });
        });

        describe('With authenticated user, with incorrect parameters', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: true, id: 1, salt };
                    req.signedCookies = { userToken: 'bad token' };
                    next();
                });

                allRoutes(app);
            });

            describe('user is authenticated', () => {
                it('expect status 404 (not found)', (done) => {
                    request(app)
                        .post('/api/back/accounts/logout')
                        .expect(404, done);
                });
            });
        });
    });

    describe('[POST]  /logout/all', () => {
        const name = 'admin';
        const password = 'password1234';
        const email = 'contact@rarenchronic.net';
        const activationKey = 'a_correct_activation_key_1234567890_1234567890_1234567890';

        let token1, token2;
        let salt;

        before(async () => {
            await startScripts.testModeReinitializeTables();

            // add activated account and a token
            await users.addAccount(name, password, email, activationKey).then(users.activateUser);
            await users.getUserByEmail(email)
                .then(async (account) => {
                    token1 = await usersTokens.addToken(account);
                    token2 = await usersTokens.addToken(account);
                    salt = account.salt;
                });
        });

        describe('With unauthenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: false };
                    next();
                });

                allRoutes(app);
            });

            describe('user is unauthenticated', () => {
                it('expect status 400 (authenticate middleware first)', (done) => {
                    request(app)
                        .post('/api/back/accounts/logout/all')
                        .expect(403, {
                            message: 'You must be authenticated.'
                        }, done);
                });
            });
        });

        describe('With authenticated user, with correct parameters', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: true, id: 1 };
                    next();
                });

                allRoutes(app);
            });

            describe('user is authenticated', () => {
                it('expect status 200 (all tokens are deleted)', (done) => {
                    request(app)
                        .post('/api/back/accounts/logout/all')
                        .expect(200, done);
                });
            });
        });

        describe('With authenticated user, with incorrect parameters', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: true, id: 100 };
                    next();
                });

                allRoutes(app);
            });

            describe('user is authenticated', () => {
                it('expect status 404 (not found, incorrect id)', (done) => {
                    request(app)
                        .post('/api/back/accounts/logout/all')
                        .expect(404, done);
                });
            });
        });
    });

    describe('[GET]  /authorization', () => {
        before(async () => {
            await startScripts.testModeReinitializeTables();
        });

        describe('With authenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: true };
                    next();
                });

                allRoutes(app);
            });

            describe('user is authenticated', () => {
                it('expect status 200 (no permission, no group)', (done) => {
                    request(app)
                        .get('/api/back/accounts/authorization')
                        .expect(200, {
                            authenticated: true,
                        }, done);
                });
            });
        });

        describe('With authenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = {
                        authenticated: true,
                        permissions: ['toto', 'tata'],
                        groups: ['group1', 'group2'],
                    };
                    next();
                });

                allRoutes(app);
            });

            describe('user is authenticated', () => {
                it('expect status 200 (with permissions and groups)', (done) => {
                    request(app)
                        .get('/api/back/accounts/authorization')
                        .expect(200, {
                            authenticated: true,
                            permissions: ['toto', 'tata'],
                            groups: ['group1', 'group2'],
                        }, done);
                });
            });
        });

        describe('With unauthenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: false };
                    next();
                });

                allRoutes(app);
            });

            describe('user is unauthenticated', () => {
                it('expect status 200', (done) => {
                    request(app)
                        .get('/api/back/accounts/authorization')
                        .expect(200, {
                            authenticated: false,
                        }, done);
                });
            });
        });
    });

    describe('[GET]  /email/activation', () => {
        const name = 'admin';
        const password = 'password1234';
        const email1 = 'contact@rarenchronic1.net';
        const email2 = 'contact@rarenchronic.net';
        const activationKey1 = 'a_correct_activation_key1_1234567890_1234567890_1234567890';
        const activationKey2 = 'a_correct_activation_key2_1234567890_1234567890_1234567890';

        before(async () => {
            await startScripts.testModeReinitializeTables();

            // add activated account
            await users.addAccount(name, password, email1, activationKey1).then(users.activateUser);
            // add unactivated account
            await users.addAccount(name, password, email2, activationKey1);
        });

        describe('With authenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: true };
                    next();
                });

                allRoutes(app);
            });

            describe('user is authenticated', () => {
                it('expect status 400 (authenticate middleware first)', (done) => {
                    request(app)
                        .get('/api/back/accounts/email/activation')
                        .expect(400, done);
                });
            });
        });

        describe('With unauthenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: false };
                    next();
                });

                allRoutes(app);
            });

            describe('user is unauthenticated', () => {
                it('expect status 200 (activation email re-send)', (done) => {
                    request(app)
                        .get('/api/back/accounts/email/activation')
                        .send({ email: email2})
                        .expect(200, done);
                });
            });

            describe('user is unauthenticated', () => {
                it('expect status 400 (account is not activated)', (done) => {
                    request(app)
                        .get('/api/back/accounts/email/activation')
                        .send({ email: email1})
                        .expect(400, {
                            message: 'This account is already activated.',
                        }, done);
                });
            });

            describe('user is unauthenticated, with incorrect paramters', () => {
                it('expect status 404 (incorrect email)', (done) => {
                    request(app)
                        .get('/api/back/accounts/email/activation')
                        .send({ email: 'toto@toto.com' })
                        .expect(404, {
                            message: 'This account does not exist.',
                        }, done);
                });
            });
        });
    });

    describe('[GET]  /password', () => {
        const name = 'admin';
        const password = 'password1234';
        const email1 = 'contact@rarenchronic.net';
        const email2 = 'contact@rarenchronic2.net';
        const email3 = 'contact@rarenchronic3.net';
        const activationKey1 = 'a_correct_activation_key1_1234567890_1234567890_1234567890';
        const activationKey2 = 'a_correct_activation_key2_1234567890_1234567890_1234567890';
        const activationKey3 = 'a_correct_activation_key3_1234567890_1234567890_1234567890';

        before(async () => {
            await startScripts.testModeReinitializeTables();

            // add activated account
            await users.addAccount(name, password, email1, activationKey1).then(users.activateUser);
            // add unactivated account
            await users.addAccount(name, password, email2, activationKey2);
            // add activated account and a password request
            await users.addAccount(name, password, email3, activationKey3).then(users.activateUser);
            await usersPassword.addPasswordRequest(3, password);
        });

        describe('With authenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: true };
                    next();
                });

                allRoutes(app);
            });

            describe('user is authenticated', () => {
                it('expect status 400 (authenticate middleware first)', (done) => {
                    request(app)
                        .get('/api/back/accounts/password')
                        .expect(400, done);
                });
            });
        });

        describe('With unauthenticated user', () => {
            before(() => {
                app = getNewAppInstance();
                app.use((req, res, next) => {
                    req.user = { authenticated: false };
                    next();
                });

                allRoutes(app);
            });

            describe('user is unauthenticated', () => {
                it('expect status 200 (new password email send)', (done) => {
                    request(app)
                        .get('/api/back/accounts/password')
                        .send({ email: email1})
                        .expect(200, done);
                });
            });

            describe('user is unauthenticated', () => {
                it('expect status 400 (account is not activated)', (done) => {
                    request(app)
                        .get('/api/back/accounts/password')
                        .send({ email: email2})
                        .expect(400, {
                            message: 'This account is not activated.',
                        }, done);
                });
            });

            describe('user is unauthenticated', () => {
                it('expect status 403 (too soon for password request)', (done) => {
                    request(app)
                        .get('/api/back/accounts/password')
                        .send({ email: email3})
                        .expect(403, {
                            message: 'You can attempt to generate a new password every 5 minutes.',
                        }, done);
                });
            });

            describe('user is unauthenticated, with incorrect parameters', () => {
                it('expect status 404 (incorrect email)', (done) => {
                    request(app)
                        .get('/api/back/accounts/password')
                        .send({ email: 'toto@toto.com'})
                        .expect(404, {
                            message: 'This account does not exist.',
                        }, done);
                });
            });
        });
    });
});
