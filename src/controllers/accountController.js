const accountService = require('../services/accountService.js');

class AccountController {
  async createAccount(req, res, next) {
    try {
      const account = await accountService.createAccount(req.user.id, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Compte créé avec succès',
        data: account,
      });
    } catch (error) {
      if (error.message.includes('déjà un compte')) {
        return res.status(409).json({ status: 'error', message: error.message });
      }
      next(error);
    }
  }

  async getAccounts(req, res, next) {
    try {
      const accounts = await accountService.getUserAccounts(req.user.id);
      res.status(200).json({
        status: 'success',
        data: accounts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAccountById(req, res, next) {
    try {
      const account = await accountService.getAccountById(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        data: account,
      });
    } catch (error) {
      if (error.message === 'Compte non trouvé ou accès non autorisé') {
        return res.status(404).json({ status: 'error', message: error.message });
      }
      next(error);
    }
  }

  async getBalance(req, res, next) {
    try {
      const balance = await accountService.getBalance(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        data: balance,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AccountController();