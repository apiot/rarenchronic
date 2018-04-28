import axios from 'axios';

function addArticle(status, img, title, content, commentsOpened, isPublic, from, to) {
    const body = { status, img, title, content, commentsOpened, isPublic, from, to };
    return axios.put('/api/back/articles', body);
}

function getArticlesByUser(args) {
    return axios.post('/api/back/articles', args);
}

function getArticleCategoriesByUser() {
    return axios.get('api/back/articles/categories');
}

export {
    addArticle,
    getArticlesByUser,
    getArticleCategoriesByUser,
};
