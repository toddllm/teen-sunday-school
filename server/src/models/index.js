const { sequelize } = require('../config/database');
const Organization = require('./Organization');
const User = require('./User');
const ImportJob = require('./ImportJob');
const ImportRow = require('./ImportRow');
const Invitation = require('./Invitation');

// Define associations

// Organization associations
Organization.hasMany(User, {
  foreignKey: 'organizationId',
  as: 'users'
});

Organization.hasMany(ImportJob, {
  foreignKey: 'organizationId',
  as: 'importJobs'
});

Organization.hasMany(Invitation, {
  foreignKey: 'organizationId',
  as: 'invitations'
});

// User associations
User.belongsTo(Organization, {
  foreignKey: 'organizationId',
  as: 'organization'
});

User.hasMany(ImportJob, {
  foreignKey: 'createdBy',
  as: 'createdImports'
});

User.hasMany(Invitation, {
  foreignKey: 'invitedBy',
  as: 'sentInvitations'
});

// ImportJob associations
ImportJob.belongsTo(Organization, {
  foreignKey: 'organizationId',
  as: 'organization'
});

ImportJob.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

ImportJob.hasMany(ImportRow, {
  foreignKey: 'importJobId',
  as: 'rows'
});

// ImportRow associations
ImportRow.belongsTo(ImportJob, {
  foreignKey: 'importJobId',
  as: 'importJob'
});

ImportRow.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

ImportRow.belongsTo(Invitation, {
  foreignKey: 'invitationId',
  as: 'invitation'
});

// Invitation associations
Invitation.belongsTo(Organization, {
  foreignKey: 'organizationId',
  as: 'organization'
});

Invitation.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Invitation.belongsTo(User, {
  foreignKey: 'invitedBy',
  as: 'inviter'
});

module.exports = {
  sequelize,
  Organization,
  User,
  ImportJob,
  ImportRow,
  Invitation
};
