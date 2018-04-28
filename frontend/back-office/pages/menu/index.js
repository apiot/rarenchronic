import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import './menu.scss';

import { GROUPS_CAN_ADMIN } from '../../consts/groups';

import AuthorizationContext from '../../components/authorization/authorizationContext';

export default class Menu extends React.Component {
    static propTypes = {
        onOpenFileManager: PropTypes.func.isRequired,
    };

    state = {
        panel: {
            open: false,
        },
    };

    _onTogglePanel = () => {
        const open = !this.state.panel.open;
        this.setState({
            panel: Object.assign({}, this.state.panel, { open }),
        });
    };

    _closePanel = (event) => {
        this.setState({
            panel: Object.assign({}, this.state.panel, { open: false }),
        })
    }

    render() {
        return (
            <div className = 'menu'>
                { this.renderMenuComputer() }
                { this.renderMenuSmartPhone() }
            </div>
        );
    }

    renderMenuComputer() {
        const domainUrl = location.origin;
        return (
            <div className = 'menu__computer'>
                <div className = 'menu__computer__site-items'>
                    <a href = { `${domainUrl}/` }>
                        <i className = 'fas fa-home' title = 'Retour vers le site' />
                    </a>
                    <span className = 'menu__computer__site-items__item'>
                        Rare n’chronic
                    </span>
                </div>
                <div className = 'menu__computer__option-items'>
                    <a href = { `${domainUrl}/#/back-office` }>
                        <i className = 'fas fa-home' title = 'Accueil du Back Office' />
                    </a>
                    <a href = { `${domainUrl}/#/back-office/articles` }>
                        <i className = 'fas fa-pencil-alt' title = 'Écrire des articles' />
                    </a>
                    <a href = { `${domainUrl}/#/back-office/messaging` } className = 'fa-layers fa-fw'>
                        <i className = 'fas fa-envelope' title = 'Messagerie' />
                        <span className = 'fa-layers-counter'>2</span>
                    </a>
                    <a href = { `${domainUrl}/#/back-office/profile` }>
                        <i className = 'far fa-user-circle' title = 'Profil' />
                    </a>
                    <AuthorizationContext.Consumer>
                        { (authContext) => this.renderAdministration(authContext) }
                    </AuthorizationContext.Consumer>
                    <span onClick = { this.props.onOpenFileManager } >
                        <i className = 'fas fa-file-upload' title = 'Gestionnaire de fichiers' />
                    </span>
                </div>
                <div className = 'menu__computer__user-items'>
                    <span>Avatar</span>
                    <AuthorizationContext.Consumer>
                        { (authContext) => this.renderConnexion(authContext) }
                    </AuthorizationContext.Consumer>
                </div>
            </div>
        );
    }

    renderAdministration(authContext = {}) {
        return authContext && !_.isEmpty(authContext.groups) && canAdmin(authContext.groups) ?
            (<a href = { `` }>
                <i className = 'fas fa-users-cog' title = 'Administration' />
            </a>) :
            null;
    }

    renderConnexion(authContext = {}) {
        const domainUrl = location.origin;
        return authContext && authContext.isAuthenticated ?
            (<a className = 'menu__computer__user-items__item'
                href = { `${domainUrl}/#/back-office/logout` }>
                Déconnexion
            </a>) :
            (<a className = 'menu__computer__user-items__item'
                href = { `${domainUrl}/#/back-office/login` }>
                Connexion
            </a>);
    }

    renderMenuSmartPhone() {
        const domainUrl = location.origin;
        const panelOpen = this.state.panel.open
            ? 'menu__smartphone__items__panel-opened'
            : 'menu__smartphone__items__panel-closed';

        return (
            <div className = 'menu__smartphone'>
                <div className = 'menu__smartphone__items'>
                    <div className = 'menu__smartphone__items__icon'
                        onClick = { this._onTogglePanel } >
                        <i className = 'fas fa-bars' />
                    </div>
                    <div className = { `${panelOpen} menu__smartphone__items__side-panel` } >
                        { this.renderSmartPhoneMenu() }
                    </div>
                </div>
                <div className = 'menu__smartphone__logo'>
                    <a href = { `${domainUrl}/#/back-office` }
                        onClick = { this._closePanel } >
                        Logo here
                    </a>
                </div>
                <div className = 'menu__smartphone__connection'>
                    <AuthorizationContext.Consumer>
                        { (authContext) => this.renderSmartPhoneConnexion(authContext) }
                    </AuthorizationContext.Consumer>
                </div>
            </div>
        );
    }

    renderSmartPhoneConnexion(authContext = {}) {
        const domainUrl = location.origin;
        return authContext && authContext.isAuthenticated
            ? (<a href = { `${domainUrl}/#/back-office/profile` }
                onClick = { this._closePanel } >
                Avatar
            </a>)
            : (<a href = { `${domainUrl}/#/back-office/login` }
                onClick = { this._closePanel } >
                Login
            </a>);
    }

    renderSmartPhoneMenu() {
        const domainUrl = location.origin;
        return (
            <React.Fragment>
                <div className = 'menu__smartphone__items__side-panel__block'>
                    <span className = 'menu__smartphone__items__side-panel__block__title'>
                        Site
                    </span>
                    { this.renderSmartPhoneLink('/', 'Retour au site') }
                </div>
                <div className = 'menu__smartphone__items__side-panel__block'>
                    <span className = 'menu__smartphone__items__side-panel__block__title'>
                        Back Office
                    </span>
                    { this.renderSmartPhoneLink('/back-office', 'Accueil du Back Office') }
                    { this.renderSmartPhoneLink('/back-office/articles', 'Écrire des articles') }
                    { this.renderSmartPhoneLink('/back-office/messaging', 'Messagerie (2 nouveaux messages)') }
                    { this.renderSmartPhoneLink('/back-office/profile', 'Profil') }
                </div>
            </React.Fragment>
        );
    }

    renderSmartPhoneLink(destination, label) {
        const domainUrl = location.origin;
        return (
            <a href = { `${domainUrl}/#${destination}` }
                onClick = { this._closePanel } >
                &#8226; { label }
            </a>
        );
    }
}

function canAdmin(groups) {
    const results = _.intersection(groups, GROUPS_CAN_ADMIN);
    return results.length > 0;
}
