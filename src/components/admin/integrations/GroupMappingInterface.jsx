import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Integrations.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function GroupMappingInterface({ integrationId }) {
  const [mappings, setMappings] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadData();
  }, [integrationId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load external groups and mappings
      const [mappingsRes, groupsRes] = await Promise.all([
        axios.get(`${API_URL}/api/integrations/${integrationId}/groups`),
        axios.get(`${API_URL}/api/orgs/${groups}/groups`), // TODO: Get org ID from auth context
      ]);

      setMappings(mappingsRes.data.groups);
      setGroups(groupsRes.data.groups || []);
    } catch (err) {
      console.error('Failed to load mappings:', err);
      setError(err.response?.data?.error || 'Failed to load mappings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMapping = async (externalGroupId, localGroupId) => {
    try {
      await axios.post(
        `${API_URL}/api/integrations/${integrationId}/mappings`,
        {
          externalGroupId,
          groupId: localGroupId || null,
        }
      );

      setSuccess('Mapping created successfully');
      setTimeout(() => setSuccess(null), 3000);
      await loadData();
    } catch (err) {
      console.error('Failed to create mapping:', err);
      setError(err.response?.data?.error || 'Failed to create mapping');
    }
  };

  const handleUpdateMapping = async (mappingId, groupId, syncMembers) => {
    try {
      await axios.put(`${API_URL}/api/integrations/mappings/${mappingId}`, {
        groupId: groupId || null,
        syncMembers,
      });

      setSuccess('Mapping updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      await loadData();
    } catch (err) {
      console.error('Failed to update mapping:', err);
      setError(err.response?.data?.error || 'Failed to update mapping');
    }
  };

  const handleDeleteMapping = async (mappingId) => {
    if (!window.confirm('Remove this group mapping?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/integrations/mappings/${mappingId}`);
      setSuccess('Mapping removed successfully');
      setTimeout(() => setSuccess(null), 3000);
      await loadData();
    } catch (err) {
      console.error('Failed to delete mapping:', err);
      setError(err.response?.data?.error || 'Failed to delete mapping');
    }
  };

  if (loading) {
    return <div className="loading">Loading group mappings...</div>;
  }

  const unmappedGroups = mappings.filter((m) => !m.groupId);
  const mappedGroups = mappings.filter((m) => m.groupId);

  return (
    <div className="group-mapping-interface">
      <h2>Group Mappings</h2>
      <p>
        Map external groups from Planning Center to your local groups. Only
        mapped groups will be synced.
      </p>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {unmappedGroups.length > 0 && (
        <div className="unmapped-groups">
          <h3>⚠️ Unmapped Groups ({unmappedGroups.length})</h3>
          <p className="warning-text">
            These groups from Planning Center are not mapped to any local group.
            They will not be synced.
          </p>

          <div className="mapping-list">
            {unmappedGroups.map((mapping) => (
              <div key={mapping.id} className="mapping-item unmapped">
                <div className="mapping-info">
                  <h4>{mapping.externalGroupName}</h4>
                  <p className="mapping-type">{mapping.externalGroupType}</p>
                </div>

                <div className="mapping-controls">
                  <select
                    onChange={(e) =>
                      e.target.value &&
                      handleUpdateMapping(mapping.id, e.target.value, true)
                    }
                    defaultValue=""
                    className="group-select"
                  >
                    <option value="">Select a local group...</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mappedGroups.length > 0 && (
        <div className="mapped-groups">
          <h3>✓ Mapped Groups ({mappedGroups.length})</h3>

          <div className="mapping-list">
            {mappedGroups.map((mapping) => (
              <div key={mapping.id} className="mapping-item mapped">
                <div className="mapping-info">
                  <h4>{mapping.externalGroupName}</h4>
                  <p className="mapping-type">{mapping.externalGroupType}</p>
                  {mapping.group && (
                    <p className="mapped-to">
                      → Mapped to: <strong>{mapping.group.name}</strong>
                    </p>
                  )}
                </div>

                <div className="mapping-controls">
                  <label className="sync-toggle">
                    <input
                      type="checkbox"
                      checked={mapping.syncMembers}
                      onChange={(e) =>
                        handleUpdateMapping(
                          mapping.id,
                          mapping.groupId,
                          e.target.checked
                        )
                      }
                    />
                    Sync members
                  </label>

                  <select
                    value={mapping.groupId || ''}
                    onChange={(e) =>
                      handleUpdateMapping(
                        mapping.id,
                        e.target.value,
                        mapping.syncMembers
                      )
                    }
                    className="group-select"
                  >
                    <option value="">Unmap...</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleDeleteMapping(mapping.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mappings.length === 0 && (
        <div className="empty-state">
          <h3>No groups found</h3>
          <p>
            No groups have been fetched from Planning Center yet. Run a sync to
            fetch groups.
          </p>
        </div>
      )}
    </div>
  );
}

export default GroupMappingInterface;
