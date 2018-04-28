import React from 'react';
import PropTypes from 'prop-types';

import './login.scss';

import AuthorizationContext from '../../components/authorization/authorizationContext';
import ServiceMessage from '../../components/serviceMessage/serviceMessage';

import * as API from '../../api/accounts';

import { errorHandler, successHandler } from '../../utils/handlers';

export default class Login extends React.Component {
    static propTypes = {
        showToast: PropTypes.func.isRequired,
        reloadAuthorization: PropTypes.func.isRequired,
    };

    state = this.getInitialState();

    getInitialState() {
        return {
            authenticated: false,
            created: false,
            forgotPassword: {
                display: false,
                email: '',
            },
            noActivationMail: {
                display: false,
                email: '',
            },
            login: {
                email: '',
                password: '',
            },
            creation: {
                acceptCondition: false,
                name: '',
                email: '',
                password: '',
                passwordBis: '',
            },
        };
    }

    _onChangeLogin(field, event) {
        this.setState({
            login: Object.assign({}, this.state.login, { [field]: event.target.value })
        });
    }

    _onSubmitLogin(event) {
        event.preventDefault();
        const { email, password } = this.state.login;
        API.login({ email, password })
            .then((response) => {
                this.props.showToast('Connexion réussie.', 'success');
                this.setState({ authenticated: true });
                this.props.reloadAuthorization();
            })
            .catch(errorHandler(this.props.showToast));
    }

    _onChangeCreation(field, event) {
        const value = field === 'acceptCondition' ?
            !this.state.creation.acceptCondition :
            event.target.value;

        this.setState({
            creation: Object.assign({}, this.state.creation, { [field]: value })
        });
    }

    _onSubmitCreation(event) {
        event.preventDefault();

        const { name, email, password, passwordBis } = this.state.creation;

        const passwordIsOk = password.trim() === passwordBis.trim() && password.trim().length >= 8;

        if (!passwordIsOk) {
            this.props.showToast('Mot de passe incorrect.');
            return;
        }

        API.create({ name, email, password })
            .then((response) => {
                this.props.showToast('Votre compte a bien été crée.', 'success');
                this.setState({ created: true });
            })
            .catch(errorHandler(this.props.showToast));
    }

    _onClickDisplay(field, event) {
        event.preventDefault();

        if (field === 'forgot') {
            this.setState({
                forgotPassword: Object.assign({}, this.state.forgotPassword, { display: true }),
            });
        }
        if (field === 'activation') {
            this.setState({
                noActivationMail: Object.assign({}, this.state.noActivationMail, { display: true }),
            });
        }
    }

    _onChangeForgotEmail(event) {
        this.setState({
            forgotPassword: Object.assign({}, this.state.forgotPassword, { email: event.target.value }),
        });
    }

    _onSubmitForgotEmail(event) {
        event.preventDefault();
        const { email } = this.state.forgotPassword;
        API.resetPassword({ email })
            .then((response) => {
                this.props.showToast('Un nouveau mot de passe vous a bien été envoyé.', 'success');
                this.setState(this.getInitialState());
            })
            .catch(errorHandler(this.props.showToast));
    }

    _onChangeActivationMail(event) {
        this.setState({
            noActivationMail: Object.assign({}, this.state.noActivationMail, { email: event.target.value }),
        });
    }

    _onSubmitActivationMail(event) {
        event.preventDefault();
        const { email } = this.state.noActivationMail;
        API.reSendActivationEmail({ email })
            .then((response) => {
                this.props.showToast('Un nouvel émail d’activation a bien été envoyé.', 'success');
                this.setState(this.getInitialState());
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
        if (authContext && authContext.isAuthenticated) {
            return <ServiceMessage message = { `Vous devez être déconnecté\u00B7e pour accéder à cette page.` } />;
        } else if (this.state.authenticated) {
            return <ServiceMessage message = { `Vous êtes bien connecté\u00B7e.` } />;
        } else if (this.state.created) {
            const creationMessage = 'Votre compte a bien été crée.'
                + ` Un émail d’activation a été envoyé à\u00A0: ${this.state.creation.email}`;
            return <ServiceMessage message = { creationMessage } />;
        } else {
            return this.renderPage();
        }
    }

    renderPage() {
        const { login, creation } = this.state;
        const domainUrl = location.origin;
        const conditionsUrl = `${domainUrl}/#/back-office/terms-of-service`;
        return (
            <div className = 'login'>
                <div className = 'login__login'>
                    <h1>Se connecter</h1>
                    <form onSubmit = { (event) => this._onSubmitLogin(event) } >
                        <label>
                            <span>Votre émail</span>
                            <input required
                                type = 'email'
                                value = { login.email }
                                onChange = { (event) => this._onChangeLogin('email', event) } />
                        </label>
                        <label>
                            <span>Votre mot de passe</span>
                            <input required
                                minLength = { 8 }
                                type = 'password'
                                value = { login.password }
                                onChange = { (event) => this._onChangeLogin('password', event) } />
                        </label>
                        <div className = 'login__login__submit'>
                            <input
                                type = 'submit'
                                value= 'Se connecter' />
                        </div>
                    </form>
                    { this.renderForgotPassword() }
                </div>
                <div className = 'login__creation'>
                    <h1>Créer un compte</h1>
                    <form onSubmit = { (event) => this._onSubmitCreation(event) } >
                        <label>
                            <span>Votre pseudo</span>
                            <input required
                                type = 'text'
                                value = { creation.name }
                                onChange = { (event) => this._onChangeCreation('name', event) } />
                        </label>
                        <label>
                            <span>Votre émail</span>
                            <input required
                                type = 'email'
                                value = { creation.email }
                                onChange = { (event) => this._onChangeCreation('email', event) } />
                        </label>
                        <label>
                            <span>Votre mot de passe</span>
                            <input required
                                minLength = { 8 }
                                type = 'password'
                                value = { creation.password }
                                onChange = { (event) => this._onChangeCreation('password', event) } />
                        </label>
                        <label>
                            <span>Répéter votre mot de passe</span>
                            <input required
                                minLength = { 8 }
                                type = 'password'
                                value = { creation.passwordBis }
                                onChange = { (event) => this._onChangeCreation('passwordBis', event) } />
                        </label>
                        <label className = 'login__creation__on-row' >
                            <input required
                                type = 'checkbox'
                                value = { true }
                                checked = { creation.acceptCondition }
                                onChange = { (event) => this._onChangeCreation('acceptCondition', event) } />
                            <span className = 'login-form-conditions'>
                                J’accepte les <a href = { conditionsUrl } target = '_blank'> conditions générales d’utilisation</a> du site
                            </span>
                        </label>
                        <div className = 'login__creation__message'>
                            <span>
                                Attention : vous allez recevoir un émail pour activer votre compte.
                            </span>
                        </div>
                        <div className = 'login__creation__submit'>
                            <input
                                type = 'submit'
                                value= 'Créer son compte' />
                        </div>
                    </form>
                    { this.renderNoActivationMail() }
                </div>
            </div>
        );
    }

    renderForgotPassword() {
        const { forgotPassword } = this.state;
        const content = forgotPassword.display ? (
            <form onSubmit = { (event) => this._onSubmitForgotEmail(event) } >
                <label>
                    <span>Pour générer un mot de passe temporaire, entrez votre émail</span>
                    <input required
                        type = 'email'
                        value = { forgotPassword.email }
                        onChange = { (event) => this._onChangeForgotEmail(event) } />
                </label>
                <div className = 'login__login__submit'>
                    <input type = 'submit' value = 'Générer'/>
                </div>
            </form>
        ) : (
            <button onClick = { (event) => this._onClickDisplay('forgot', event) } >
                J’ai oublié mon mot de passe !
            </button>
        );

        return (
            <div className = 'login__login__forgot-password'>
                { content }
            </div>
        );
    }

    renderNoActivationMail() {
        const { noActivationMail} = this.state;
        const content = noActivationMail.display ? (
            <form onSubmit = { (event) => this._onSubmitActivationMail(event) } >
                <label>
                    <span>Pour renvoyer un émail d’activation, veuillez saisir votre émail</span>
                    <input required
                        type = 'email'
                        value = { noActivationMail.email }
                        onChange = { (event) => this._onChangeActivationMail(event) } />
                </label>
                <div className = 'login__creation__submit'>
                    <input type = 'submit' value = 'Renvoyer'/>
                </div>
            </form>
        ) : (
            <button onClick = { (event) => this._onClickDisplay('activation', event) } >
                Je n’ai pas reçu l’émail d’activation !
            </button>
        );

        return (
            <div className = 'login__login__forgot-password'>
                { content }
            </div>
        );
    }
}
