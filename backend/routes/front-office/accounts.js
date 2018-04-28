const { cookieLoginOptions } = require('../../commons/consts/cookies');

module.exports = (app) => {
    app.get('/login', [], (req, res) => {
        res.cookie('rarenchronic_session', 'my wonderfull value', cookieLoginOptions);
        res.status(200);
        res.json({ result: 'totoresult' });
    });
};
