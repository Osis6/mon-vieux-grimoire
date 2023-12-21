/** @format */

const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');

// Routes pour l'inscription et la connexion des utilisateurs
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;
