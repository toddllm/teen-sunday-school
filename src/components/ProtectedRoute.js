import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOrganizations } from '../contexts/OrganizationContext';

/**
 * ProtectedRoute component for role-based access control
 *
 * @param {Object} props
 * @param {React.Component} props.children - Component to render if authorized
 * @param {string} props.requiredRole - Required role (org_admin, group_leader, member)
 * @param {string} props.orgId - Organization ID to check role against
 * @param {string} props.redirectTo - Path to redirect if not authorized (default: '/')
 */
const ProtectedRoute = ({
  children,
  requiredRole = null,
  orgId = null,
  requireAuth = true,
  redirectTo = '/'
}) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { getUserRole, ROLES } = useOrganizations();

  // Check if user is logged in
  if (requireAuth && !isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // If no role is required, just check authentication
  if (!requiredRole) {
    return children;
  }

  // Check if user has required role in organization
  if (orgId && currentUser) {
    const userRole = getUserRole(orgId, currentUser.id);

    // Check if user has the required role or higher privilege
    if (requiredRole === ROLES.MEMBER) {
      // Any role is sufficient for member access
      if (userRole) {
        return children;
      }
    } else if (requiredRole === ROLES.GROUP_LEADER) {
      // Group leader or org admin
      if (userRole === ROLES.GROUP_LEADER || userRole === ROLES.ORG_ADMIN) {
        return children;
      }
    } else if (requiredRole === ROLES.ORG_ADMIN) {
      // Only org admin
      if (userRole === ROLES.ORG_ADMIN) {
        return children;
      }
    }
  }

  // User doesn't have required permissions
  return <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;
