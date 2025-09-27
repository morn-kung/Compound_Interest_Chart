/**
 * Utility functions for Trading Journal & Compound Calculator
 * Contains helper functions used across the application
 */

/**
 * Generate UUID (Universally Unique Identifier) for Primary Key
 * @returns {string} The generated UUID
 */
function createUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Create standardized JSON response
 * @param {string} status - 'success' or 'error'
 * @param {string} message - Response message
 * @param {Object} data - Additional data to include
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function createJSONResponse(status, message, data = {}) {
  const response = {
    status: status,
    message: message,
    ...data
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Create success response
 * @param {string} message - Success message
 * @param {Object} data - Data to include
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function createSuccessResponse(message, data = {}) {
  return createJSONResponse(CONFIG.DEFAULTS.STATUS_SUCCESS, message, data);
}

/**
 * Create error response
 * @param {string} message - Error message
 * @param {Object} data - Additional error data
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function createErrorResponse(message, data = {}) {
  return createJSONResponse(CONFIG.DEFAULTS.STATUS_ERROR, message, data);
}

/**
 * Convert sheet data to JSON array
 * @param {Array} values - 2D array from sheet.getValues()
 * @returns {Array} Array of objects with headers as keys
 */
function convertSheetDataToJSON(values) {
  if (!values || values.length <= 1) {
    return [];
  }
  
  const headers = values[0];
  const dataRows = values.slice(1);
  const result = [];
  
  dataRows.forEach(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    result.push(obj);
  });
  
  return result;
}

/**
 * Validate required parameters
 * @param {Object} params - Parameters to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} {isValid: boolean, missingFields: Array}
 */
function validateRequiredParams(params, requiredFields) {
  const missingFields = [];
  
  requiredFields.forEach(field => {
    if (!params[field] || params[field].toString().trim() === '') {
      missingFields.push(field);
    }
  });
  
  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields
  };
}

/**
 * Safe parse float with default value
 * @param {any} value - Value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number}
 */
function safeParseFloat(value, defaultValue = 0) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Format number to fixed decimal places
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string}
 */
function formatNumber(value, decimals = 2) {
  return safeParseFloat(value).toFixed(decimals);
}

/**
 * Log error with context
 * @param {string} functionName - Name of the function where error occurred
 * @param {Error} error - Error object
 * @param {Object} context - Additional context data
 */
function logError(functionName, error, context = {}) {
  Logger.log(`Error in ${functionName}: ${error.message}`);
  if (error.stack) {
    Logger.log(`Stack trace: ${error.stack}`);
  }
  if (Object.keys(context).length > 0) {
    Logger.log(`Context: ${JSON.stringify(context)}`);
  }
}

/**
 * Get current timestamp
 * @returns {Date}
 */
function getCurrentTimestamp() {
  return new Date();
}

/**
 * Sort array of objects by date field (newest first)
 * @param {Array} array - Array to sort
 * @param {string} dateField - Name of the date field
 * @returns {Array}
 */
function sortByDateDesc(array, dateField = 'Timestamp') {
  return array.sort((a, b) => {
    const dateA = new Date(a[dateField]);
    const dateB = new Date(b[dateField]);
    return dateB - dateA;
  });
}