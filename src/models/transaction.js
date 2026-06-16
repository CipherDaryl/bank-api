const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.js');
const { v4: uuidv4 } = require('uuid');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  accountId: { type: DataTypes.UUID, allowNull: false },
  type: {
    type: DataTypes.ENUM('DEPOT', 'RETRAIT', 'VIREMENT_SORTANT', 'VIREMENT_ENTRANT'),
    allowNull: false,
  },
  amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, validate: { min: 0.01 } },
  balanceBefore: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  balanceAfter: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  referenceId: { type: DataTypes.UUID, allowNull: true },
  description: { type: DataTypes.STRING(255), allowNull: true },
  status: { type: DataTypes.ENUM('COMPLETED', 'PENDING', 'FAILED'), defaultValue: 'COMPLETED' },
  ipAddress: { type: DataTypes.STRING(45), allowNull: true },
});

module.exports = Transaction;