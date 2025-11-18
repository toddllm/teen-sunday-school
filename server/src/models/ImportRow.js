const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ImportRow = sequelize.define('ImportRow', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  importJobId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'import_jobs',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  rowNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Row number in the CSV file'
  },
  dataJson: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Original CSV row data as JSON'
  },
  status: {
    type: DataTypes.ENUM('pending', 'validated', 'processing', 'success', 'failed', 'skipped'),
    defaultValue: 'pending',
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'User created from this row (if successful)'
  },
  invitationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'invitations',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Invitation sent for this row (if applicable)'
  },
  errors: {
    type: DataTypes.JSONB,
    defaultValue: [],
    allowNull: false,
    comment: 'Validation or processing errors for this row'
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'import_rows',
  timestamps: true,
  indexes: [
    { fields: ['importJobId'] },
    { fields: ['status'] },
    { fields: ['userId'] },
    { fields: ['invitationId'] }
  ]
});

module.exports = ImportRow;
