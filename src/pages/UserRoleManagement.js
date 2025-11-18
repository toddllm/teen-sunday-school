import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminAPI from '../services/adminApi';
import './UserRoleManagement.css';

function UserRoleManagement() {
  const { hasPermission, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [pagination.page, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await AdminAPI.getUsers({
        search: searchTerm,
        page: pagination.page,
        limit: pagination.limit,
      });

      setUsers(data.users);
      setPagination({
        ...pagination,
        total: data.pagination.total,
      });
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await AdminAPI.getRoles();
      setRoles(data.roles);
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      await AdminAPI.assignRole(selectedUser.id, selectedRole);
      setAssignModalOpen(false);
      setSelectedRole('');
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign role');
    }
  };

  const handleRemoveRole = async (userId, roleId) => {
    if (!window.confirm('Are you sure you want to remove this role?')) return;

    try {
      await AdminAPI.removeRole(userId, roleId);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove role');
    }
  };

  const openAssignModal = (user) => {
    setSelectedUser(user);
    setAssignModalOpen(true);
  };

  if (!hasPermission('users:read')) {
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
        <h1>User & Role Management</h1>
        <p>Manage users and assign roles to control access permissions</p>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  {isSuperAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.firstName} {user.lastName}
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <div className="roles-list">
                        {user.roles.map((role) => (
                          <span key={role.id} className="role-badge">
                            {role.displayName}
                            {isSuperAdmin && (
                              <button
                                onClick={() => handleRemoveRole(user.id, role.id)}
                                className="remove-role-btn"
                                title="Remove role"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td>
                        <button
                          onClick={() => openAssignModal(user)}
                          className="btn-small"
                        >
                          Assign Role
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {assignModalOpen && (
        <div className="modal-overlay" onClick={() => setAssignModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Assign Role</h2>
            <p>
              User: <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>
            </p>

            <div className="form-group">
              <label htmlFor="role">Select Role</label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">-- Select a role --</option>
                {roles
                  .filter(
                    (role) =>
                      !selectedUser?.roles.some((ur) => ur.id === role.id)
                  )
                  .map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.displayName} - {role.description}
                    </option>
                  ))}
              </select>
            </div>

            <div className="modal-actions">
              <button
                onClick={handleAssignRole}
                className="btn-primary"
                disabled={!selectedRole}
              >
                Assign Role
              </button>
              <button
                onClick={() => {
                  setAssignModalOpen(false);
                  setSelectedRole('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserRoleManagement;
