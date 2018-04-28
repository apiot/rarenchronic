const Mailgun = require('mailgun-js');

const {
    activationTemplate,
    newPasswodTemplate,
    newEmailTemplate,
} = require('./templates');

const { EmailError } = require('../../../commons/errors');

const mailgun = new Mailgun({
    apiKey: process.env.RARENCHR_MAILGUN_API_KEY,
    domain: process.env.RARENCHR_MAILGUN_DOMAIN,
});

const createEmailContent = (to, subject, html) => ({
    from: 'Rare n’Chronic <contact@rarenchronic.net>',
    to,
    subject,
    html,
});

const sendMail = (to, subject, content) => {
    const data = createEmailContent(to.trim(), subject, content);

    return mailgun.messages().send(data, (err) => {
        if (err) {
            throw new EmailError(JSON.stringify(err));
        }

        return true;
    });
};

const sendActivationEmail = (recipient, name, activationKey) => {
    const content = activationTemplate(name, activationKey);
    const subject = '[Rare n’chronic] Émail d’activation de votre compte';

    return sendMail(recipient, subject, content);
};

const sendNewPasswordEmail = (recipient, name, password) => {
    const content = newPasswodTemplate(name, password);
    const subject = '[Rare n’chronic] Nouveau mot de passe';

    return sendMail(recipient, subject, content);
};

const sendActivationEmailAfterEmailChange = (recipient, name, activationKey) => {
    const content = newEmailTemplate(name, activationKey);
    const subject = '[Rare n’chronic] Émail d’activation suite au changement d’email';

    return sendMail(recipient, subject, content);
};

module.exports = {
    sendActivationEmail,
    sendNewPasswordEmail,
    sendActivationEmailAfterEmailChange,
};
