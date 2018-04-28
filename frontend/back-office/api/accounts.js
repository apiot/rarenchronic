import axios from 'axios';

function getAuthorization() {
    return axios.get('api/back/accounts/authorization');
}

function create({ name, email, password }) {
    const body = { name, email, password };
    return axios.post('api/back/accounts/create', body);
}

function login({ email, password }) {
    const body = { email, password };
    return axios.post('api/back/accounts/login', body);
}

function logout() {
    return axios.post('api/back/accounts/logout');
}

function resetPassword({ email }) {
    const body = { email };
    return axios.get('api/back/accounts/password', body);
}

function reSendActivationEmail({ email }) {
    const body = { email };
    return axios.get('api/back/accounts/email/activation', body);
}

function activateAccount(activationKey) {
    const body = { key: activationKey };
    return axios.patch('api/back/accounts/activation', body);
}

function activateEmail(activationKey) {
    const body = { key: activationKey };
    return axios.patch('api/back/profile/email/activation', body);
}

export {
    activateAccount,
    activateEmail,
    create,
    getAuthorization,
    login,
    logout,
    resetPassword,
    reSendActivationEmail,
};
