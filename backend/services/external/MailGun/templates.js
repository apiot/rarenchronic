const siteName = 'Rare n’Chronic';

const getActivationUrl = activationKey => `http://rarenchronic.net/#/back-office/accounts/activation?key=${activationKey}`;
const getEmailActivationUrl = activationKey => `http://rarenchronic.net/#/back-office/profile/email-activation?key=${activationKey}`;

const activationTemplate = (userNickname, activationKey) => '<div>'
    + '<h1>Émail d’activation de votre compte.</h1>'
    + '<p><em>Message automatique.</em></p>'
    + `<p>Bonjour ${userNickname}.</p>`
    + `<p>Merci de votre inscription sur le site de ${siteName}.</p>`
    + '<p>Pour activer votre compte, veuillez cliquer sur le lien suivant :</p>'
    + `<p><a href="${getActivationUrl(activationKey)}">Lien d’activation</a></p>`
    + '<p><strong>Attention</strong>, la clé d’activation est valable pendant <strong>une semaine</strong>.</p>'
    + '<p>Si le lien ne fonctionne pas, veuillez copier coller l’adresse suivante dans votre nagivateur :</p>'
    + `<p>${getActivationUrl(activationKey)}</p>`
    + '<p>En vous remerciant.</p>'
    + '<p>Passez une bonne journée !</p>'
    + `<p>Toute l’équipe de ${siteName}</p>`;

const newPasswodTemplate = (userNickname, newPassword) => '<div>'
    + '<h1>Votre nouveau mot de passe.</h1>'
    + '<p><em>Message automatique.</em></p>'
    + `<p>Bonjour ${userNickname}.</p>`
    + '<p>Vous venez de demander la génération d’un nouveau mot de passe.</p>'
    + '<p>Votre nouveau mot de passe est :</p>'
    + `<p>${newPassword}</p>`
    + '<p>Ce nouveau mot de passe est valable pendant <strong>une semaine</strong>.</p>'
    + '<p>Une fois connectée, nous vous conseillons d’aller dans votre profil et de modifier votre mot de passe.</p>'
    + '<p>Si vous n’arrivez pas à vous connecter, avez-vous bien activé votre compte ?</p>'
    + '<p>Si vous n’avez pas reçu votre émail d’activation, veuillez vous rendre '
    + 'dans la page de connexion du site, puis remplir le formulaire pour recevoir un email d’activation.</p>'
    + '<p>En vous remerciant.</p>'
    + '<p>Passez une bonne journée !</p>'
    + `<p>Toute l’équipe de ${siteName}</p>`;

const newEmailTemplate = (userNickname, activationKey) => '<div>'
    + '<h1>Émail d’activation pour la modification de votre émail.</h1>'
    + '<p><em>Message automatique.</em></p>'
    + `<p>Bonjour ${userNickname}.</p>`
    + '<p>Vous venez de modifier votre émail.</p>'
    + '<p>Pour que votre nouvel émail remplace le précédent vous devez activer votre nouvel émail, pour cela veuillez cliquer sur le lien suivant :</p>'
    + `<p><a href="${getEmailActivationUrl(activationKey)}">Lien d’activation</a></p>`
    + '<p><strong>Attention</strong>, la clé d’activation est valable pendant <strong>une semaine</strong>.</p>'
    + '<p>Si le lien ne fonctionne pas, veuillez copier coller l’adresse suivante dans votre nagivateur :</p>'
    + `<p>${getEmailActivationUrl(activationKey)}</p>`
    + '<p>En vous remerciant.</p>'
    + '<p>Passez une bonne journée !</p>'
    + `<p>Toute l’équipe de ${siteName}</p>`;

module.exports = {
    activationTemplate,
    newPasswodTemplate,
    newEmailTemplate,
};
