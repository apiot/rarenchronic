import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

import 'react-select/dist/react-select.css';

import './articles.scss';

import AuthorizationContext from '../../components/authorization/authorizationContext';
import ServiceMessage from '../../components/serviceMessage/serviceMessage';
import Loader from '../../components/loader/loader';
import OneColumnPage from '../../components/layout/oneColumnPage';
import Block from '../../components/layout/block';
import Ariane from '../../components/ariane';
import Pagination from '../../components/pagination/pagination';
import ArticleLine from '../../components/articles/article-line';

import * as API from '../../api/articles';

import { errorHandler } from '../../utils/handlers';
import {
    ARTICLE_STATUS,
    ARTICLE_STATUS_LABELS,
    ARTICLE_PUBLIC,
    ARTICLE_PUBLIC_LABELS,
} from '../../consts/articles';

export default class Articles extends React.Component {
    static propTypes = {
        showToast: PropTypes.func.isRequired,
    };

    state = this.getInitialState();

    getInitialState() {
        return {
            articles: [],
            pagination: {
                offset: 0,
                quantity: 10,
                total: 0
            },
            filters: {
                statuses: [],
                categories: [],
                tags: [],
                title: '',
                isPublic: [],
            },
            forSelect: {
                categoriesOptions: [],
                tagsOptions: [],
                statusOptions: Object.values(ARTICLE_STATUS)
                    .map(s => ({ label: ARTICLE_STATUS_LABELS[s], value: s })),
                publicOptions: Object.values(ARTICLE_PUBLIC)
                    .map(p => ({ label: ARTICLE_PUBLIC_LABELS[p], value: p })),
            },
        };
    }

    componentDidMount() {
        this.debouncedLoad = _.debounce(this._loadArticles, 300);
        this._loadArticles();
    }

    _onReset = () => {
        this.setState(this.getInitialState());

        this.debouncedLoad();
    };

    _loadArticles = () => {
        const { offset, quantity } = this.state.pagination;
        const { statuses, categories, tags, title, isPublic } = this.state.filters;
        const args = {
            offset,
            quantity,
            categories: categories.map(c => c.value),
            tags: tags.map(t => t.value),
            statuses: statuses.map(s => s.value),
            title,
            isPublic: isPublic.map(p => p.value),
        };

        API.getArticlesByUser(args)
            .then((axiosResponse) => {
                const { articles, total } = axiosResponse.data;
                this.setState({
                    articles: articles || [],
                    pagination: Object.assign({}, this.state.pagination, { total }),
                });
            })
            .catch(errorHandler(this.props.showToast));
    };

    _onChangePage = (offset) => {
        this.setState({
            pagination: Object.assign({}, this.state.pagination, { offset }),
        });

        this.debouncedLoad();
    };

    onChangeSelect = (options, type) => {
        this.setState({
            filters: Object.assign({}, this.state.filters, { [type]: options }),
        });

        this.debouncedLoad();
    };

    _onChangeTitle = (event) => {
        const title = event.target.value;
        this.setState({
            filters: Object.assign({}, this.state.filters, { title }),
        });

        if (this.state.filters.title.length > 0) {
            this.debouncedLoad();
        }
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
            <OneColumnPage className = 'articles'>
                <Ariane steps = { ['Articles'] } />
                { this.renderPagination() }
                <Block title = 'Gestion de mes articles' >
                    <React.Fragment>
                        { this.renderFilters() }
                        { this.renderArticles() }
                    </React.Fragment>
                </Block>
                { this.renderPagination() }
            </OneColumnPage>
        );
    }

    renderPagination() {
        const domainUrl = location.origin;
        const { offset, quantity, total } = this.state.pagination;
        return (
            <div className = 'articles__pagination'>
                <a href = { `${domainUrl}/#/back-office/article/add` }>
                    <i className = 'fas fa-pen icon-button'
                        title = 'Écrire un article' />
                </a>
                <Pagination
                    offset = { offset }
                    quantity = { quantity }
                    total = { total }
                    onChangePage = { this._onChangePage } />
            </div>
        );
    }

    renderFilters() {
        const { categoriesOptions, tagsOptions, statusOptions, publicOptions } = this.state.forSelect;
        const { statuses, categories, tags, title, isPublic } = this.state.filters;
        console.log(publicOptions);
        return (
            <div className = 'articles__filters'>
                <Select
                    className = 'articles__filters__select'
                    placeholder = { 'Catégories' }
                    multi = { true }
                    value = { categories }
                    options = { categoriesOptions }
                    onChange = { options => this.onChangeSelect(options, 'categories') }
                    />
                <Select
                    className = 'articles__filters__select'
                    placeholder = { 'Tags' }
                    multi = { true }
                    value = { tags }
                    options = { tagsOptions }
                    onChange = { options => this.onChangeSelect(options, 'tags') }
                    />
                <Select
                    className = 'articles__filters__select'
                    placeholder = { 'Statut' }
                    multi = { true }
                    value = { statuses }
                    options = { statusOptions }
                    onChange = { options => this.onChangeSelect(options, 'statuses') }
                    />
                <Select
                    className = 'articles__filters__is-public'
                    placeholder = { 'Visibilité' }
                    multi = { true }
                    value = { isPublic }
                    options = { publicOptions }
                    onChange = { options => this.onChangeSelect(options, 'isPublic') }
                    />
                <input className = 'articles__filters__title-input'
                    type = 'text'
                    placeholder = 'Titre'
                    value = { title }
                    onChange = { this._onChangeTitle } />
                <input
                    onClick = { this._onReset }
                    type = 'reset'
                    value = 'Réinitialiser' />
            </div>
        );
    }

    renderArticles() {
        const articles = this.state.articles.map(article =>
            <ArticleLine
                key = { article.id }
                showToast = { this.props.showToast }
                article = { article } />
        );
        return (
            <React.Fragment>{ articles }</React.Fragment>
        );
    }
}
