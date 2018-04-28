import _ from 'lodash';

const successHandler = (response, showToast) => {
    if (response.status === 200) {
        showToast('Opération réussie', 'success');
        return true;
    } else {
        showToast('Opération échouée');
        return false;
    }
}

const errorHandler = (showToast) => (err) => {
    const { response } = err;

    let defaultMessage = 'Une erreur est survenue.';

    switch (response.status) {
        case 400: // bad request
            defaultMessage = 'Mauvaise requête.';
            break;
        case 403: // not authorized error
            defaultMessage = 'Vous n’avez pas les permissions nécessaires.';
            break;
        case 404:  // not found
            defaultMessage = 'La ressource est introuvable.';
            break;
        case 460: // expired
            defaultMessage = 'La ressource a expirée.';
            break;
        case 480: // file error
            defaultMessage = 'Une erreur de fichier est survenue.';
            break;
        case 500: // server error
            defaultMessage = 'Erreur du serveur.';
            break;
        case 504: // timeout
            defaultMessage: 'Problème de connexion.';
        case 520: // sql error
            defaultMessage = 'Erreur de la base de données.';
            break;
        case 530: // db inconsistency error
            defaultMessage = 'Erreur de consistance de la base de données.';
            break;
        case 550: // email error
            defaultMessage = 'Une erreur liée aux émails est survenue.';
            break;
        default:
            console.error(err);
            break;
    }

    showToast(response.data.message || defaultMessage);
}

export {
    errorHandler,
    successHandler,
};
