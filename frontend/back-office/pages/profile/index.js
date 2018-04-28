import moment from 'moment';
import _ from 'lodash';

import Textarea from 'react-textarea-autosize';
import React from 'react';
import PropTypes from 'prop-types';

import './profile.scss';

import AuthorizationContext from '../../components/authorization/authorizationContext';
import ServiceMessage from '../../components/serviceMessage/serviceMessage';
import Loader from '../../components/loader/loader';
import OneColumnPage from '../../components/layout/oneColumnPage';
import Block from '../../components/layout/block';
import Ariane from '../../components/ariane';
import ToggleSwitch from '../../components/forms/toggleSwitch';

import * as API from '../../api/profile';

import { errorHandler } from '../../utils/handlers';

export default class Profile extends React.Component {
    static propTypes = {
        showToast: PropTypes.func.isRequired,
    };

    state = this.getInitialState();

    getInitialState() {
        return {
            account: {
                created: moment().format(),
                lastConnexion: moment().format(),
                lastLoginAttempt: moment().format(),
                groups: [],
                permissions: [],
                tokensQuantity: 0,
            },
            avatar: {
                isLoading: false,
                url: '',
            },
            description: {
                isLoading: false,
                description: '',
            },
            infos: {
                isLoading: false,
                firstName: '',
                lastName: '',
                phone1: '',
                phone2: '',
                address: '',
                city: '',
                zipCode: '',
                country: '',
            },
            website: {
                isLoading: false,
                url: '',
            },
            email: {
                isLoading: false,
                email: '',
                request: {},
            },
            password: {
                isLoading: false,
                displayPassword: false,
                newPassword: '',
                checkPassword: '',
                oldPassword: '',
            },
            display: {
                isLoading: false,
                displayAvatar: false,
                displayFirstName: false,
                displayLastName: false,
                displayPhone1: false,
                displayPhone2: false,
                displayAddress: false,
                displayCity: false,
                displayZipCode: false,
                displayCountry: false,
                displayWebSite: false,
            },
        };
    }

    componentDidMount() {
        this.loadAccountInfo();
    }

    loadAccountInfo() {
        const currentScrollYPosition = window.scrollY;

        const displayValues = ['displayAvatar', 'displayFirstName', 'displayLastName']
            .concat(['displayPhone1', 'displayPhone2', 'displayAddress', 'displayCity'])
            .concat(['displayZipCode', 'displayCountry', 'displayWebSite']);

        const infosValues = ['firstName', 'lastName', 'phone1', 'phone2', 'address']
            .concat(['zipCode', 'city', 'country']);

        const accountValues = ['created', 'lastConnexion', 'lastLoginAttempt']
            .concat(['groups', 'permissions', 'tokensQuantity']);

        API.fetchAccountInfo()
            .then((axiosResponse) => {
                const { account } = axiosResponse.data;
                this.setState({
                    account: _.pick(account, accountValues),
                    avatar: Object.assign({}, this.state.avatar, {
                        isLoading: false,
                        url: account.avatar,
                     }),
                    description: Object.assign({}, this.state.description, {
                        isLoading: false,
                        description: account.description,
                     }),
                    infos: Object.assign(
                        { isLoading: false },
                        _.pick(account, infosValues),
                    ),
                    website: {
                        isLoading: false,
                        url: account.website,
                    },
                    email: Object.assign({}, this.state.email, {
                        isLoading: false,
                        email: account.email,
                        request: {
                            email: account.emailRequest.email,
                            expired: account.emailRequest.expired,
                        },
                    }),
                    display: Object.assign(
                        { isLoading: false },
                        _.pick(account, displayValues),
                    ),
                });
                window.scroll(0, currentScrollYPosition);
            })
            .catch((err) => {
                this.props.showToast('Impossible de récupérer vos informations');
            });
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
            return this.renderPage();
        } else {
            return <ServiceMessage message = { `Vous devez être connecté\u00B7e pour accéder à cette page.` } />;
        }
    }

    renderPage() {
        return (
            <OneColumnPage className = 'profile'>
                <Ariane steps = { ['Profil'] } />
                { this.renderAccountSummary() }
                { this.renderUpdateAvatar() }
                { this.renderUpdateDescription() }
                { this.renderUpdateInfos() }
                { this.renderUpdateWebsite() }
                { this.renderUpdateEmail() }
                { this.renderUpdatePassword() }
                { this.renderUpdateDisplay() }
            </OneColumnPage>
        );
    }

    _onDeleteConnexions = () => {
        API.deleteConnexion()
            .then((axiosResponse) => {
                this.props.showToast('Les connexions ont bien été supprimées.', 'success');
                this.loadAccountInfo();
            })
            .catch(errorHandler(this.props.showToast));
    };

    renderAccountSummary() {
        const { created, lastConnexion, lastLoginAttempt, groups } = this.state.account;
        const { permissions, tokensQuantity } = this.state.account;

        return (
            <Block title = 'Résumé du compte' >
                <p>{ `Compte créé le\u00A0: ${moment(created).format('DD/MM/YYYY à HH:mm')}.` }</p>
                <p>{ `Dernière connexion le\u00A0: ${moment(lastConnexion).format('DD/MM/YYYY à HH:mm')}` }</p>
                <p>{ `Permissions utilisateurs\u00B7trice\u00A0: ${permissions.join(', ')}` }</p>
                <p>{ `Membre des groupes suivants\u00A0: ${groups.join(', ')}` }</p>
                <p>{ `Nombre de connexions en cours\u00A0: ${tokensQuantity}` }</p>
                <div>
                    <button onClick = { this._onDeleteConnexions }>
                        Supprimer les autres connexions
                    </button>
                    <p>
                        { '(Attention cela vous déconnectera de tous les autres terminaux sur lesquels vous êtes connecté\u00B7e.)' }
                    </p>
                </div>
            </Block>
        );
    }

    renderUpdateAvatar() {
        return (
            <Block title = 'Modifier votre avatar' >
                <Loader />
            </Block>
        );
    }

    _onChangeDescription = (event) => {
        const value = event.target.value;

        this.setState({
            description: Object.assign({}, this.state.description, { description: value }),
        });
    };

    _onSubmitDescription = (event) => {
        event.preventDefault();

        this.setState({
            description: Object.assign({}, this.state.description, { isLoading: true }),
        });

        API.updateDescription(this.state.description.description)
            .then((axiosResponse) => {
                this.props.showToast('Votre description a bien été modifiée.', 'success');
                this.loadAccountInfo();
            })
            .catch((err) => {
                errorHandler(this.props.showToast)(err);
                this.setState({
                    description: Object.assign({}, this.state.infos, { description: false }),
                });
            });
    };

    renderUpdateDescription() {
        const { isLoading, description } = this.state.description;

        const content = isLoading
            ? <Loader />
            : (
                <form className = 'profile__description'
                    onSubmit = { this._onSubmitDescription }>
                    <label>
                        <p>Votre description</p>
                        <Textarea className = 'profile__description__description'
                            value = { description }
                            onChange = { this._onChangeDescription }
                            />
                    </label>
                    <input type = 'submit' value = 'Modifier' />
                </form>
            );

        return (
            <Block title = 'Modifier votre description' >
                { content }
            </Block>
        );
    }

    _onChangeInfos = field => (event) => {
        const value = event.target.value;

        this.setState({
            infos: Object.assign({}, this.state.infos, { [field]: value }),
        });
    };

    _onSubmitInfos = (event) => {
        event.preventDefault();

        this.setState({
            infos: Object.assign({}, this.state.infos, { isLoading: true }),
        });

        const fields = ['firstName', 'lastName', 'phone1', 'phone2', 'address']
            .concat(['city', 'zipCode', 'country']);
        const body = _.pick(this.state.infos, fields);

        API.updateInfos(body)
            .then((axiosResponse) => {
                this.props.showToast('Vos informations ont bien été modifiées.', 'success');
                this.loadAccountInfo();
            })
            .catch((err) => {
                errorHandler(this.props.showToast)(err);
                this.setState({
                    infos: Object.assign({}, this.state.infos, { isLoading: false }),
                });
            });
    };

    renderUpdateInfos() {
        const { isLoading, firstName, lastName, phone1, phone2  } = this.state.infos;
        const { address, city, zipCode, country } = this.state.infos;

        const content = isLoading
            ? <Loader />
            : (
                <form className = 'profile__simple-form'
                    onSubmit = { this._onSubmitInfos }>
                    { this.renderInputRow('Prénom', 'text', firstName, this._onChangeInfos('firstName')) }
                    { this.renderInputRow('Nom', 'text', lastName, this._onChangeInfos('lastName')) }
                    { this.renderInputRow('Téléphone 1', 'text', phone1, this._onChangeInfos('phone1')) }
                    { this.renderInputRow('Téléphone 2', 'text', phone2, this._onChangeInfos('phone2')) }
                    { this.renderInputRow('Adresse', 'text', address, this._onChangeInfos('address')) }
                    { this.renderInputRow('Ville', 'text', city, this._onChangeInfos('city')) }
                    { this.renderInputRow('Code postal', 'text', zipCode, this._onChangeInfos('zipCode')) }
                    { this.renderInputRow('Pays', 'text', country, this._onChangeInfos('country')) }
                    <input type = 'submit' value = 'Modifier' />
                </form>
            );

        return (
            <Block title = 'Modifier vos informations' >
                { content }
            </Block>
        );
    }

    _onChangeWebsite = (event) => {
        const value = event.target.value;

        this.setState({
            website: Object.assign({}, this.state.website, { url: value }),
        });
    }

    _onSubmitWebsite = (event) => {
        event.preventDefault();

        this.setState({
            website: Object.assign({}, this.state.website, { isLoading: true }),
        });

        API.updateWebsite(this.state.website.url.trim())
            .then((axiosResponse) => {
                this.props.showToast('Le site web a bien été modifié.', 'success');
                this.loadAccountInfo();
            })
            .catch((err) => {
                errorHandler(this.props.showToast)(err);
                this.setState({
                    website: Object.assign({}, this.state.website, { isLoading: false }),
                });
            });
    }

    renderUpdateWebsite() {
        const { isLoading, url  } = this.state.website;

        const content = isLoading
            ? <Loader />
            : (
                <form className = 'profile__simple-form'
                    onSubmit = { this._onSubmitWebsite }>
                    { this.renderInputRow('Adresse du site web', 'text', url, this._onChangeWebsite) }
                    <input type = 'submit' value = 'Modifier' />
                </form>
            );

        return (
            <Block title = 'Modifier votre site web' >
                { content }
            </Block>
        );
    }

    _onChangeEmail = (event) => {
        const value = event.target.value;

        this.setState({
            email: Object.assign({}, this.state.email, { email:value }),
        });
    };

    _onSubmitEmail = (event) => {
        event.preventDefault();

        const { email } = this.state.email;

        this.setState({
            email: Object.assign({}, this.state.email, { isLoading: true }),
        });

        API.updateEmail(email.trim())
            .then((axiosResponse) => {
                this.props.showToast('Émail modifié. Vous devez activer votre nouvel émail.', 'success');
                this.loadAccountInfo();
            })
            .catch((err) => {
                errorHandler(this.props.showToast)(err);
                this.setState({
                    email: Object.assign({}, this.state.email, { isLoading: false }),
                });
            });
    };

    renderUpdateEmail() {
        const { isLoading, email, request } = this.state.email;
        const emailRequest = request.email
            ? (<p className = 'blueText'>
                    Émail en attente d’activation: { request.email }. Expire le { moment(request.expired).format('DD/MM/YYYY à HH:mm') }
                </p>)
            : null;

        const content = isLoading
            ? <Loader />
            : (
                <form className = 'profile__simple-form'
                    onSubmit = { this._onSubmitEmail }>
                    { this.renderInputRow('Votre adresse émail', 'email', email, this._onChangeEmail, true) }
                    <input type = 'submit' value = 'Modifier' />
                    { emailRequest }
                    <p>
                        { 'Quand vous modifiez votre émail, vous devez l’activer'
                        + ' pour que celui ci soit actif (remplace votre ancien'
                        + ' émail), vous recevrez un émail avec un lien d’activation'
                        + ' (valable pendant 7 jours) sur votre nouvel émail.'
                        + ' Tant que l’émail n’est pas'
                        + ' activé, c’est votre ancien émail qui est utilisé.' }
                    </p>
                </form>
            );

        return (
            <Block title = 'Modifier votre émail' >
                { content }
            </Block>
        );
    }

    _onChangePassword = field => (event) => {
        const value = event.target.value;

        this.setState({
            password: Object.assign({}, this.state.password, { [field]: value }),
        });
    };

    _onDisplayPassword = () => {
        const displayPassword = !this.state.password.displayPassword;

        this.setState({
            password: Object.assign({}, this.state.password, { displayPassword }),
        });
    };

    _onSubmitPassword = (event) => {
        event.preventDefault();

        const { newPassword, checkPassword, oldPassword } = this.state.password;

        if (newPassword !== checkPassword) {
            this.props.showToast('Vous devez taper deux fois le même mot de passe.');
            return;
        }

        if (checkPassword.length < 8) {
            this.props.showToast('Le mot de passe doit faire au moins 8 caractères.');
            return;
        }

        this.setState({
            password: Object.assign({}, this.state.password, { isLoading: true }),
        });

        API.updatePassword(newPassword, oldPassword)
            .then((axiosResponse) => {
                this.props.showToast('Mot de passe modifié.', 'success');
                this.setState({
                    password: {
                        isLoading: false,
                        displayPassword: false,
                        newPassword: '',
                        checkPassword: '',
                        oldPassword: '',
                    },
                });
            })
            .catch((err) => {
                errorHandler(this.props.showToast)(err);
                this.setState({
                    password: Object.assign({}, this.state.password, { isLoading: false }),
                });
            });
    };

    renderUpdatePassword() {
        const {
            isLoading,
            displayPassword,
            newPassword,
            checkPassword,
            oldPassword
        } = this.state.password;
        const type = displayPassword ? 'text' : 'password';

        const content = isLoading
            ? <Loader />
            : (
                <form className = 'profile__display'
                    onSubmit = { this._onSubmitPassword }>
                    { this.renderInputRow('Nouveau mot de passe', type, newPassword, this._onChangePassword('newPassword'), true, 8) }
                    { this.renderInputRow('Retaper le mot de passe', type, checkPassword, this._onChangePassword('checkPassword'), true, 8) }
                    { this.renderInputRow('Mot de passe actuel', type, oldPassword, this._onChangePassword('oldPassword'), true, 8) }
                    { this.renderToggleSwitchRow('Afficher les mots de passe', displayPassword, this._onDisplayPassword) }
                    <input type = 'submit' value = 'Modifier' />
                </form>
            );

        return (
            <Block title = 'Modifier votre mot de passe' >
                { content }
            </Block>
        );
    }

    _onChangeDisplay = field => () => {
        this.setState({
            display: Object.assign({}, this.state.display, { [field]: !this.state.display[field] }),
        });
    };

    _onSubmitDisplay = (event) => {
        event.preventDefault();

        this.setState({
            display: Object.assign({}, this.state.display, { isLoading: true }),
        });

        const { displayAvatar, displayFirstName, displayLastName } = this.state.display;
        const { displayPhone1, displayPhone2, displayAddress } = this.state.display;
        const { displayCity, displayZipCode, displayCountry } = this.state.display;
        const { displayWebSite } = this.state.display;

        const body = {
            avatar: Boolean(displayAvatar),
            firstName: Boolean(displayFirstName),
            lastName: Boolean(displayLastName),
            phone1: Boolean(displayPhone1),
            phone2: Boolean(displayPhone2),
            address: Boolean(displayAddress),
            city: Boolean(displayCity),
            zipCode: Boolean(displayZipCode),
            country: Boolean(displayCountry),
            website: Boolean(displayWebSite),
        };

        API.updateDisplay(body)
            .then((axiosResponse) => {
                this.props.showToast('Les informations publiques ont été mises à jour.', 'success');
                this.loadAccountInfo();
            })
            .catch((err) => {
                errorHandler(this.props.showToast)(err);
                this.setState({
                    display: Object.assign({}, this.state.display, { isLoading: false }),
                });
            });
    };

    renderUpdateDisplay() {
        const { isLoading, displayWebSite } = this.state.display;
        const { displayAvatar, displayFirstName, displayLastName } = this.state.display;
        const { displayPhone1, displayPhone2, displayAddress } = this.state.display;
        const { displayCity, displayZipCode, displayCountry } = this.state.display;

        const content = isLoading
            ? <Loader />
            : (
                <form className = 'profile__display'
                    onSubmit = { this._onSubmitDisplay } >
                    { this.renderToggleSwitchRow('Avatar visible', displayAvatar, this._onChangeDisplay('displayAvatar')) }
                    { this.renderToggleSwitchRow('Prénom visible', displayFirstName, this._onChangeDisplay('displayFirstName')) }
                    { this.renderToggleSwitchRow('Nom visible', displayLastName, this._onChangeDisplay('displayLastName')) }
                    { this.renderToggleSwitchRow('Téléphone 1 visible', displayPhone1, this._onChangeDisplay('displayPhone1')) }
                    { this.renderToggleSwitchRow('Téléphone 2 visible', displayPhone2, this._onChangeDisplay('displayPhone2')) }
                    { this.renderToggleSwitchRow('Adresse visible', displayAddress, this._onChangeDisplay('displayAddress')) }
                    { this.renderToggleSwitchRow('Ville visible', displayCity, this._onChangeDisplay('displayCity')) }
                    { this.renderToggleSwitchRow('Code postal visible', displayZipCode, this._onChangeDisplay('displayZipCode')) }
                    { this.renderToggleSwitchRow('Pays visible', displayCountry, this._onChangeDisplay('displayCountry')) }
                    { this.renderToggleSwitchRow('Site web visible', displayWebSite, this._onChangeDisplay('displayWebSite')) }
                    <input type = 'submit' value = 'Modifier' />
                </form>
            );

        return (
            <Block title = 'Informations publiques' >
                <p>{ 'Choisissez les informations qui sont visibles par les autres utilisateurs\u00B7trices.' }</p>
                { content }
            </Block>
        );
    }

    renderInputRow(label, type, value, onChange, isRequired = false, minLength) {
        return (
            <label>
                <span className = 'profile__display__label-text'>{ label }</span>
                <input required = { isRequired }
                    minLength = { minLength }
                    type = { type }
                    value = { value }
                    onChange = { onChange }
                    />
            </label>
        );
    }

    renderToggleSwitchRow(label, value, onChange) {
        return (
            <label>
                <span className = 'profile__display__label-text'>
                    { label }
                </span>
                <ToggleSwitch value = { Boolean(value) } onChange = { onChange } />
            </label>
        );
    }
}
