const express = require('express');

const accounts = require('./accounts');
const profile = require('./profile');
const files = require('./files');
const articles = require('./articles');

const router = express.Router();

router.use('/accounts', accounts);
router.use('/profile', profile);
router.use('/files', files);
router.use('/articles', articles);

module.exports = router;
