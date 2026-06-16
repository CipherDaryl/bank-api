const express = require('express');
const transactionController = require('../controllers/transactionController.js');
const { authenticate } = require('../middleware/auth.js');

const router = express.Router();

router.use(authenticate);

router.post('/:accountId/deposit', transactionController.deposit);
router.post('/:accountId/withdraw', transactionController.withdraw);
router.post('/:accountId/transfer', transactionController.transfer);

module.exports = router;