const express = require('express');
const { Joi, celebrate } = require('celebrate');

const { cookieLoginOptions } = require('../../commons/consts/cookies');

const { isNotAuthenticated, isAuthenticated } = require('../../middlewares/authenticate');

const Create = require('../../services/accounts/create');
const Activation = require('../../services/accounts/activation');
const Login = require('../../services/accounts/login');
const Account = require('../../services/accounts/account');

const router = express.Router();

const schemaCreate = {
    body: {
        name: Joi.string().regex(/^.{2,100}$/).required(),
        password: Joi.string().regex(/^.{8,100}$/).required(),
        email: Joi.string().email().required(),
    },
};

/* full route: api/back/accounts/create */
router.route('/create')
    .post(isNotAuthenticated)
    .post(celebrate(schemaCreate))
    .post((req, res, next) => {
        const { name, password, email } = req.body;

        Create.createUser({ name, password, email })
            .then(() => res.sendStatus(200))
            .catch(next);
    });

const schemaActivation = {
    body: {
        key: Joi.string().regex(/^.{40,100}$/).required(),
    },
};

/* full route: api/back/accounts/activation */
router.route('/activation')
    .patch(isNotAuthenticated)
    .patch(celebrate(schemaActivation))
    .patch((req, res, next) => {
        const { key } = req.body;

        Activation.activateUser(key)
            .then(() => res.sendStatus(200))
            .catch(next);
    });

const schemaLogin = {
    body: {
        email: Joi.string().email().required(),
        password: Joi.string().regex(/^.{8,100}$/).required(),
    },
};

/* full route: api/back/accounts/login */
router.route('/login')
    .post(isNotAuthenticated)
    .post(celebrate(schemaLogin))
    .post((req, res, next) => {
        const { email, password } = req.body;

        Login.manualLogin(email, password)
            .then((response) => {
                const { userId, userToken } = response;

                res.cookie('userId', userId, cookieLoginOptions);
                res.cookie('userToken', userToken, cookieLoginOptions);
                res.sendStatus(200);
            })
            .catch(next);
    });


/* full route: api/back/accounts/logout/all */
router.route('/logout/all')
    .post(isAuthenticated)
    .post((req, res, next) => {
        Login.logoutAll(req.user.id)
            .then(() => {
                res.clearCookie('userId');
                res.clearCookie('userToken');
                res.sendStatus(200);
            })
            .catch((err) => {
                res.clearCookie('userId');
                res.clearCookie('userToken');
                next(err);
            });
    });

/* full route: api/back/accounts/logout */
router.route('/logout')
    .post(isAuthenticated)
    .post((req, res, next) => {
        Login.logout(req.user.id, req.signedCookies.userToken)
            .then(() => {
                res.clearCookie('userId');
                res.clearCookie('userToken');
                res.sendStatus(200);
            })
            .catch((err) => {
                res.clearCookie('userId');
                res.clearCookie('userToken');
                next(err);
            });
    });

/* full route: api/back/accounts/authorization */
router.route('/authorization')
    .get((req, res) => {
        const { user } = req;

        res.status(200);
        if (user.authenticated) {
            res.send({
                authenticated: true,
                permissions: user.permissions,
                groups: user.groups,
            });
        } else {
            res.send({
                authenticated: false,
            });
        }
    });

const schemaEmail = {
    body: {
        email: Joi.string().email().required(),
    },
};

/* full route: api/back/accounts/email/activation */
router.route('/email/activation')
    .get(isNotAuthenticated)
    .get(celebrate(schemaEmail))
    .get((req, res, next) => {
        Account.reSendActivation(req.body.email)
            .then(() => res.sendStatus(200))
            .catch(next);
    });

/* full route: api/back/accounts/password */
router.route('/password')
    .get(isNotAuthenticated)
    .get(celebrate(schemaEmail))
    .get((req, res, next) => {
        Account.sendNewPassword(req.body.email)
            .then(() => res.sendStatus(200))
            .catch(next);
    });

module.exports = router;
