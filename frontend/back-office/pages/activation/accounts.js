import React from 'react';
import PropTypes from 'prop-types';
import QueryString from 'query-string';

import './accounts.scss';

import Loader from '../../components/loader/loader';
import ServiceMessage from '../../components/serviceMessage/serviceMessage';

import * as API from '../../api/accounts';

import { errorHandler, successHandler } from '../../utils/handlers';

export default class AccountActivation extends React.Component {
    static propTypes = {
        showToast: PropTypes.func.isRequired,
    };

    state = {
        accountActivated: false,
    };

    componentDidMount() {
        const params = QueryString.parse(this.props.location.search);
        const activationKey = params.key;

        API.activateAccount(activationKey)
            .then((axiosResponse) => {
                this.setState({ accountActivated: true });
                this.props.showToast('Votre compte a bien été activé.', 'success');
            })
            .catch(errorHandler(this.props.showToast));
    }

    render() {
        return this.state.accountActivated
            ? <ServiceMessage message = { `Votre compte a bien été activé.` } />
            : this.renderPage();
    }

    renderPage() {
        return (
            <div className = 'account-activation'>
                <h1>Activaton du compte</h1>
                <Loader />
            </div>
        );
    }
}
