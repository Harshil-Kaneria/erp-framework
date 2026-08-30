const logger = require('./logger');

/**
 * Log administrative audit event for key ERP operations
 */
async function logAuditEvent({ userId, action, resource, resourceId, details = null, ip = null }) {
  try {
    const auditRecord = {
      userId,
      action,
      resource,
      resourceId: resourceId ? String(resourceId) : null,
      details,
      ip,
      timestamp: new Date(),
    };

    logger.info(`[AUDIT] Action: ${action} on ${resource}:${resourceId || 'N/A'} by User:${userId || 'ANONYMOUS'}`, auditRecord);

    // Save to database asynchronously if AuditLog model is available
    const { AuditLog } = require('../modules/audit-logs/audit-log.model');
    if (AuditLog) {
      await AuditLog.create(auditRecord);
    }
  } catch (error) {
    logger.error('Failed to write audit log record', { error: error.message });
  }
}

module.exports = {
  logAuditEvent,
};
