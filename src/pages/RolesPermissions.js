import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminAPI from '../services/adminApi';
import './RolesPermissions.css';

function RolesPermissions() {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        AdminAPI.getRoles(),
        AdminAPI.getPermissions(),
      ]);

      setRoles(rolesData.roles);
      setPermissions(permissionsData.permissions);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission('roles:read')) {
    return (
      <div className="page-container">
        <div className="error-card">
          <h2>Access Denied</h2>
          <p>You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Roles & Permissions</h1>
        <p>View system roles and their associated permissions</p>
      </div>

      {loading ? (
        <div className="loading">Loading roles and permissions...</div>
      ) : (
        <div className="roles-grid">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`role-card ${selectedRole?.id === role.id ? 'selected' : ''}`}
              onClick={() => setSelectedRole(selectedRole?.id === role.id ? null : role)}
            >
              <div className="role-header">
                <h3>{role.displayName}</h3>
                {role.isSystem && <span className="system-badge">System</span>}
              </div>
              <p className="role-description">{role.description}</p>
              <div className="role-stats">
                <div className="stat">
                  <span className="stat-value">{role.userCount}</span>
                  <span className="stat-label">Users</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{role.permissions.length}</span>
                  <span className="stat-label">Permissions</span>
                </div>
              </div>

              {selectedRole?.id === role.id && (
                <div className="permissions-list">
                  <h4>Permissions:</h4>
                  {Object.entries(
                    role.permissions.reduce((acc, perm) => {
                      if (!acc[perm.category]) {
                        acc[perm.category] = [];
                      }
                      acc[perm.category].push(perm);
                      return acc;
                    }, {})
                  ).map(([category, perms]) => (
                    <div key={category} className="permission-category">
                      <h5>{category.charAt(0).toUpperCase() + category.slice(1)}</h5>
                      <ul>
                        {perms.map((perm) => (
                          <li key={perm.id}>
                            <strong>{perm.displayName}</strong>
                            <span className="perm-name">{perm.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="permissions-reference">
        <h2>All Permissions by Category</h2>
        <div className="categories-grid">
          {Object.entries(permissions).map(([category, perms]) => (
            <div key={category} className="category-card">
              <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
              <ul>
                {perms.map((perm) => (
                  <li key={perm.id}>
                    <div className="perm-info">
                      <strong>{perm.displayName}</strong>
                      <code>{perm.name}</code>
                    </div>
                    {perm.description && (
                      <p className="perm-description">{perm.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RolesPermissions;
