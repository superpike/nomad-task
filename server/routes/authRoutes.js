const express = require('express');
const AuthController = require('../controllers/authController');

const router = express.Router();

router.post('/registration', AuthController.registration);
router.post('/signin', AuthController.signin);

module.exports = router;