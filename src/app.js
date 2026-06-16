const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/authRoutes.js');
const accountRoutes = require('./routes/accountRoutes.js');
const transactionRoutes = require('./routes/transactionRoutes.js');
const webController = require('./controllers/webController.js');
const sequelize = require('./config/database.js');

const app = express();

// ============ CONFIGURATION DES VUES ============
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============ MIDDLEWARES ============
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session pour l'interface web
app.use(session({
  secret: process.env.SESSION_SECRET || 'session_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { status: 'error', message: 'Trop de requêtes' },
});
app.use('/api', limiter);

// ============ ROUTES API ============
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/transactions', transactionRoutes);

// ============ ROUTES WEB ============
// Pages publiques
app.get('/', webController.home);
app.get('/register', webController.registerPage);
app.post('/register', webController.register);
app.get('/login', webController.loginPage);
app.post('/login', webController.login);
app.get('/logout', webController.logout);

// Middleware d'authentification pour les routes protégées
const requireAuth = (req, res, next) => {
  if (!req.session.token) {
    req.session.message = {
      type: 'danger',
      icon: 'bi-exclamation-triangle',
      text: 'Veuillez vous connecter pour accéder à cette page'
    };
    return res.redirect('/login');
  }
  next();
};

// Pages protégées
app.get('/dashboard', requireAuth, webController.dashboard);
app.get('/accounts/create', requireAuth, webController.createAccountPage);
app.post('/accounts/create', requireAuth, webController.createAccount);
app.get('/deposit', requireAuth, webController.depositPage);
app.post('/deposit', requireAuth, webController.deposit);
app.get('/withdraw', requireAuth, webController.withdrawPage);
app.post('/withdraw', requireAuth, webController.withdraw);
app.get('/transfer', requireAuth, webController.transferPage);
app.post('/transfer', requireAuth, webController.transfer);

// ============ GESTION DES ERREURS ============
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.stack);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne'
  });
});

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route non trouvée' });
});

// ============ INITIALISATION DE LA BASE DE DONNÉES ============
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synchronisées avec succès.');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
  }
};

initDatabase();

module.exports = app;