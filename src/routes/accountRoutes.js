const express = require('express');
const accountController = require('../controllers/accountController.js');
const { authenticate } = require('../middleware/auth.js');

const router = express.Router();

router.use(authenticate);

router.post('/', accountController.createAccount);
router.get('/', accountController.getAccounts);
router.get('/:id', accountController.getAccountById);
router.get('/:id/balance', accountController.getBalance);

module.exports = router;