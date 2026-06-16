import { describe, it, expect, beforeEach } from 'vitest';
import transactionService from '../../src/services/transactionService.js';
import accountService from '../../src/services/accountService.js';
import authService from '../../src/services/authService.js';
import { v4 as uuidv4 } from 'uuid';

describe('TransactionService - Tests unitaires', () => {
  let userId;
  let accountId;

  beforeEach(async () => {
    const user = await authService.register({
      firstName: 'Test',
      lastName: 'User',
      email: `test-${uuidv4().slice(0,8)}@transaction.com`,
      password: 'password123',
    });
    userId = user.id;

    const account = await accountService.createAccount(userId, {
      accountType: 'COURANT',
      initialDeposit: 100000,
    });
    accountId = account.id;
  });

  describe('deposit()', () => {
    it('devrait déposer de l\'argent avec succès', async () => {
      const result = await transactionService.deposit(accountId, userId, {
        amount: 50000,
        description: 'Dépôt test',
      });

      expect(result.newBalance).toBe(150000);
      expect(result.transaction.type).toBe('DEPOT');
      expect(Number(result.transaction.amount)).toBe(50000);
    });

    it('devrait retourner une erreur pour un montant négatif', async () => {
      await expect(transactionService.deposit(accountId, userId, { amount: -1000 }))
        .rejects.toThrow('Le montant doit être supérieur à 0');
    });

    it('devrait retourner une erreur pour un montant nul', async () => {
      await expect(transactionService.deposit(accountId, userId, { amount: 0 }))
        .rejects.toThrow('Le montant doit être supérieur à 0');
    });
  });

  describe('withdraw()', () => {
    it('devrait retirer de l\'argent avec succès', async () => {
      const result = await transactionService.withdraw(accountId, userId, {
        amount: 30000,
        description: 'Retrait test',
      });

      expect(result.newBalance).toBe(70000);
      expect(result.transaction.type).toBe('RETRAIT');
      expect(Number(result.transaction.amount)).toBe(30000);
    });

    it('devrait retourner une erreur si le solde est insuffisant', async () => {
      await expect(transactionService.withdraw(accountId, userId, { amount: 200000 }))
        .rejects.toThrow('Solde insuffisant');
    });
  });

  describe('transfer()', () => {
    let toAccountNumber;

    beforeEach(async () => {
      const toUser = await authService.register({
        firstName: 'Dest',
        lastName: 'User',
        email: `dest-${uuidv4().slice(0,8)}@test.com`,
        password: 'password123',
      });

      const toAccount = await accountService.createAccount(toUser.id, {
        accountType: 'COURANT',
        initialDeposit: 50000,
      });
      toAccountNumber = toAccount.accountNumber;
    });

    it('devrait transférer de l\'argent avec succès', async () => {
      const result = await transactionService.transfer(accountId, userId, {
        toAccountNumber,
        amount: 25000,
        description: 'Virement test',
      });

      expect(result.newBalance).toBe(75000);
      expect(result.amount).toBe(25000);
      expect(result.fromAccount).toBeDefined();
      expect(result.toAccount).toBe(toAccountNumber);
    });

    it('devrait retourner une erreur si le solde est insuffisant', async () => {
      await expect(transactionService.transfer(accountId, userId, {
        toAccountNumber,
        amount: 200000,
      })).rejects.toThrow('Solde insuffisant');
    });

    it('devrait retourner une erreur pour un transfert vers le même compte', async () => {
      const account = await accountService.getAccountById(accountId, userId);
      await expect(transactionService.transfer(accountId, userId, {
        toAccountNumber: account.accountNumber,
        amount: 1000,
      })).rejects.toThrow('Impossible de transférer vers le même compte');
    });

    it('devrait retourner une erreur pour un compte inexistant', async () => {
      await expect(transactionService.transfer(accountId, userId, {
        toAccountNumber: 'FR999999999999999999999',
        amount: 1000,
      })).rejects.toThrow('Compte non trouvé');
    });
  });
});