import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrganizations } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { useGroups } from '../contexts/GroupContext';
import './OrganizationAdminPage.css';

const OrganizationAdminPage = () => {
  const { organizations, createOrganization, updateOrganization, deleteOrganization } =
    useOrganizations();
  const { currentUser } = useAuth();
  const { getOrganizationGroups, getGroupMemberCount } = useGroups();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingOrg) {
      // Update existing organization
      updateOrganization(editingOrg.id, {
        name: formData.name,
        contactEmail: formData.contactEmail,
        branding: {
          logo: '',
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor
        }
      });
      setEditingOrg(null);
    } else {
      // Create new organization
      createOrganization({
        name: formData.name,
        contactEmail: formData.contactEmail,
        branding: {
          logo: '',
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor
        }
      });
    }

    // Reset form
    setFormData({
      name: '',
      contactEmail: '',
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af'
    });
    setShowCreateForm(false);
  };

  const handleEdit = (org) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      contactEmail: org.contactEmail || '',
      primaryColor: org.branding?.primaryColor || '#2563eb',
      secondaryColor: org.branding?.secondaryColor || '#1e40af'
    });
    setShowCreateForm(true);
  };

  const handleDelete = (orgId) => {
    if (window.confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      deleteOrganization(orgId);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingOrg(null);
    setFormData({
      name: '',
      contactEmail: '',
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af'
    });
  };

  const getOrgStats = (orgId) => {
    const groups = getOrganizationGroups(orgId);
    const totalMembers = groups.reduce((sum, group) => {
      return sum + getGroupMemberCount(group.id);
    }, 0);

    return {
      groupCount: groups.length,
      memberCount: totalMembers
    };
  };

  return (
    <div className="organization-admin-page">
      <div className="page-header">
        <h1>Organization Management</h1>
        {!showCreateForm && (
          <button
            className="btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Create Organization
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="org-form-container">
          <h2>{editingOrg ? 'Edit Organization' : 'Create New Organization'}</h2>
          <form onSubmit={handleSubmit} className="org-form">
            <div className="form-group">
              <label htmlFor="name">Organization Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., First Baptist Church"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactEmail">Contact Email</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="contact@church.org"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="primaryColor">Primary Color</label>
                <div className="color-input">
                  <input
                    type="color"
                    id="primaryColor"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                  />
                  <span>{formData.primaryColor}</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="secondaryColor">Secondary Color</label>
                <div className="color-input">
                  <input
                    type="color"
                    id="secondaryColor"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleChange}
                  />
                  <span>{formData.secondaryColor}</span>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingOrg ? 'Update Organization' : 'Create Organization'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="organizations-list">
        <h2>All Organizations ({organizations.length})</h2>

        {organizations.length === 0 ? (
          <div className="empty-state">
            <p>No organizations created yet.</p>
            <p>Click "Create Organization" to get started.</p>
          </div>
        ) : (
          <div className="org-grid">
            {organizations.map(org => {
              const stats = getOrgStats(org.id);
              return (
                <div key={org.id} className="org-card">
                  <div className="org-header">
                    <h3>{org.name}</h3>
                    <div className="org-actions">
                      <Link
                        to={`/admin/orgs/${org.id}`}
                        className="btn-icon"
                        title="View Dashboard"
                      >
                        📊
                      </Link>
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(org)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(org.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="org-info">
                    {org.contactEmail && (
                      <p className="org-email">
                        <strong>Email:</strong> {org.contactEmail}
                      </p>
                    )}

                    <div className="org-stats">
                      <div className="stat">
                        <span className="stat-value">{stats.groupCount}</span>
                        <span className="stat-label">Groups</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{stats.memberCount}</span>
                        <span className="stat-label">Members</span>
                      </div>
                    </div>

                    <div className="org-branding">
                      <div className="color-preview">
                        <div
                          className="color-box"
                          style={{ backgroundColor: org.branding?.primaryColor }}
                          title="Primary Color"
                        ></div>
                        <div
                          className="color-box"
                          style={{ backgroundColor: org.branding?.secondaryColor }}
                          title="Secondary Color"
                        ></div>
                      </div>
                    </div>

                    <p className="org-date">
                      Created: {new Date(org.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationAdminPage;
