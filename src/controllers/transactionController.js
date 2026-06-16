const transactionService = require('../services/transactionService.js');

class TransactionController {
  async deposit(req, res, next) {
    try {
      const result = await transactionService.deposit(
        req.params.accountId,
        req.user.id,
        req.body
      );
      res.status(200).json({
        status: 'success',
        message: 'Dépôt effectué avec succès',
        data: result,
      });
    } catch (error) {
      if (error.message.includes('montant')) {
        return res.status(400).json({ status: 'error', message: error.message });
      }
      if (error.message === 'Le compte est bloqué ou fermé') {
        return res.status(403).json({ status: 'error', message: error.message });
      }
      next(error);
    }
  }

  async withdraw(req, res, next) {
    try {
      const result = await transactionService.withdraw(
        req.params.accountId,
        req.user.id,
        req.body
      );
      res.status(200).json({
        status: 'success',
        message: 'Retrait effectué avec succès',
        data: result,
      });
    } catch (error) {
      if (error.message.includes('montant')) {
        return res.status(400).json({ status: 'error', message: error.message });
      }
      if (error.message === 'Solde insuffisant') {
        return res.status(422).json({ status: 'error', message: error.message });
      }
      if (error.message === 'Le compte est bloqué ou fermé') {
        return res.status(403).json({ status: 'error', message: error.message });
      }
      next(error);
    }
  }

  async transfer(req, res, next) {
    try {
      const result = await transactionService.transfer(
        req.params.accountId,
        req.user.id,
        req.body
      );
      res.status(200).json({
        status: 'success',
        message: 'Virement effectué avec succès',
        data: result,
      });
    } catch (error) {
      if (error.message.includes('montant')) {
        return res.status(400).json({ status: 'error', message: error.message });
      }
      if (error.message === 'Solde insuffisant') {
        return res.status(422).json({ status: 'error', message: error.message });
      }
      if (error.message.includes('bloqué') || error.message.includes('fermé')) {
        return res.status(403).json({ status: 'error', message: error.message });
      }
      if (error.message === 'Compte non trouvé') {
        return res.status(404).json({ status: 'error', message: 'Compte destinataire non trouvé' });
      }
      if (error.message === 'Impossible de transférer vers le même compte') {
        return res.status(400).json({ status: 'error', message: error.message });
      }
      next(error);
    }
  }
}

module.exports = new TransactionController();