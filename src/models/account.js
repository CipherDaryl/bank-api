const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.js');
const { v4: uuidv4 } = require('uuid');

function generateAccountNumber() {
  const prefix = 'FR';
  const randomDigits = Array.from({ length: 18 }, () => 
    Math.floor(Math.random() * 10)
  ).join('');
  return `${prefix}${randomDigits}`;
}

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  userId: { type: DataTypes.UUID, allowNull: false },
  accountNumber: { type: DataTypes.STRING(34), allowNull: false, unique: true },
  accountType: {
    type: DataTypes.ENUM('COURANT', 'EPARGNE', 'PROFESSIONNEL'),
    defaultValue: 'COURANT',
  },
  balance: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0, validate: { min: 0 } },
  currency: { type: DataTypes.STRING(3), defaultValue: 'XAF' },
  status: { type: DataTypes.ENUM('ACTIF', 'BLOQUE', 'FERME'), defaultValue: 'ACTIF' },
  closedAt: { type: DataTypes.DATE, allowNull: true },
});

module.exports = Account;