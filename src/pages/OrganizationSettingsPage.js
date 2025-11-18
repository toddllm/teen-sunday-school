import React, { useState, useRef } from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import Navigation from '../components/Navigation';
import './OrganizationSettingsPage.css';

const OrganizationSettingsPage = () => {
  const {
    organization,
    updateName,
    updateLogo,
    updateColors,
    updateBackgroundImage,
    updateThemeOptions,
    resetToDefault
  } = useOrganization();

  const [formData, setFormData] = useState({
    name: organization.name,
    primary: organization.colors.primary,
    secondary: organization.colors.secondary,
    accent: organization.colors.accent
  });

  const [previewLogo, setPreviewLogo] = useState(organization.logo);
  const [previewBg, setPreviewBg] = useState(organization.backgroundImage);
  const [saveMessage, setSaveMessage] = useState('');
  const [themeOptions, setThemeOptions] = useState(organization.themeOptions);

  const logoInputRef = useRef(null);
  const bgInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG)');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewLogo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Background image file size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG)');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewBg(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleThemeOptionChange = (option, value) => {
    setThemeOptions(prev => ({ ...prev, [option]: value }));
  };

  const handleSave = async () => {
    try {
      // Save name
      const nameResult = updateName(formData.name);
      if (!nameResult.success) {
        throw new Error('Failed to save organization name');
      }

      // Save colors
      const colorsResult = updateColors({
        primary: formData.primary,
        secondary: formData.secondary,
        accent: formData.accent
      });
      if (!colorsResult.success) {
        throw new Error('Failed to save colors');
      }

      // Save logo if changed
      if (previewLogo !== organization.logo) {
        const logoResult = await updateLogo(previewLogo);
        if (!logoResult.success) {
          throw new Error('Failed to save logo');
        }
      }

      // Save background if changed
      if (previewBg !== organization.backgroundImage) {
        const bgResult = await updateBackgroundImage(previewBg);
        if (!bgResult.success) {
          throw new Error('Failed to save background image');
        }
      }

      // Save theme options
      const themeResult = updateThemeOptions(themeOptions);
      if (!themeResult.success) {
        throw new Error('Failed to save theme options');
      }

      setSaveMessage('Branding saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage(`Error: ${error.message}`);
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default branding? This cannot be undone.')) {
      resetToDefault();
      setFormData({
        name: 'Teen Sunday School',
        primary: '#4A90E2',
        secondary: '#50C878',
        accent: '#FF6B6B'
      });
      setPreviewLogo(null);
      setPreviewBg(null);
      setThemeOptions({
        headerStyle: 'default',
        showLogoInHeader: true,
        showNameInHeader: true
      });
      setSaveMessage('Reset to default branding');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleRemoveLogo = () => {
    setPreviewLogo(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleRemoveBackground = () => {
    setPreviewBg(null);
    if (bgInputRef.current) {
      bgInputRef.current.value = '';
    }
  };

  return (
    <div className="organization-settings-page">
      <Navigation />
      <div className="settings-container">
        <div className="settings-header">
          <h1>Organization Branding</h1>
          <p>Customize your organization's appearance in the app</p>
        </div>

        {saveMessage && (
          <div className={`save-message ${saveMessage.startsWith('Error') ? 'error' : 'success'}`}>
            {saveMessage}
          </div>
        )}

        <div className="settings-content">
          <div className="settings-form">
            {/* Organization Name */}
            <div className="form-section">
              <h2>Organization Name</h2>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="name-input"
                placeholder="Enter organization name"
                maxLength={50}
              />
            </div>

            {/* Logo Upload */}
            <div className="form-section">
              <h2>Logo</h2>
              <p className="help-text">Recommended: Square image, max 2MB (PNG, JPG, SVG)</p>
              <div className="logo-upload-section">
                {previewLogo && (
                  <div className="logo-preview">
                    <img src={previewLogo} alt="Logo preview" />
                    <button onClick={handleRemoveLogo} className="remove-btn">Remove Logo</button>
                  </div>
                )}
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="file-input"
                />
              </div>
            </div>

            {/* Color Customization */}
            <div className="form-section">
              <h2>Brand Colors</h2>
              <div className="color-inputs">
                <div className="color-input-group">
                  <label htmlFor="primary">Primary Color</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      id="primary"
                      name="primary"
                      value={formData.primary}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      value={formData.primary}
                      onChange={handleInputChange}
                      name="primary"
                      className="color-text"
                      placeholder="#4A90E2"
                    />
                  </div>
                </div>

                <div className="color-input-group">
                  <label htmlFor="secondary">Secondary Color</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      id="secondary"
                      name="secondary"
                      value={formData.secondary}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      value={formData.secondary}
                      onChange={handleInputChange}
                      name="secondary"
                      className="color-text"
                      placeholder="#50C878"
                    />
                  </div>
                </div>

                <div className="color-input-group">
                  <label htmlFor="accent">Accent Color</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      id="accent"
                      name="accent"
                      value={formData.accent}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      value={formData.accent}
                      onChange={handleInputChange}
                      name="accent"
                      className="color-text"
                      placeholder="#FF6B6B"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Background Image */}
            <div className="form-section">
              <h2>Background Image (Optional)</h2>
              <p className="help-text">Hero section background, max 5MB</p>
              <div className="background-upload-section">
                {previewBg && (
                  <div className="background-preview">
                    <img src={previewBg} alt="Background preview" />
                    <button onClick={handleRemoveBackground} className="remove-btn">Remove Background</button>
                  </div>
                )}
                <input
                  type="file"
                  ref={bgInputRef}
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="file-input"
                />
              </div>
            </div>

            {/* Theme Options */}
            <div className="form-section">
              <h2>Display Options</h2>
              <div className="theme-options">
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={themeOptions.showLogoInHeader}
                      onChange={(e) => handleThemeOptionChange('showLogoInHeader', e.target.checked)}
                    />
                    Show logo in header
                  </label>
                </div>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={themeOptions.showNameInHeader}
                      onChange={(e) => handleThemeOptionChange('showNameInHeader', e.target.checked)}
                    />
                    Show organization name in header
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button onClick={handleSave} className="save-btn">
                Save Branding
              </button>
              <button onClick={handleReset} className="reset-btn">
                Reset to Default
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="preview-section">
            <h2>Preview</h2>
            <div className="preview-container">
              <div className="preview-header" style={{ backgroundColor: formData.primary }}>
                {previewLogo && themeOptions.showLogoInHeader && (
                  <img src={previewLogo} alt="Logo" className="preview-logo" />
                )}
                {themeOptions.showNameInHeader && (
                  <span className="preview-name">{formData.name}</span>
                )}
              </div>
              <div className="preview-content">
                <h3 style={{ color: formData.primary }}>Sample Heading</h3>
                <p>This is how your branding will appear in the app.</p>
                <button style={{ backgroundColor: formData.secondary }} className="preview-button">
                  Sample Button
                </button>
                <div className="preview-badges">
                  <span style={{ backgroundColor: formData.accent }} className="preview-badge">
                    Badge
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettingsPage;
