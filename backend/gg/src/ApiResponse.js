/**
 * ApiResponse - Standardized API Response Handler
 * Provides consistent response format for all API endpoints
 * @created 2025-10-03
 */

/**
 * Standard API Response Class
 * Creates consistent response format across all endpoints
 */
class ApiResponse {
  
  /**
   * Create successful response
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @returns {GoogleAppsScript.Content.TextOutput} JSON response
   */
  static success(data = null, message = 'Success') {
    const response = {
      status: 'success',
      message: message,
      data: data,
      timestamp: new Date().toISOString()
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
                        .setMimeType(ContentService.MimeType.JSON);
  }
  
  /**
   * Create error response
   * @param {string} message - Error message
   * @param {string|null} code - Error code (optional)
   * @param {*} details - Additional error details (optional)
   * @returns {GoogleAppsScript.Content.TextOutput} JSON response
   */
  static error(message, code = null, details = null) {
    const response = {
      status: 'error',
      message: message,
      timestamp: new Date().toISOString()
    };
    
    if (code) response.code = code;
    if (details) response.details = details;
    
    return ContentService.createTextOutput(JSON.stringify(response))
                        .setMimeType(ContentService.MimeType.JSON);
  }
  
  /**
   * Create partial success response (for batch operations)
   * @param {*} data - Response data
   * @param {string} message - Message describing partial success
   * @param {Array} errors - Array of errors that occurred
   * @returns {GoogleAppsScript.Content.TextOutput} JSON response
   */
  static partial(data, message, errors = []) {
    const response = {
      status: 'partial',
      message: message,
      data: data,
      errors: errors,
      timestamp: new Date().toISOString()
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
                        .setMimeType(ContentService.MimeType.JSON);
  }
  
  /**
   * Create validation error response
   * @param {Array} validationErrors - Array of validation error messages
   * @returns {GoogleAppsScript.Content.TextOutput} JSON response
   */
  static validationError(validationErrors) {
    return this.error(
      'Validation failed',
      'VALIDATION_ERROR',
      { errors: validationErrors }
    );
  }
  
  /**
   * Create authentication error response
   * @param {string} message - Auth error message
   * @returns {GoogleAppsScript.Content.TextOutput} JSON response
   */
  static authError(message = 'Authentication failed') {
    return this.error(message, 'AUTH_ERROR');
  }
  
  /**
   * Create authorization error response
   * @param {string} message - Authorization error message
   * @returns {GoogleAppsScript.Content.TextOutput} JSON response
   */
  static forbiddenError(message = 'Access forbidden') {
    return this.error(message, 'FORBIDDEN');
  }
  
  /**
   * Create not found error response
   * @param {string} resource - Resource that was not found
   * @returns {GoogleAppsScript.Content.TextOutput} JSON response
   */
  static notFound(resource = 'Resource') {
    return this.error(`${resource} not found`, 'NOT_FOUND');
  }
}