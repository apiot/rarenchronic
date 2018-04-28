const express = require('express');
const { Joi, celebrate } = require('celebrate');

const { isAuthenticated } = require('../../middlewares/authenticate');

const UpdateEmail = require('../../services/profile/updateEmail');
const Profile = require('../../services/profile/profile');

const dates = require('../../commons/dates');

const router = express.Router();

/* full route: api/back/profile */
router.route('/')
    .get(isAuthenticated)
    .get((req, res, next) => {
        Profile.getAccountInfos(req.user.id)
            .then((infos) => {
                const formattedDates = {
                    created: dates.readDate(req.user.created),
                    lastConnexion: dates.readDate(req.user.lastConnexion),
                    lastLoginAttempt: dates.readDate(req.user.lastLoginAttempt),
                };

                res.status(200);
                res.send({
                    account: Object.assign({}, req.user, formattedDates, infos),
                });
            })
            .catch(next);
    });

/* full route: api/back/profile/connexion */
router.route('/connexion')
    .delete(isAuthenticated)
    .delete((req, res, next) => {
        const { userToken } = req.signedCookies;
        Profile.deleteConnexion(req.user.id, req.signedCookies.userToken)
            .then(() => res.sendStatus(200))
            .catch(next);
    });

const schemaEmailActivation = {
    body: {
        key: Joi.string().regex(/^.{40,100}$/).required(),
    },
};

/* full route: api/back/profile/email/activation */
router.route('/email/activation')
    .patch(celebrate(schemaEmailActivation))
    .patch((req, res, next) => {
        UpdateEmail.activateEmail(req.body.key)
            .then(() => res.sendStatus(200))
            .catch(next);
    });

const schemaEmail = {
    body: {
        email: Joi.string().email().required(),
    },
};

/* full route: api/back/profile/email/request */
router.route('/email/request')
    .post(isAuthenticated)
    .post(celebrate(schemaEmail))
    .post((req, res, next) => {
        UpdateEmail.createEmailRequest(req.user.id, req.body.email)
            .then(() => res.sendStatus(200))
            .catch(next);
    });

const schemaPassword = {
    body: {
        newPassword: Joi.string().regex(/^.{8,100}$/).required(),
        oldPassword: Joi.string().regex(/^.{8,100}$/).required(),
    },
};

/* full route: api/back/profile/password */
router.route('/password')
    .patch(isAuthenticated)
    .patch(celebrate(schemaPassword))
    .patch((req, res, next) => {
        const { newPassword, oldPassword } = req.body;
        Profile.updatePassword(req.user.id, newPassword, oldPassword)
            .then(() => res.sendStatus(200))
            .catch(next);
    });

const schemaAvatar = {
    body: {
        avatar: Joi.string().required(),
    },
};

/* full route: api/back/profile/avatar */
router.route('/avatar')
    .patch(isAuthenticated)
    .patch(celebrate(schemaAvatar))
    .patch((req, res, next) => {
        Profile.updateAvatar(req.user.id, req.body.avatar)
            .then(() => res.sendStatus(200))
            .catch(next);
    });

const schemaInfos = {
    body: {
        firstName: Joi.string().regex(/^.{2,300}$/).required(),
        lastName: Joi.string().regex(/^.{2,300}$/).required(),
        phone1: Joi.string().regex(/^.{2,300}$/).required(),
        phone2: Joi.string().regex(/^.{2,300}$/).required(),
        address: Joi.string().regex(/^.{2,500}$/).required(),
        city: Joi.string().regex(/^.{2,300}$/).required(),
        zipCode: Joi.string().regex(/^.{2,300}$/).required(),
        country: Joi.string().regex(/^.{2,300}$/).required(),
    },
};

/* full route: api/back/profile/infos */
router.route('/infos')
    .patch(isAuthenticated)
    .patch(celebrate(schemaInfos))
    .patch((req, res, next) => {
        Profile.updateInfos(req.user.id, req.body)
            .then(() => res.sendStatus(200))
            .catch(next);
    });

const schemaWebsite = {
    body: {
        website: Joi.string().allow('').required(),
    },
};

/* full route: api/back/profile/website */
router.route('/website')
    .patch(isAuthenticated)
    .patch(celebrate(schemaWebsite))
    .patch((req, res, next) => {
        Profile.updateWebsite(req.user.id, req.body.website)
            .then(() => res.sendStatus(200))
            .catch(next);
    });

const schemaDescription = {
    body: {
        description: Joi.string().allow('').required(),
    },
};

/* full route: api/back/profile/description */
router.route('/description')
    .patch(isAuthenticated)
    .patch(celebrate(schemaDescription))
    .patch((req, res, next) => {
        Profile.updateDescription(req.user.id, req.body.description)
            .then(() => res.sendStatus(200))
            .catch(next);
    });

const schemaDisplay = {
    body: {
        avatar: Joi.boolean().required(),
        firstName: Joi.boolean().required(),
        lastName: Joi.boolean().required(),
        phone1: Joi.boolean().required(),
        phone2: Joi.boolean().required(),
        address: Joi.boolean().required(),
        city: Joi.boolean().required(),
        zipCode: Joi.boolean().required(),
        country: Joi.boolean().required(),
        website: Joi.boolean().required(),
    },
};

/* full route: api/back/profile/display */
router.route('/display')
    .patch(isAuthenticated)
    .patch(celebrate(schemaDisplay))
    .patch((req, res, next) => {
        Profile.updateDisplay(req.user.id, req.body)
            .then(() => res.sendStatus(200))
            .catch(next);
    });

module.exports = router;
