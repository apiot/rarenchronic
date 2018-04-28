const express = require('express');
const { Joi, celebrate } = require('celebrate');

const { isAuthenticated } = require('../../middlewares/authenticate');
const { hasPermissions } = require('../../middlewares/permissions');

const Files = require('../../services/files/files');

const router = express.Router();

const schemaFiles = {
    query: {
        offset: Joi.number().min(0).integer().required(),
        quantity: Joi.number().min(0).integer().required(),
        categories: Joi.array().items(Joi.string().allow('')),
        name: Joi.string().allow(''),
        isPublic: Joi.boolean().required(),
    },
};

/* full route: api/back/files */
router.route('/')
    .get(isAuthenticated)
    .get(celebrate(schemaFiles))
    .get(hasPermissions(['user.default']))
    .get((req, res, next) => {
        const { offset, quantity, categories = [], name = '', isPublic } = req.query;
        const decodedCategories = categories.map(cat => decodeURIComponent(cat));
        const decodedName = decodeURIComponent(name);

        const params = {
            offset,
            quantity,
            categories: decodedCategories,
            name: decodedName,
            isPublic,
        };

        Files.getPaginatedFilteredFilesByUserId(req.user.id, params)
            .then(([files, total]) => {
                res.status(200);
                res.send({ files, total });
            })
            .catch(next);
    });

/* full route: api/back/files/upload */
router.route('/upload')
    .post(isAuthenticated)
    .post(hasPermissions(['user.default']))
    .post(Files.uploadFile);

/* full route: api/back/files/categories */
router.route('/categories')
    .get(isAuthenticated)
    .get(hasPermissions(['user.default']))
    .get((req, res, next) => {
        const userId = req.user.id;
        Files.getCategories(userId)
            .then((categories) => {
                res.status(200);
                res.send(categories);
            })
            .catch(next);
    });

const schemaFileId = {
    params: { fileId: Joi.number().integer().required() },
};

/* full route: api/back/files/:fileId */
router.route('/:fileId')
    .delete(isAuthenticated)
    .delete(celebrate(schemaFileId))
    .delete(hasPermissions(['user.default']))
    .delete((req, res, next) => {
        const { fileId } = req.params;
        Files.deleteFile(req.user.id, fileId)
            .then(() => res.sendStatus(200))
            .catch(next);
    })

router.route('/:fileId')
    .get(isAuthenticated)
    .get(celebrate(schemaFileId))
    .get(hasPermissions(['user.default']))
    .get((req, res, next) => {
        Files.getOneFile(req.user.id, req.params.fileId)
            .then((file) => {
                res.status(200);
                res.send(file);
            })
            .catch(next);
    });

const schemaName = {
    params: { fileId: Joi.number().integer().required() },
    body: { name: Joi.string().regex(/^.{2,100}$/).required() },
};

/* full route: api/back/files/:fileId/name */
router.route('/:fileId/name')
    .patch(isAuthenticated)
    .patch(celebrate(schemaName))
    .patch(hasPermissions(['user.default']))
    .patch((req, res, next) => {
        const { fileId } = req.params;
        const { name } = req.body;
        Files.updateName(req.user.id, fileId, name)
            .then(() => res.sendStatus(200))
            .catch(next);
    });

const schemaCategory = {
    params: { fileId: Joi.number().integer().required() },
    body: { category: Joi.string().regex(/^.{2,100}$/).required() },
};

/* full route: api/back/files/:fileId/category */
router.route('/:fileId/category')
    .patch(isAuthenticated)
    .patch(celebrate(schemaCategory))
    .patch(hasPermissions(['user.default']))
    .patch((req, res, next) => {
        const { fileId } = req.params;
        const { category } = req.body;
        Files.updateCategory(req.user.id, fileId, category)
            .then(() => res.sendStatus(200))
            .catch(next);
    });

const schemaIsPublic = {
    params: { fileId: Joi.number().integer().required() },
    body: { isPublic: Joi.boolean().required() },
};

/* full route: api/back/files/:fileId/public */
router.route('/:fileId/public')
    .patch(isAuthenticated)
    .patch(celebrate(schemaIsPublic))
    .patch(hasPermissions(['user.default']))
    .patch((req, res, next) => {
        const { fileId } = req.params;
        const { isPublic } = req.body;
        Files.updateIsPublic(req.user.id, fileId, isPublic)
            .then(() => res.sendStatus(200))
            .catch(next);
    });

module.exports = router;
