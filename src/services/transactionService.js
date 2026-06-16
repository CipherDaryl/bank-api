const Account = require('../models/account.js');
const Transaction = require('../models/transaction.js');
const accountService = require('./accountService.js');
const sequelize = require('../config/database.js');

class TransactionService {
  async deposit(accountId, userId, { amount, description = '' }) {
    if (amount <= 0) {
      throw new Error('Le montant doit être supérieur à 0');
    }

    const account = await accountService.getAccountById(accountId, userId);

    if (account.status !== 'ACTIF') {
      throw new Error('Le compte est bloqué ou fermé');
    }

    const transaction = await sequelize.transaction();

    try {
      const balanceBefore = parseFloat(account.balance);
      const balanceAfter = balanceBefore + amount;

      await account.update({ balance: balanceAfter }, { transaction });

      const tx = await Transaction.create(
        {
          accountId: account.id,
          type: 'DEPOT',
          amount,
          balanceBefore,
          balanceAfter,
          description: description || 'Dépôt',
          status: 'COMPLETED',
        },
        { transaction }
      );

      await transaction.commit();

      return { transaction: tx, newBalance: balanceAfter, currency: account.currency };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async withdraw(accountId, userId, { amount, description = '' }) {
    if (amount <= 0) {
      throw new Error('Le montant doit être supérieur à 0');
    }

    const account = await accountService.getAccountById(accountId, userId);

    if (account.status !== 'ACTIF') {
      throw new Error('Le compte est bloqué ou fermé');
    }

    const balanceBefore = parseFloat(account.balance);

    if (balanceBefore < amount) {
      throw new Error('Solde insuffisant');
    }

    const transaction = await sequelize.transaction();

    try {
      const balanceAfter = balanceBefore - amount;

      await account.update({ balance: balanceAfter }, { transaction });

      const tx = await Transaction.create(
        {
          accountId: account.id,
          type: 'RETRAIT',
          amount,
          balanceBefore,
          balanceAfter,
          description: description || 'Retrait',
          status: 'COMPLETED',
        },
        { transaction }
      );

      await transaction.commit();

      return { transaction: tx, newBalance: balanceAfter, currency: account.currency };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async transfer(fromAccountId, userId, { toAccountNumber, amount, description = '' }) {
    if (amount <= 0) {
      throw new Error('Le montant doit être supérieur à 0');
    }

    const fromAccount = await accountService.getAccountById(fromAccountId, userId);

    if (fromAccount.status !== 'ACTIF') {
      throw new Error('Le compte source est bloqué ou fermé');
    }

    const toAccount = await accountService.getAccountByNumber(toAccountNumber);

    if (toAccount.status !== 'ACTIF') {
      throw new Error('Le compte destination est bloqué ou fermé');
    }

    if (fromAccount.id === toAccount.id) {
      throw new Error('Impossible de transférer vers le même compte');
    }

    const fromBalanceBefore = parseFloat(fromAccount.balance);

    if (fromBalanceBefore < amount) {
      throw new Error('Solde insuffisant');
    }

    const transaction = await sequelize.transaction();

    try {
      const fromBalanceAfter = fromBalanceBefore - amount;
      await fromAccount.update({ balance: fromBalanceAfter }, { transaction });

      const toBalanceBefore = parseFloat(toAccount.balance);
      const toBalanceAfter = toBalanceBefore + amount;
      await toAccount.update({ balance: toBalanceAfter }, { transaction });

      const tx = await Transaction.create(
        {
          accountId: fromAccount.id,
          type: 'VIREMENT_SORTANT',
          amount,
          balanceBefore: fromBalanceBefore,
          balanceAfter: fromBalanceAfter,
          referenceId: toAccount.id,
          description: description || `Virement vers ${toAccount.accountNumber}`,
          status: 'COMPLETED',
        },
        { transaction }
      );

      await Transaction.create(
        {
          accountId: toAccount.id,
          type: 'VIREMENT_ENTRANT',
          amount,
          balanceBefore: toBalanceBefore,
          balanceAfter: toBalanceAfter,
          referenceId: fromAccount.id,
          description: description || `Virement de ${fromAccount.accountNumber}`,
          status: 'COMPLETED',
        },
        { transaction }
      );

      await transaction.commit();

      return {
        transactionId: tx.id,
        amount,
        fromAccount: fromAccount.accountNumber,
        toAccount: toAccount.accountNumber,
        newBalance: fromBalanceAfter,
        currency: fromAccount.currency,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new TransactionService();