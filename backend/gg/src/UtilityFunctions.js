/**
 * Utility functions used across the application
 * Common helper functions for data processing, validation, and responses
 * @requires types/TypeDefinitions.js - For type definitions
 * @created 2025-09-27 (refactored)
 * @moved 2025-10-03 (to utils/ directory for MVC structure)
 */

// ==========================================
// UUID and Identification Utilities
// ==========================================

/**
 * Generate a UUID v4 (Universally Unique Identifier)
 * @returns {string} A UUID string in format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
function createUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ==========================================
// Response and Data Processing Utilities
// ==========================================

/**
 * Create standardized JSON response following APIResponse structure
 * @param {string} status - Response status ('success', 'error', or 'partial')
 * @param {string} message - Human-readable response message
 * @param {Object} [data={}] - Additional data to include in response
 * @returns {APIResponse} Formatted response object with consistent structure
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
 * Convert Google Sheets 2D array data to JSON array of objects
 * @param {Array<Array>} values - 2D array from sheet.getValues()
 * @param {string[]} headers - Array of header names to use as object keys
 * @returns {Object[]} Array of objects with header names as keys
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

// ==========================================
// Validation Utilities
// ==========================================

/**
 * Validate that all required parameters are present and not empty
 * @param {Object} params - Parameters object to validate
 * @param {string[]} required - Array of required parameter names
 * @returns {ValidationResult} Validation result with isValid flag and missing array
 */
function validateRequiredParams(params, required) {
  const missing = required.filter(param => !params[param] && params[param] !== 0);
  return {
    isValid: missing.length === 0,
    missing: missing
  };
}

// ==========================================
// Number Parsing and Formatting Utilities
// ==========================================

/**
 * Safe float parsing with default value fallback
 * @param {any} value - Value to parse (string, number, or other)
 * @param {number} [defaultValue=0] - Default value if parsing fails
 * @returns {number} Parsed float or default value
 */
function safeParseFloat(value, defaultValue = 0) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safe integer parsing with default value fallback
 * @param {any} value - Value to parse (string, number, or other)
 * @param {number} [defaultValue=0] - Default value if parsing fails
 * @returns {number} Parsed integer or default value
 */
function safeParseInt(value, defaultValue = 0) {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Format number to specified decimal places
 * @param {number} number - Number to format
 * @param {number} [decimals=CONFIG.DEFAULTS.DECIMAL_PLACES] - Number of decimal places
 * @returns {string} Formatted number string with fixed decimal places
 */
function formatNumber(number, decimals = CONFIG.DEFAULTS.DECIMAL_PLACES) {
  return parseFloat(number).toFixed(decimals);
}

// ==========================================
// Date and Time Utilities
// ==========================================

/**
 * Format date to Thai locale string with full date and time
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string in Thai locale
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

// ==========================================
// Logging and Error Handling Utilities
// ==========================================

/**
 * Log error with comprehensive context information for debugging
 * @param {string} functionName - Name of the function where error occurred
 * @param {Error} error - Error object with message and stack trace
 * @param {Object} [context={}] - Additional context information (parameters, state, etc.)
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

// ==========================================
// String Processing and Security Utilities
// ==========================================

/**
 * Sanitize string input to prevent formatting issues and security problems
 * @param {any} input - Input value to sanitize (will be converted to string)
 * @returns {string} Sanitized string with trimmed whitespace and normalized line breaks
 */
function sanitizeString(input) {
  if (typeof input !== 'string') {
    return String(input || '');
  }
  
  return input.trim().replace(/[\r\n\t]/g, ' ');
}

/**
 * Check if a value is considered empty for validation purposes
 * @param {any} value - Value to check for emptiness
 * @returns {boolean} True if value is null, undefined, empty string, or whitespace-only string
 */
function isEmpty(value) {
  return value === null || 
         value === undefined || 
         (typeof value === 'string' && value.trim() === '');
}

/**
 * Get current timestamp in ISO 8601 format
 * @returns {string} ISO timestamp string (e.g., "2025-09-27T10:30:45.123Z")
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Get current date in YYYY-MM-DD format (ISO date format)
 * @returns {string} Date string in YYYY-MM-DD format (e.g., "2025-09-27")
 */
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ==========================================
// Mathematical Utilities
// ==========================================

/**
 * Calculate percentage change between two values
 * @param {number} oldValue - Original/previous value
 * @param {number} newValue - New/current value
 * @returns {number} Percentage change (positive for increase, negative for decrease)
 */
function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

// ==========================================
// HTTP Response Utilities (MVC Addition)
// ==========================================

/**
 * Create ContentService JSON response for Google Apps Script
 * @param {Object} responseData - Response data object
 * @returns {GoogleAppsScript.Content.TextOutput} ContentService response
 */
function createContentServiceResponse(responseData) {
  return ContentService.createTextOutput(JSON.stringify(responseData))
                      .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Parse request parameters from various sources (GET/POST)
 * @param {Object} event - Google Apps Script event object
 * @param {string} paramName - Parameter name to extract
 * @returns {string|null} Parameter value or null if not found
 */
function getRequestParam(event, paramName) {
  // Check POST form data first (e.parameters)
  if (event.parameters && event.parameters[paramName]) {
    return event.parameters[paramName][0]; // Form data comes as arrays
  }
  
  // Check URL parameters (e.parameter)
  if (event.parameter && event.parameter[paramName]) {
    return event.parameter[paramName];
  }
  
  return null;
}

/**
 * Extract all parameters from request event
 * @param {Object} event - Google Apps Script event object
 * @returns {Object} Object containing all parameters
 */
function getAllRequestParams(event) {
  const params = {};
  
  // Get URL parameters
  if (event.parameter) {
    Object.assign(params, event.parameter);
  }
  
  // Get form data parameters (override URL params if present)
  if (event.parameters) {
    for (const key in event.parameters) {
      params[key] = event.parameters[key][0]; // Take first value from array
    }
  }
  
  return params;
}

// ==========================================
// Array and Object Utilities (MVC Addition)
// ==========================================

/**
 * Deep clone an object (simple implementation for basic objects)
 * @param {Object} obj - Object to clone
 * @returns {Object} Deep cloned object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Check if object has all required properties
 * @param {Object} obj - Object to check
 * @param {string[]} requiredProps - Array of required property names
 * @returns {boolean} True if all required properties exist
 */
function hasRequiredProperties(obj, requiredProps) {
  if (!obj || typeof obj !== 'object') return false;
  return requiredProps.every(prop => obj.hasOwnProperty(prop) && obj[prop] !== undefined);
}

/**
 * Remove undefined/null properties from object
 * @param {Object} obj - Object to clean
 * @returns {Object} Object with undefined/null properties removed
 */
function removeEmptyProperties(obj) {
  const cleaned = {};
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}