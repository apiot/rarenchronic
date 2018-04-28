import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Toast from 'react-alert';

import './assets/fonts/font-awesome-all.js';

import './global.scss';

import Authorization from './components/authorization/authorization';
import AuthorizationContext from './components/authorization/authorizationContext';

import EscapeRoot from './components/escape/escapeRoot';
import EscapeContext from './components/escape/escapeContext';

import Articles from './pages/articles/articles';
import ArticleAdd from './pages/articles/article-add';
import ArticleManage from './pages/articles/article-manage';
import Home from './pages/home';
import Layout from './pages/layout';
import Login from './pages/login';
import Logout from './pages/logout';
import NotFound from './pages/notFound';
import Profile from './pages/profile';

import AccountActivation from './pages/activation/accounts';
import EmailActivation from './pages/activation/emails';

export default class Router extends React.Component {
    render() {
        return (
            <React.Fragment>
                <EscapeRoot>
                    { escapeHandlers => (
                        <Authorization>
                            { (authContext, reloadAuthorization) => (
                                <EscapeContext.Provider value = { escapeHandlers }>
                                    <AuthorizationContext.Provider value = { authContext }>
                                        <Layout showToast = { this.showToast } >
                                            { this.renderRouter(reloadAuthorization) }
                                        </Layout>
                                    </AuthorizationContext.Provider>
                                </EscapeContext.Provider>
                            ) }
                        </Authorization>
                    ) }
                </EscapeRoot>
                { this.renderToast() }
            </React.Fragment>
        );
    }

    renderToast() {
        return (
            <Toast
                ref = { a => this.toastMessage = a }
                offset = { 10 }
                position = { 'top right' }
                theme = { 'light' }
                time = { 7000 }
                zIndex = { 120 }
                transition = { 'fade' } />
        );
    }

    renderRouter(reloadAuthorization) {
        return (
            <HashRouter>
                <Switch>
                    { this.renderRoute('/back-office/accounts/activation', AccountActivation) }
                    { this.renderRoute('/back-office/profile/email-activation', EmailActivation) }
                    { this.renderRoute('/back-office/article/:articleId/manage', ArticleManage, reloadAuthorization) }
                    { this.renderRoute('/back-office/article/add', ArticleAdd, reloadAuthorization) }
                    { this.renderRoute('/back-office/articles', Articles, reloadAuthorization) }
                    { this.renderRoute('/back-office/login', Login, reloadAuthorization) }
                    { this.renderRoute('/back-office/logout', Logout, reloadAuthorization) }
                    { this.renderRoute('/back-office/profile', Profile, reloadAuthorization) }
                    <Route exact path = '/back-office' component = { Home } />
                    <Route component = { NotFound } />
                </Switch>
            </HashRouter>
        );
    }

    renderRoute(path, Component, reloadAuthorization) {
        return (
            <Route
                exact path = { path }
                render = { (routeProps) => (
                    <Component
                        { ...routeProps }
                        showToast = { this.showToast }
                        reloadAuthorization = { reloadAuthorization }
                        />
                ) } />
        );
    }

    showToast = (message, type = 'error', time = 7000) => {
        this.toastMessage.show(message, { time, type });
    }
}
