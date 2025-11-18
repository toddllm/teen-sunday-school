import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import './BulkImportPage.css';

const BulkImportPage = () => {
  const navigate = useNavigate();
  const { organization, isOrgAdmin } = useAuth();

  const [step, setStep] = useState(1); // 1: Upload, 2: Mapping, 3: Validation
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [columns, setColumns] = useState([]);
  const [preview, setPreview] = useState([]);
  const [suggestedMapping, setSuggestedMapping] = useState({});
  const [columnMapping, setColumnMapping] = useState({
    email: '',
    firstName: '',
    lastName: '',
    group: '',
    role: ''
  });
  const [settings, setSettings] = useState({
    sendInvitations: true,
    defaultRole: 'student',
    skipDuplicates: true
  });
  const [validation, setValidation] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is org admin
  if (!isOrgAdmin()) {
    return (
      <div className="bulk-import-page">
        <div className="error-message">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await apiClient.uploadCSV(organization.id, file);

      if (response.success) {
        setJobId(response.data.jobId);
        setColumns(response.data.columns);
        setPreview(response.data.preview);
        setSuggestedMapping(response.data.suggestedMapping);

        // Apply suggested mapping
        setColumnMapping({
          email: response.data.suggestedMapping.email || '',
          firstName: response.data.suggestedMapping.firstName || '',
          lastName: response.data.suggestedMapping.lastName || '',
          group: response.data.suggestedMapping.group || '',
          role: response.data.suggestedMapping.role || ''
        });

        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleMappingChange = (field, value) => {
    setColumnMapping({
      ...columnMapping,
      [field]: value
    });
  };

  const handleSettingsChange = (field, value) => {
    setSettings({
      ...settings,
      [field]: value
    });
  };

  const handleValidateMapping = async () => {
    if (!columnMapping.email || !columnMapping.firstName || !columnMapping.lastName) {
      setError('Email, First Name, and Last Name are required');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await apiClient.setColumnMapping(
        organization.id,
        jobId,
        columnMapping,
        settings
      );

      if (response.success) {
        setValidation(response.data.validation);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to validate mapping');
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessImport = async () => {
    setProcessing(true);
    setError(null);

    try {
      const response = await apiClient.processImport(organization.id, jobId);

      if (response.success) {
        navigate(`/admin/imports/${jobId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start import');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setJobId(null);
    setColumns([]);
    setPreview([]);
    setSuggestedMapping({});
    setColumnMapping({
      email: '',
      firstName: '',
      lastName: '',
      group: '',
      role: ''
    });
    setValidation(null);
    setError(null);
  };

  return (
    <div className="bulk-import-page">
      <div className="page-header">
        <h1>Bulk Import Users</h1>
        <button className="btn-secondary" onClick={() => navigate('/admin/imports')}>
          View Import History
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Step indicator */}
      <div className="steps-indicator">
        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Upload CSV</div>
        </div>
        <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Map Columns</div>
        </div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Review & Import</div>
        </div>
      </div>

      {/* Step 1: Upload CSV */}
      {step === 1 && (
        <div className="step-content">
          <h2>Step 1: Upload CSV File</h2>
          <p>Upload a CSV file containing user information. The file should include columns for email, first name, and last name at minimum.</p>

          <div className="csv-requirements">
            <h3>CSV Requirements:</h3>
            <ul>
              <li>File format: CSV (.csv)</li>
              <li>Maximum rows: 1000</li>
              <li>Maximum file size: 5 MB</li>
              <li>Required columns: Email, First Name, Last Name</li>
              <li>Optional columns: Group, Role</li>
            </ul>
          </div>

          <div className="file-upload-section">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {file && <p className="file-name">Selected: {file.name}</p>}
          </div>

          <div className="button-group">
            <button
              className="btn-primary"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload and Continue'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Map Columns */}
      {step === 2 && (
        <div className="step-content">
          <h2>Step 2: Map Columns</h2>
          <p>Map the CSV columns to user fields. We've suggested mappings based on column names.</p>

          <div className="column-mapping">
            {/* Email mapping */}
            <div className="mapping-row">
              <label>
                Email <span className="required">*</span>
              </label>
              <select
                value={columnMapping.email}
                onChange={(e) => handleMappingChange('email', e.target.value)}
              >
                <option value="">Select column...</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* First Name mapping */}
            <div className="mapping-row">
              <label>
                First Name <span className="required">*</span>
              </label>
              <select
                value={columnMapping.firstName}
                onChange={(e) => handleMappingChange('firstName', e.target.value)}
              >
                <option value="">Select column...</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Last Name mapping */}
            <div className="mapping-row">
              <label>
                Last Name <span className="required">*</span>
              </label>
              <select
                value={columnMapping.lastName}
                onChange={(e) => handleMappingChange('lastName', e.target.value)}
              >
                <option value="">Select column...</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Group mapping */}
            <div className="mapping-row">
              <label>Group (optional)</label>
              <select
                value={columnMapping.group}
                onChange={(e) => handleMappingChange('group', e.target.value)}
              >
                <option value="">Select column...</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Role mapping */}
            <div className="mapping-row">
              <label>Role (optional)</label>
              <select
                value={columnMapping.role}
                onChange={(e) => handleMappingChange('role', e.target.value)}
              >
                <option value="">Select column...</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="import-settings">
            <h3>Import Settings</h3>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.sendInvitations}
                onChange={(e) => handleSettingsChange('sendInvitations', e.target.checked)}
              />
              Send invitation emails to users
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.skipDuplicates}
                onChange={(e) => handleSettingsChange('skipDuplicates', e.target.checked)}
              />
              Skip duplicate emails (existing users will not be re-invited)
            </label>

            <div className="setting-row">
              <label>Default role for imported users:</label>
              <select
                value={settings.defaultRole}
                onChange={(e) => handleSettingsChange('defaultRole', e.target.value)}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>
          </div>

          <div className="preview-section">
            <h3>Preview (first 5 rows)</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx}>
                      {columns.map((col) => (
                        <td key={col}>{row[col]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="button-group">
            <button className="btn-secondary" onClick={handleReset}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleValidateMapping}
              disabled={processing || !columnMapping.email || !columnMapping.firstName || !columnMapping.lastName}
            >
              {processing ? 'Validating...' : 'Validate and Continue'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review and Import */}
      {step === 3 && validation && (
        <div className="step-content">
          <h2>Step 3: Review and Import</h2>

          <div className="validation-summary">
            <h3>Validation Results</h3>
            <div className="validation-stats">
              <div className="stat">
                <div className="stat-value">{validation.totalRows}</div>
                <div className="stat-label">Total Rows</div>
              </div>
              <div className="stat success">
                <div className="stat-value">{validation.validRows}</div>
                <div className="stat-label">Valid</div>
              </div>
              <div className="stat error">
                <div className="stat-value">{validation.errorRows}</div>
                <div className="stat-label">Errors</div>
              </div>
            </div>
          </div>

          {validation.errors && validation.errors.length > 0 && (
            <div className="validation-errors">
              <h3>Validation Errors</h3>
              <p>The following rows have errors{settings.skipDuplicates ? ' (they will be skipped)' : ''}:</p>
              <div className="errors-list">
                {validation.errors.slice(0, 10).map((err, idx) => (
                  <div key={idx} className="error-item">
                    <strong>Row {err.row}</strong>
                    {err.email && <span> ({err.email})</span>}
                    <ul>
                      {err.errors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                {validation.errors.length > 10 && (
                  <p className="more-errors">
                    ...and {validation.errors.length - 10} more errors
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="import-summary">
            <h3>Import Summary</h3>
            <ul>
              <li>{validation.validRows} users will be created</li>
              {settings.sendInvitations && (
                <li>{validation.validRows} invitation emails will be sent</li>
              )}
              {validation.errorRows > 0 && settings.skipDuplicates && (
                <li>{validation.errorRows} rows will be skipped due to errors</li>
              )}
            </ul>
          </div>

          <div className="button-group">
            <button className="btn-secondary" onClick={handleReset}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleProcessImport}
              disabled={processing || (!validation.valid && !settings.skipDuplicates)}
            >
              {processing ? 'Starting Import...' : `Import ${validation.validRows} Users`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImportPage;
