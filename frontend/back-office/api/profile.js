import axios from 'axios';

function deleteConnexion() {
    return axios.delete('api/back/profile/connexion');
}

function fetchAccountInfo() {
    return axios.get('api/back/profile');
}

function updateDescription(description) {
    const body = { description };
    return axios.patch('api/back/profile/description', body);
}

function updateEmail(email) {
    const body = { email };
    return axios.post('api/back/profile/email/request', body);
}

function updatePassword(newPassword, oldPassword) {
    const body = { newPassword, oldPassword };
    return axios.patch('api/back/profile/password', body);
}

function updateInfos(body) {
    return axios.patch('api/back/profile/infos', body);
}

function updateWebsite(url) {
    const body = { website: url };
    return axios.patch('api/back/profile/website', body);
}

function updateDisplay(body) {
    return axios.patch('api/back/profile/display', body);
}

export {
    deleteConnexion,
    fetchAccountInfo,
    updateDescription,
    updateDisplay,
    updateEmail,
    updateInfos,
    updatePassword,
    updateWebsite,
};
