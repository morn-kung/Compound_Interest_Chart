/**
 * Utility functions used across the application
 * Common helper functions for data processing, validation, and responses
 */

/**
 * Generate a UUID v4
 * @returns {string} A UUID string
 */
function createUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Create standardized JSON response
 * @param {string} status - Response status ('success' or 'error')
 * @param {string} message - Response message
 * @param {Object} data - Additional data to include
 * @returns {Object} Formatted response object
 */
function createJSONResponse(status, message, data = {}) {
  const response = {
    status: status,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  // Merge additional data
  return Object.assign(response, data);
}

/**
 * Convert sheet data to JSON array
 * @param {Array} values - 2D array from sheet.getValues()
 * @param {Array} headers - Array of header names
 * @returns {Array} Array of objects with header keys
 */
function convertSheetDataToJSON(values, headers) {
  if (!values || values.length <= 1) {
    return [];
  }
  
  // Skip header row and convert to objects
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}

/**
 * Validate required parameters
 * @param {Object} params - Parameters object
 * @param {Array} required - Array of required parameter names
 * @returns {Object} Validation result {isValid: boolean, missing: Array}
 */
function validateRequiredParams(params, required) {
  const missing = required.filter(param => !params[param] && params[param] !== 0);
  return {
    isValid: missing.length === 0,
    missing: missing
  };
}

/**
 * Safe float parsing with default value
 * @param {any} value - Value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} Parsed float or default value
 */
function safeParseFloat(value, defaultValue = 0) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safe integer parsing with default value
 * @param {any} value - Value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} Parsed integer or default value
 */
function safeParseInt(value, defaultValue = 0) {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Format number to specified decimal places
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
function formatNumber(number, decimals = CONFIG.DEFAULTS.DECIMAL_PLACES) {
  return parseFloat(number).toFixed(decimals);
}

/**
 * Format date to Thai locale string
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
function formatThaiDate(date) {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Log error with context information
 * @param {string} functionName - Name of the function where error occurred
 * @param {Error} error - Error object
 * @param {Object} context - Additional context information
 */
function logError(functionName, error, context = {}) {
  const errorInfo = {
    function: functionName,
    error: error.toString(),
    stack: error.stack,
    context: context,
    timestamp: new Date().toISOString()
  };
  
  console.error('Error logged:', errorInfo);
}

/**
 * Sanitize string input to prevent issues
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(input) {
  if (typeof input !== 'string') {
    return String(input || '');
  }
  
  return input.trim().replace(/[\r\n\t]/g, ' ');
}

/**
 * Check if a value is empty (null, undefined, empty string, or whitespace)
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
function isEmpty(value) {
  return value === null || 
         value === undefined || 
         (typeof value === 'string' && value.trim() === '');
}

/**
 * Get current timestamp in ISO format
 * @returns {string} ISO timestamp string
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} Date string in YYYY-MM-DD format
 */
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate percentage change
 * @param {number} oldValue - Original value
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}