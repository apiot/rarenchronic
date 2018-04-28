const express = require('express');
const { Joi, celebrate } = require('celebrate');

const { isAuthenticated } = require('../../middlewares/authenticate');
const { hasPermissions } = require('../../middlewares/permissions');

const Articles = require('../../services/articles/articles');

const { ARTICLE_STATUS } = require('../../commons/consts/articles');

const router = express.Router();

const schemaAddArticle = {
    body: {
        status: Joi.string().valid(Object.values(ARTICLE_STATUS)).required(),
        img: Joi.string(),
        title: Joi.string().required(),
        content: Joi.string().required(),
        commentsOpened: Joi.boolean().required(),
        isPublic: Joi.boolean().required(),
        from: Joi.date(),
        to: Joi.date().min(Joi.ref('from')),
    },
};

/* full route: api/back/articles */
router.route('/')
    .put(isAuthenticated)
    .put(celebrate(schemaAddArticle))
    .put(hasPermissions(['user.default']))
    .put((req, res, next) => {
        const article = req.body;
        Articles.addArticle(req.user.id, article)
            .then((articleId) => {
                res.send({ articleId });
            })
            .catch(next);
    });

const schemaGetArticles = {
    body: {
        offset: Joi.number().integer().min(0).required(),
        quantity: Joi.number().integer().min(10).required(),
        categories: Joi.array().items(Joi.string()),
        tags: Joi.array().items(Joi.string()),
        statuses: Joi.array().items(Joi.string()),
        title: Joi.string().allow(''),
        isPublic: Joi.array().items(Joi.string()),
    },
};

/* full route: api/back/articles */
router.route('/')
    .post(isAuthenticated)
    .post(celebrate(schemaGetArticles))
    .post(hasPermissions(['user.default']))
    .post((req, res, next) => {
        Articles.getArticlesByUser(req.user.id, req.body)
            .then(([articles, total]) => {
                res.send({ articles, total });
            })
            .catch(next);
    });

/* full route: api/back/articles */
router.route('/categories')
    .get(isAuthenticated)
    .get((req, res, next) => {
        Articles.getArticlesCategoriesByUserId(req.user.id)
            .then((categories) => {
                res.send(categories);
            })
            .catch(next);
    });


module.exports = router;
