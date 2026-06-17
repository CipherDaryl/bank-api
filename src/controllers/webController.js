const axios = require('axios');

const API_URL = 'https://bank-api-r3lj.onrender.com/api/v1';

class WebController {
  // Accueil
  async home(req, res) {
    if (req.session.token) {
      return res.redirect('/dashboard');
    }
    res.render('index', { 
      title: 'Accueil', 
      user: null,
      message: null,
      body: '' 
    });
  }

  // Page d'inscription
  async registerPage(req, res) {
    if (req.session.token) {
      return res.redirect('/dashboard');
    }
    res.render('register', { 
      title: 'Inscription', 
      user: null,
      message: null,
      body: '' 
    });
  }

  // Traitement de l'inscription
  async register(req, res) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, req.body);
      
      if (response.status === 201) {
        req.session.message = {
          type: 'success',
          icon: 'bi-check-circle',
          text: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.'
        };
        return res.redirect('/login');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erreur lors de l\'inscription';
      req.session.message = {
        type: 'danger',
        icon: 'bi-exclamation-triangle',
        text: errorMsg
      };
      return res.redirect('/register');
    }
  }

  // Page de connexion
  async loginPage(req, res) {
    if (req.session.token) {
      return res.redirect('/dashboard');
    }
    const message = req.session.message;
    req.session.message = null;
    res.render('login', { 
      title: 'Connexion', 
      user: null,
      message: message,
      body: '' 
    });
  }

  // Traitement de la connexion
  async login(req, res) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: req.body.email,
        password: req.body.password
      });

      if (response.status === 200) {
        req.session.token = response.data.data.token;
        req.session.user = response.data.data.user;
        return res.redirect('/dashboard');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Email ou mot de passe incorrect';
      req.session.message = {
        type: 'danger',
        icon: 'bi-exclamation-triangle',
        text: errorMsg
      };
      return res.redirect('/login');
    }
  }

  // Déconnexion
  async logout(req, res) {
    req.session.destroy();
    res.redirect('/login');
  }

  // Dashboard
  async dashboard(req, res) {
    try {
      const response = await axios.get(`${API_URL}/accounts`, {
        headers: { Authorization: `Bearer ${req.session.token}` }
      });

      const message = req.session.message;
      req.session.message = null;

      res.render('dashboard', {
        title: 'Dashboard',
        user: req.session.user,
        accounts: response.data.data || [],
        message: message,
        body: '' 
      });
    } catch (error) {
      req.session.message = {
        type: 'danger',
        icon: 'bi-exclamation-triangle',
        text: 'Erreur lors du chargement du dashboard'
      };
      res.redirect('/login');
    }
  }

  // Page création de compte
  async createAccountPage(req, res) {
    const message = req.session.message;
    req.session.message = null;
    res.render('create-account', {
      title: 'Créer un compte',
      user: req.session.user,
      message: message,
      body: '' 
    });
  }

  // Traitement création de compte
  async createAccount(req, res) {
    try {
      const response = await axios.post(`${API_URL}/accounts`, req.body, {
        headers: { Authorization: `Bearer ${req.session.token}` }
      });

      if (response.status === 201) {
        req.session.message = {
          type: 'success',
          icon: 'bi-check-circle',
          text: 'Compte créé avec succès !'
        };
        return res.redirect('/dashboard');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erreur lors de la création';
      req.session.message = {
        type: 'danger',
        icon: 'bi-exclamation-triangle',
        text: errorMsg
      };
      return res.redirect('/accounts/create');
    }
  }

  // Page dépôt
  async depositPage(req, res) {
    const accountId = req.query.accountId;
    const message = req.session.message;
    req.session.message = null;
    res.render('deposit', {
      title: 'Dépôt',
      user: req.session.user,
      accountId: accountId,
      message: message,
      body: '' 
    });
  }

  // Traitement dépôt
  async deposit(req, res) {
    try {
      const { accountId, amount, description } = req.body;
      
      const response = await axios.post(`${API_URL}/transactions/${accountId}/deposit`, {
        amount: parseFloat(amount),
        description: description || 'Dépôt'
      }, {
        headers: { Authorization: `Bearer ${req.session.token}` }
      });

      if (response.status === 200) {
        req.session.message = {
          type: 'success',
          icon: 'bi-check-circle',
          text: `Dépôt de ${parseFloat(amount).toLocaleString()} XAF effectué avec succès !`
        };
        return res.redirect('/dashboard');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erreur lors du dépôt';
      req.session.message = {
        type: 'danger',
        icon: 'bi-exclamation-triangle',
        text: errorMsg
      };
      return res.redirect(`/deposit?accountId=${req.body.accountId}`);
    }
  }

  // Page retrait
  async withdrawPage(req, res) {
    const accountId = req.query.accountId;
    const message = req.session.message;
    req.session.message = null;
    res.render('withdraw', {
      title: 'Retrait',
      user: req.session.user,
      accountId: accountId,
      message: message,
      body: '' 
    });
  }

  // Traitement retrait
  async withdraw(req, res) {
    try {
      const { accountId, amount, description } = req.body;
      
      const response = await axios.post(`${API_URL}/transactions/${accountId}/withdraw`, {
        amount: parseFloat(amount),
        description: description || 'Retrait'
      }, {
        headers: { Authorization: `Bearer ${req.session.token}` }
      });

      if (response.status === 200) {
        req.session.message = {
          type: 'success',
          icon: 'bi-check-circle',
          text: `Retrait de ${parseFloat(amount).toLocaleString()} XAF effectué avec succès !`
        };
        return res.redirect('/dashboard');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erreur lors du retrait';
      req.session.message = {
        type: 'danger',
        icon: 'bi-exclamation-triangle',
        text: errorMsg
      };
      return res.redirect(`/withdraw?accountId=${req.body.accountId}`);
    }
  }

  // Page virement
  async transferPage(req, res) {
    try {
      const response = await axios.get(`${API_URL}/accounts`, {
        headers: { Authorization: `Bearer ${req.session.token}` }
      });

      const message = req.session.message;
      req.session.message = null;

      res.render('transfer', {
        title: 'Virement',
        user: req.session.user,
        accounts: response.data.data || [],
        message: message,
        body: '' 
      });
    } catch (error) {
      req.session.message = {
        type: 'danger',
        icon: 'bi-exclamation-triangle',
        text: 'Erreur lors du chargement des comptes'
      };
      res.redirect('/dashboard');
    }
  }

  // Traitement virement
  async transfer(req, res) {
    try {
      const { fromAccountId, toAccountNumber, amount, description } = req.body;
      
      const response = await axios.post(`${API_URL}/transactions/${fromAccountId}/transfer`, {
        toAccountNumber: toAccountNumber,
        amount: parseFloat(amount),
        description: description || 'Virement'
      }, {
        headers: { Authorization: `Bearer ${req.session.token}` }
      });

      if (response.status === 200) {
        req.session.message = {
          type: 'success',
          icon: 'bi-check-circle',
          text: `Virement de ${parseFloat(amount).toLocaleString()} XAF effectué avec succès !`
        };
        return res.redirect('/dashboard');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erreur lors du virement';
      req.session.message = {
        type: 'danger',
        icon: 'bi-exclamation-triangle',
        text: errorMsg
      };
      return res.redirect('/transfer');
    }
  }
}

module.exports = new WebController();