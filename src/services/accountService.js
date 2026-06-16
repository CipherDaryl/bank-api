const Account = require('../models/account.js');
const Transaction = require('../models/transaction.js');
const sequelize = require('../config/database.js');

function generateAccountNumber() {
  const prefix = 'FR';
  const randomDigits = Array.from({ length: 18 }, () => 
    Math.floor(Math.random() * 10)
  ).join('');
  return `${prefix}${randomDigits}`;
}

class AccountService {
  async createAccount(userId, accountData) {
    const { accountType, initialDeposit = 0, currency = 'XAF' } = accountData;

    const existingAccount = await Account.findOne({
      where: {
        userId,
        accountType,
        status: 'ACTIF',
      },
    });

    if (existingAccount) {
      throw new Error(`Vous avez déjà un compte ${accountType} actif`);
    }

    const transaction = await sequelize.transaction();

    try {
      let accountNumber;
      let isUnique = false;
      while (!isUnique) {
        accountNumber = generateAccountNumber();
        const existing = await Account.findOne({
          where: { accountNumber },
          transaction,
        });
        if (!existing) isUnique = true;
      }

      const account = await Account.create(
        {
          userId,
          accountType,
          accountNumber,
          balance: initialDeposit,
          currency,
          status: 'ACTIF',
        },
        { transaction }
      );

      if (initialDeposit > 0) {
        await Transaction.create(
          {
            accountId: account.id,
            type: 'DEPOT',
            amount: initialDeposit,
            balanceBefore: 0,
            balanceAfter: initialDeposit,
            description: 'Dépôt initial',
            status: 'COMPLETED',
          },
          { transaction }
        );
      }

      await transaction.commit();
      return account;
    } catch (error) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        // Transaction déjà terminée, ignorer
      }
      throw error;
    }
  }

  async getUserAccounts(userId) {
    return await Account.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  async getAccountById(accountId, userId) {
    const account = await Account.findOne({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new Error('Compte non trouvé ou accès non autorisé');
    }

    return account;
  }

  async getAccountByNumber(accountNumber) {
    const account = await Account.findOne({
      where: { accountNumber, status: 'ACTIF' },
    });

    if (!account) {
      throw new Error('Compte non trouvé');
    }

    return account;
  }

  async getBalance(accountId, userId) {
    const account = await this.getAccountById(accountId, userId);
    return {
      balance: account.balance,
      currency: account.currency,
      accountNumber: account.accountNumber,
    };
  }
}

module.exports = new AccountService();