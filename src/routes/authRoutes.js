const express = require('express');
const authController = require('../controllers/authController.js');
const { authenticate, authorize } = require('../middleware/auth.js');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authenticate, authController.getProfile);
router.get('/users', authenticate, authorize('ADMIN'), authController.getUsers);

module.exports = router;