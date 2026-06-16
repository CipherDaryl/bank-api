import { describe, it, expect, beforeEach } from 'vitest';
import accountService from '../../src/services/accountService.js';
import authService from '../../src/services/authService.js';
import Transaction from '../../src/models/transaction.js';
import { v4 as uuidv4 } from 'uuid';

describe('AccountService - Tests unitaires', () => {
  let userId;

  beforeEach(async () => {
    const user = await authService.register({
      firstName: 'Test',
      lastName: 'User',
      email: `test-${uuidv4().slice(0,8)}@account.com`,
      password: 'password123',
    });
    userId = user.id;
  });

  describe('createAccount()', () => {
    it('devrait créer un compte avec succès', async () => {
      const account = await accountService.createAccount(userId, {
        accountType: 'COURANT',
        initialDeposit: 50000,
      });

      expect(account).toHaveProperty('id');
      expect(account.accountNumber).toBeDefined();
      expect(Number(account.balance)).toBe(50000);
      expect(account.status).toBe('ACTIF');
    });

    it('devrait générer un numéro de compte unique', async () => {
      const account1 = await accountService.createAccount(userId, { accountType: 'COURANT' });
      const account2 = await accountService.createAccount(userId, { accountType: 'EPARGNE' });
      expect(account1.accountNumber).not.toBe(account2.accountNumber);
      expect(account1.accountNumber).toMatch(/^FR\d{18}$/);
    });

    it('ne devrait pas permettre deux comptes du même type', async () => {
      await accountService.createAccount(userId, { accountType: 'COURANT' });
      await expect(accountService.createAccount(userId, { accountType: 'COURANT' }))
        .rejects.toThrow('Vous avez déjà un compte COURANT actif');
    });

    it('devrait créer une transaction pour le dépôt initial', async () => {
      const account = await accountService.createAccount(userId, {
        accountType: 'EPARGNE',
        initialDeposit: 100000,
      });

      const transactions = await Transaction.findAll({ where: { accountId: account.id } });
      expect(transactions).toHaveLength(1);
      expect(transactions[0].type).toBe('DEPOT');
      expect(Number(transactions[0].amount)).toBe(100000);
    });
  });

  describe('getUserAccounts()', () => {
    it('devrait retourner tous les comptes d\'un utilisateur', async () => {
      await accountService.createAccount(userId, { accountType: 'COURANT' });
      await accountService.createAccount(userId, { accountType: 'EPARGNE' });
      const accounts = await accountService.getUserAccounts(userId);
      expect(accounts).toHaveLength(2);
    });
  });

  describe('getAccountById()', () => {
    it('devrait retourner le compte si l\'utilisateur est propriétaire', async () => {
      const created = await accountService.createAccount(userId, { accountType: 'COURANT' });
      const account = await accountService.getAccountById(created.id, userId);
      expect(account.id).toBe(created.id);
    });

    it('devrait retourner une erreur si l\'utilisateur n\'est pas propriétaire', async () => {
      const otherUser = await authService.register({
        firstName: 'Other',
        lastName: 'User',
        email: `other-${uuidv4().slice(0,8)}@test.com`,
        password: 'password123',
      });

      const created = await accountService.createAccount(userId, { accountType: 'COURANT' });
      await expect(accountService.getAccountById(created.id, otherUser.id))
        .rejects.toThrow('Compte non trouvé ou accès non autorisé');
    });
  });

  describe('getBalance()', () => {
    it('devrait retourner le bon solde', async () => {
      const account = await accountService.createAccount(userId, {
        accountType: 'COURANT',
        initialDeposit: 75000,
      });

      const balance = await accountService.getBalance(account.id, userId);
      expect(Number(balance.balance)).toBe(75000);
      expect(balance.currency).toBe('XAF');
      expect(balance.accountNumber).toBe(account.accountNumber);
    });
  });
});