const moment = require('moment');
const _ = require('lodash');

const articles = require('../../model/articles/articles');

const addArticle = (accountId, article) => articles
    .addArticle(Object.assign(article, { author: accountId }));

const getArticlesByUser = (accountId, filters) => {
    const { offset, quantity } = filters;
    const { categories = [], tags = [], statuses = [], title = '', isPublic = [] } = filters;
    const initializedFilters = { categories, tags, statuses, title, isPublic, offset, quantity };

    const totalPromise = articles.getArticlesByUserCount(initializedFilters);
    const articlesPromise = articles.getArticlesByUser(initializedFilters);

    return Promise.all([articlesPromise, totalPromise]);
};

const getArticlesCategoriesByUserId = (userId) => articles
    .getArticlesCategoriesByUserId(userId);

module.exports = {
    addArticle,
    getArticlesByUser,
    getArticlesCategoriesByUserId,
};
