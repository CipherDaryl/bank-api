const express = require('express');
const transactionController = require('../controllers/transactionController.js');
const { authenticate } = require('../middleware/auth.js');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Opérations bancaires
 */

/**
 * @swagger
 * /transactions/{accountId}/deposit:
 *   post:
 *     summary: Effectuer un dépôt
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du compte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50000
 *               description:
 *                 type: string
 *                 example: "Dépôt en espèces"
 *     responses:
 *       200:
 *         description: Dépôt effectué avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Dépôt effectué avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       type: object
 *                     newBalance:
 *                       type: number
 *                     currency:
 *                       type: string
 *       400:
 *         description: Montant invalide
 *       403:
 *         description: Compte bloqué ou fermé
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Compte non trouvé
 */
router.post('/:accountId/deposit', transactionController.deposit);

/**
 * @swagger
 * /transactions/{accountId}/withdraw:
 *   post:
 *     summary: Effectuer un retrait
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du compte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 30000
 *               description:
 *                 type: string
 *                 example: "Retrait au guichet"
 *     responses:
 *       200:
 *         description: Retrait effectué avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Retrait effectué avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       type: object
 *                     newBalance:
 *                       type: number
 *                     currency:
 *                       type: string
 *       400:
 *         description: Montant invalide
 *       403:
 *         description: Compte bloqué ou fermé
 *       422:
 *         description: Solde insuffisant
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Compte non trouvé
 */
router.post('/:accountId/withdraw', transactionController.withdraw);

/**
 * @swagger
 * /transactions/{accountId}/transfer:
 *   post:
 *     summary: Effectuer un virement vers un autre compte
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du compte source
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toAccountNumber
 *               - amount
 *             properties:
 *               toAccountNumber:
 *                 type: string
 *                 example: "FR123456789012345678901"
 *               amount:
 *                 type: number
 *                 example: 20000
 *               description:
 *                 type: string
 *                 example: "Paiement fournisseur"
 *     responses:
 *       200:
 *         description: Virement effectué avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Virement effectué avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     fromAccount:
 *                       type: string
 *                     toAccount:
 *                       type: string
 *                     newBalance:
 *                       type: number
 *                     currency:
 *                       type: string
 *       400:
 *         description: Montant invalide ou transfert vers le même compte
 *       403:
 *         description: Compte bloqué ou fermé
 *       422:
 *         description: Solde insuffisant
 *       404:
 *         description: Compte destinataire non trouvé
 *       401:
 *         description: Non authentifié
 */
router.post('/:accountId/transfer', transactionController.transfer);

module.exports = router;