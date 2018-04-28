import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom'

import './logout.scss';

import * as API from '../../api/accounts';

import AuthorizationContext from '../../components/authorization/authorizationContext';
import Loader from '../../components/loader/loader';
import ServiceMessage from '../../components/serviceMessage/serviceMessage';

import { successHandler, errorHandler } from '../../utils/handlers';

export default class Logout extends React.Component {
    static propTypes = {
        showToast: PropTypes.func.isRequired,
        reloadAuthorization: PropTypes.func.isRequired,
    };

    componentDidMount() {
        API.logout()
            .then(() => {
                this.props.showToast('Vous avez bien été déconnecté\u00B7e.', 'success');
                this.props.reloadAuthorization();
            })
            .catch(errorHandler(this.props.showToast));
    }

    render() {
        return (
            <AuthorizationContext.Consumer>
                { (authContext) => this.renderContent(authContext) }
            </AuthorizationContext.Consumer>
        );
    }

    renderContent(authContext) {
        return authContext && authContext.isAuthenticated
            ? this.renderPage()
            : <ServiceMessage message = { `Vous avez bien été déconnecté\u00B7e.` } />;
    }

    renderPage() {
        return (
            <div className = 'logout'>
                <h1>Déconnexion</h1>
                <Loader />
            </div>
        );
    }
}
