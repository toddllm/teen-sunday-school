import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuditLogContext = createContext();

export const useAuditLog = () => {
  const context = useContext(AuditLogContext);
  if (!context) {
    throw new Error('useAuditLog must be used within an AuditLogProvider');
  }
  return context;
};

// Action types enumeration
export const AuditActionType = {
  LESSON_CREATED: 'LESSON_CREATED',
  LESSON_UPDATED: 'LESSON_UPDATED',
  LESSON_DELETED: 'LESSON_DELETED',
  LESSON_DUPLICATED: 'LESSON_DUPLICATED',
  GAME_ADDED: 'GAME_ADDED',
  GAME_UPDATED: 'GAME_UPDATED',
  GAME_DELETED: 'GAME_DELETED',
  CONTEXT_CARD_CREATED: 'CONTEXT_CARD_CREATED',
  CONTEXT_CARD_UPDATED: 'CONTEXT_CARD_UPDATED',
  CONTEXT_CARD_DELETED: 'CONTEXT_CARD_DELETED',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED'
};

// Entity types enumeration
export const EntityType = {
  LESSON: 'LESSON',
  GAME: 'GAME',
  CONTEXT_CARD: 'CONTEXT_CARD',
  SETTINGS: 'SETTINGS'
};

export const AuditLogProvider = ({ children }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load audit logs from localStorage on mount
  useEffect(() => {
    const storedLogs = localStorage.getItem('sunday-school-audit-logs');
    if (storedLogs) {
      try {
        setAuditLogs(JSON.parse(storedLogs));
      } catch (error) {
        console.error('Error loading audit logs:', error);
        setAuditLogs([]);
      }
    }
    setLoading(false);
  }, []);

  // Save audit logs to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('sunday-school-audit-logs', JSON.stringify(auditLogs));
    }
  }, [auditLogs, loading]);

  // Add a new audit log entry
  const addAuditLog = useCallback((actionType, entityType, entityId, metadata = {}) => {
    // Don't log sensitive data
    const sanitizedMetadata = { ...metadata };
    delete sanitizedMetadata.password;
    delete sanitizedMetadata.token;
    delete sanitizedMetadata.apiKey;

    const newLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      // In a real implementation, this would be the authenticated user
      // For now, we'll use 'system' or 'admin' as placeholder
      actorUserId: metadata.actorUserId || 'admin',
      actionType,
      entityType,
      entityId,
      metadata: sanitizedMetadata,
      createdAt: new Date().toISOString()
    };

    setAuditLogs(prevLogs => [newLog, ...prevLogs]);
    return newLog.id;
  }, []);

  // Get logs with filtering and pagination
  const getAuditLogs = useCallback((options = {}) => {
    const {
      actionType,
      entityType,
      actorUserId,
      startDate,
      endDate,
      page = 1,
      pageSize = 50,
      entityId
    } = options;

    let filteredLogs = [...auditLogs];

    // Apply filters
    if (actionType) {
      filteredLogs = filteredLogs.filter(log => log.actionType === actionType);
    }

    if (entityType) {
      filteredLogs = filteredLogs.filter(log => log.entityType === entityType);
    }

    if (actorUserId) {
      filteredLogs = filteredLogs.filter(log => log.actorUserId === actorUserId);
    }

    if (entityId) {
      filteredLogs = filteredLogs.filter(log => log.entityId === entityId);
    }

    if (startDate) {
      filteredLogs = filteredLogs.filter(log =>
        new Date(log.createdAt) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredLogs = filteredLogs.filter(log =>
        new Date(log.createdAt) <= new Date(endDate)
      );
    }

    // Calculate pagination
    const totalLogs = filteredLogs.length;
    const totalPages = Math.ceil(totalLogs / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    return {
      logs: paginatedLogs,
      pagination: {
        page,
        pageSize,
        totalLogs,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  }, [auditLogs]);

  // Get a single log by ID
  const getLogById = useCallback((id) => {
    return auditLogs.find(log => log.id === id);
  }, [auditLogs]);

  // Get all logs for a specific entity
  const getLogsForEntity = useCallback((entityType, entityId) => {
    return auditLogs.filter(
      log => log.entityType === entityType && log.entityId === entityId
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [auditLogs]);

  // Get unique actors for filtering
  const getUniqueActors = useCallback(() => {
    const actors = new Set(auditLogs.map(log => log.actorUserId));
    return Array.from(actors);
  }, [auditLogs]);

  // Clear old logs (for maintenance, keep last 1000 entries or 90 days)
  const pruneOldLogs = useCallback(() => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    let prunedLogs = auditLogs.filter(log =>
      new Date(log.createdAt) >= ninetyDaysAgo
    );

    // Also keep only the most recent 1000 logs
    if (prunedLogs.length > 1000) {
      prunedLogs = prunedLogs.slice(0, 1000);
    }

    setAuditLogs(prunedLogs);
    return auditLogs.length - prunedLogs.length; // Return number of logs pruned
  }, [auditLogs]);

  const value = {
    auditLogs,
    loading,
    addAuditLog,
    getAuditLogs,
    getLogById,
    getLogsForEntity,
    getUniqueActors,
    pruneOldLogs
  };

  return (
    <AuditLogContext.Provider value={value}>
      {children}
    </AuditLogContext.Provider>
  );
};
