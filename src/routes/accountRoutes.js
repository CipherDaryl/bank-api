const express = require('express');
const accountController = require('../controllers/accountController.js');
const { authenticate } = require('../middleware/auth.js');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Gestion des comptes bancaires
 */

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Créer un compte bancaire
 *     tags: [Accounts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountType
 *             properties:
 *               accountType:
 *                 type: string
 *                 enum: [COURANT, EPARGNE, PROFESSIONNEL]
 *                 example: "COURANT"
 *               initialDeposit:
 *                 type: number
 *                 example: 50000
 *               currency:
 *                 type: string
 *                 example: "XAF"
 *     responses:
 *       201:
 *         description: Compte créé avec succès
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
 *                   example: "Compte créé avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     accountNumber:
 *                       type: string
 *                     accountType:
 *                       type: string
 *                     balance:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     status:
 *                       type: string
 *       409:
 *         description: Compte déjà existant
 *       401:
 *         description: Non authentifié
 */
router.post('/', accountController.createAccount);

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Lister les comptes de l'utilisateur
 *     tags: [Accounts]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des comptes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       accountNumber:
 *                         type: string
 *                       accountType:
 *                         type: string
 *                       balance:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       status:
 *                         type: string
 *       401:
 *         description: Non authentifié
 */
router.get('/', accountController.getAccounts);

/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Récupérer un compte par son ID
 *     tags: [Accounts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du compte
 *     responses:
 *       200:
 *         description: Détails du compte
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     accountNumber:
 *                       type: string
 *                     accountType:
 *                       type: string
 *                     balance:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     status:
 *                       type: string
 *       404:
 *         description: Compte non trouvé
 *       401:
 *         description: Non authentifié
 */
router.get('/:id', accountController.getAccountById);

/**
 * @swagger
 * /accounts/{id}/balance:
 *   get:
 *     summary: Récupérer le solde d'un compte
 *     tags: [Accounts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du compte
 *     responses:
 *       200:
 *         description: Solde du compte
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     accountNumber:
 *                       type: string
 *       404:
 *         description: Compte non trouvé
 *       401:
 *         description: Non authentifié
 */
router.get('/:id/balance', accountController.getBalance);

module.exports = router;