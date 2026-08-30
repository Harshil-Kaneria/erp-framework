const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Normalize and sanitize page and limit for offset pagination
 */
function parseOffsetPaginationParams(query = {}) {
  let page = parseInt(query.page, 10) || 1;
  let limit = parseInt(query.limit, 10) || DEFAULT_LIMIT;

  if (page < 1) page = 1;
  if (limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Format offset pagination response metadata
 */
function formatOffsetPaginationResult(rows, count, page, limit) {
  const totalPages = Math.ceil(count / limit) || 1;
  return {
    items: rows,
    pagination: {
      totalItems: count,
      totalPages,
      currentPage: page,
      pageSize: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Encode object payload to base64 cursor string
 */
function encodeCursor(payload) {
  if (!payload) return null;
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

/**
 * Decode base64url cursor string to object payload
 */
function decodeCursor(cursorString) {
  if (!cursorString) return null;
  try {
    const json = Buffer.from(cursorString, 'base64url').toString('utf8');
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
}

/**
 * Parse cursor pagination limit and decoded cursor
 */
function parseCursorPaginationParams(query = {}) {
  let limit = parseInt(query.limit, 10) || DEFAULT_LIMIT;
  if (limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const cursor = query.cursor ? decodeCursor(query.cursor) : null;
  return { limit, cursor };
}

/**
 * Format cursor pagination result based on rows returned (requesting limit + 1 to detect hasNext)
 */
function formatCursorPaginationResult(rows, limit, cursorFields = ['id']) {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;

  let nextCursor = null;
  if (hasMore && items.length > 0) {
    const lastItem = items[items.length - 1];
    const cursorPayload = {};
    for (const field of cursorFields) {
      cursorPayload[field] = lastItem[field];
    }
    nextCursor = encodeCursor(cursorPayload);
  }

  return {
    items,
    pagination: {
      pageSize: items.length,
      limit,
      hasMore,
      nextCursor,
    },
  };
}

module.exports = {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  parseOffsetPaginationParams,
  formatOffsetPaginationResult,
  encodeCursor,
  decodeCursor,
  parseCursorPaginationParams,
  formatCursorPaginationResult,
};
