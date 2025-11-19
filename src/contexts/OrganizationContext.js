import React, { createContext, useState, useContext, useEffect } from 'react';

const OrganizationContext = createContext();

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

// Default organization branding
const DEFAULT_BRANDING = {
  id: 'default-org',
  name: 'Teen Sunday School',
  logo: null,
  colors: {
    primary: '#4A90E2',
    secondary: '#50C878',
    accent: '#FF6B6B'
  },
  backgroundImage: null,
  themeOptions: {
    headerStyle: 'default', // default, minimal, full-width
    showLogoInHeader: true,
    showNameInHeader: true
  }
};

export const OrganizationProvider = ({ children }) => {
  const [organization, setOrganization] = useState(() => {
    try {
      const saved = localStorage.getItem('organization-branding');
      return saved ? JSON.parse(saved) : DEFAULT_BRANDING;
    } catch (error) {
      console.error('Error loading organization branding:', error);
      return DEFAULT_BRANDING;
    }
  });

  // Apply custom colors to CSS variables whenever organization changes
  useEffect(() => {
    if (organization?.colors) {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', organization.colors.primary);
      root.style.setProperty('--secondary-color', organization.colors.secondary);
      root.style.setProperty('--accent-color', organization.colors.accent);
    }
  }, [organization]);

  // Save organization branding to localStorage
  const saveOrganization = (updatedOrg) => {
    try {
      const orgToSave = { ...organization, ...updatedOrg };
      localStorage.setItem('organization-branding', JSON.stringify(orgToSave));
      setOrganization(orgToSave);
      return { success: true };
    } catch (error) {
      console.error('Error saving organization branding:', error);
      return { success: false, error: error.message };
    }
  };

  // Update organization name
  const updateName = (name) => {
    return saveOrganization({ name });
  };

  // Update organization logo (accepts file or base64 string)
  const updateLogo = async (logoFile) => {
    if (!logoFile) {
      return saveOrganization({ logo: null });
    }

    // If it's already a string (base64), save it directly
    if (typeof logoFile === 'string') {
      return saveOrganization({ logo: logoFile });
    }

    // If it's a File object, convert to base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = saveOrganization({ logo: reader.result });
        resolve(result);
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read logo file' });
      };
      reader.readAsDataURL(logoFile);
    });
  };

  // Update organization colors
  const updateColors = (colors) => {
    return saveOrganization({ colors: { ...organization.colors, ...colors } });
  };

  // Update background image
  const updateBackgroundImage = async (imageFile) => {
    if (!imageFile) {
      return saveOrganization({ backgroundImage: null });
    }

    // If it's already a string (base64), save it directly
    if (typeof imageFile === 'string') {
      return saveOrganization({ backgroundImage: imageFile });
    }

    // If it's a File object, convert to base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = saveOrganization({ backgroundImage: reader.result });
        resolve(result);
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read background image' });
      };
      reader.readAsDataURL(imageFile);
    });
  };

  // Update theme options
  const updateThemeOptions = (options) => {
    return saveOrganization({
      themeOptions: { ...organization.themeOptions, ...options }
    });
  };

  // Reset to default branding
  const resetToDefault = () => {
    localStorage.removeItem('organization-branding');
    setOrganization(DEFAULT_BRANDING);
    return { success: true };
  };

  const value = {
    organization,
    updateName,
    updateLogo,
    updateColors,
    updateBackgroundImage,
    updateThemeOptions,
    resetToDefault,
    saveOrganization
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
