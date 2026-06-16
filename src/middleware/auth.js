const { verifyToken } = require('../config/jwt.js');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Authentification requise' 
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    req.user = verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Token invalide' 
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Accès non autorisé' 
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };