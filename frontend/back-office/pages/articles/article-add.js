import moment from 'moment';
import React from 'react';
import PropTypes from 'prop-types';

import './articles.scss';

import AuthorizationContext from '../../components/authorization/authorizationContext';
import ServiceMessage from '../../components/serviceMessage/serviceMessage';
import Loader from '../../components/loader/loader';
import OneColumnPage from '../../components/layout/oneColumnPage';
import AllWidthPage from '../../components/layout/allWidthPage';
import Block from '../../components/layout/block';
import Ariane from '../../components/ariane';
import ArticleForm from '../../components/articles/article-form';

import * as API from '../../api/articles';

import { errorHandler, successHandler } from '../../utils/handlers';

export default class ArticleAdd extends React.Component {
    static propTypes = {
        showToast: PropTypes.func.isRequired,
    };

    state = {
        status: 'draft',
        img: 'img',
        title: 'mon titre',
        content: 'un content',
        commentsOpened: true,
        isPublic: true,
        from: moment.utc(),
        to: null,
    };

    componentDidMount() {
        // this._addArticle();
    }

    _addArticle = () => {
        const { status, img, title, content, commentsOpened, isPublic, from, to } = this.state;
        const dayFrom = from ? from.format('YYYY-MM-DD') : undefined;
        const dayTo = to ? to.format('YYYY-MM-DD'): undefined;
        API.addArticle(status, img, title, content, commentsOpened, isPublic, dayFrom, dayTo)
            .then()
            .catch();
    };

    render() {
        return (
            <AuthorizationContext.Consumer>
                { (authContext) => this.renderContent(authContext) }
            </AuthorizationContext.Consumer>
        );
    }

    renderContent(authContext) {
        if (authContext && authContext.isAuthenticated) {
            return this.renderPage();
        } else {
            return <ServiceMessage message = { `Vous devez être connecté\u00B7e pour accéder à cette page.` } />;
        }
    }

    renderPage() {
        return (
            <AllWidthPage className = 'article-add'>
                <Ariane steps = { ['Articles', 'Écrire un article'] } />
                <ArticleForm
                    showToast = { this.props.showToast } />
            </AllWidthPage>
        );
    }
}
