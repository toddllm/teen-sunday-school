const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ImportJob = sequelize.define('ImportJob', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Admin user who created the import'
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Original uploaded file name'
  },
  status: {
    type: DataTypes.ENUM('pending', 'validating', 'validated', 'processing', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false
  },
  totalRows: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  successfulRows: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  failedRows: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  columnMapping: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Maps CSV columns to user fields: {email: "Email", firstName: "First Name", ...}'
  },
  validationErrors: {
    type: DataTypes.JSONB,
    defaultValue: [],
    allowNull: false,
    comment: 'Array of validation errors found during processing'
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      sendInvitations: true,
      defaultRole: 'student',
      skipDuplicates: true
    },
    allowNull: false
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if job failed'
  }
}, {
  tableName: 'import_jobs',
  timestamps: true,
  indexes: [
    { fields: ['organizationId'] },
    { fields: ['createdBy'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = ImportJob;
