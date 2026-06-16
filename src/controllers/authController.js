const authService = require('../services/authService.js');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Compte créé avec succès',
        data: user,
      });
    } catch (error) {
      if (error.message === 'Cet email est déjà utilisé') {
        return res.status(409).json({ status: 'error', message: error.message });
      }
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email et mot de passe requis',
        });
      }
      const result = await authService.login(email, password);
      res.status(200).json({
        status: 'success',
        message: 'Connexion réussie',
        data: result,
      });
    } catch (error) {
      if (error.message === 'Email ou mot de passe incorrect') {
        return res.status(401).json({ status: 'error', message: error.message });
      }
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.getUserById(req.user.id);
      res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await authService.getAllUsers();
      res.status(200).json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();