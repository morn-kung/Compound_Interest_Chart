/**
 * BaseController - Foundation class for all controllers
 * Provides common functionality for request handling and validation
 * @created 2025-10-03
 */

/**
 * Base Controller Class
 * Provides common functionality for all controllers
 */
class BaseController {
  
  /**
   * Extract parameter from GET/POST request
   * Handles both e.parameter and e.parameters formats
   * @param {Object} requestEvent - doGet or doPost event object
   * @param {string} paramName - Parameter name to extract
   * @returns {*} Parameter value or null
   */
  static getParam(requestEvent, paramName) {
    // Handle POST form data (comes as arrays)
    if (requestEvent.parameters && requestEvent.parameters[paramName]) {
      return requestEvent.parameters[paramName][0];
    }
    
    // Handle URL parameters
    if (requestEvent.parameter && requestEvent.parameter[paramName]) {
      return requestEvent.parameter[paramName];
    }
    
    return null;
  }
  
  /**
   * Extract all parameters from request
   * @param {Object} requestEvent - doGet or doPost event object
   * @returns {Object} Object containing all parameters
   */
  static getAllParams(requestEvent) {
    const params = {};
    
    // Extract from e.parameters (POST form data)
    if (requestEvent.parameters) {
      Object.keys(requestEvent.parameters).forEach(key => {
        params[key] = requestEvent.parameters[key][0]; // Take first value
      });
    }
    
    // Extract from e.parameter (URL params)
    if (requestEvent.parameter) {
      Object.keys(requestEvent.parameter).forEach(key => {
        if (!params[key]) { // Don't overwrite form data
          params[key] = requestEvent.parameter[key];
        }
      });
    }
    
    return params;
  }
  
  /**
   * Validate required parameters
   * @param {Object} params - Parameters object
   * @param {Array<string>} requiredParams - Array of required parameter names
   * @returns {Object} Validation result { isValid: boolean, missing: Array }
   */
  static validateRequiredParams(params, requiredParams) {
    const missing = [];
    
    requiredParams.forEach(param => {
      if (!params[param] || params[param] === '') {
        missing.push(param);
      }
    });
    
    return {
      isValid: missing.length === 0,
      missing: missing
    };
  }
  
  /**
   * Handle authentication requirement
   * @param {Object} params - Request parameters
   * @returns {Object} Authentication result
   */
  static authenticate(params) {
    return authenticateRequest(params); // Uses existing auth service
  }
  
  /**
   * Check if endpoint is public (doesn't require authentication)
   * @param {string} action - Action name
   * @returns {boolean} True if public endpoint
   */
  static isPublicEndpoint(action) {
    const publicEndpoints = [
      'login',
      'getAccounts',
      'getAssets',
      'resetPassword'
    ];
    
    return publicEndpoints.includes(action);
  }
  
  /**
   * Log controller action for debugging
   * @param {string} controllerName - Name of the controller
   * @param {string} action - Action being performed
   * @param {Object} params - Request parameters (sensitive data will be masked)
   */
  static logAction(controllerName, action, params) {
    const sanitizedParams = { ...params };
    
    // Mask sensitive data
    if (sanitizedParams.password) sanitizedParams.password = '[HIDDEN]';
    if (sanitizedParams.token) sanitizedParams.token = '[HIDDEN]';
    
    console.log(`🎮 ${controllerName}.${action}:`, sanitizedParams);
  }
  
  /**
   * Handle controller errors consistently
   * @param {Error} error - Error object
   * @param {string} context - Context where error occurred
   * @returns {GoogleAppsScript.Content.TextOutput} Error response
   */
  static handleError(error, context) {
    console.error(`❌ Controller Error in ${context}:`, error);
    return ApiResponse.error(
      'Internal server error', 
      'CONTROLLER_ERROR',
      { context: context, message: error.message }
    );
  }
  
  /**
   * Parse JSON safely
   * @param {string} jsonString - JSON string to parse
   * @returns {Object|null} Parsed object or null if invalid
   */
  static parseJSON(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('JSON parsing error:', error);
      return null;
    }
  }
  
  /**
   * Validate numeric parameter
   * @param {*} value - Value to validate
   * @param {string} paramName - Parameter name for error messages
   * @returns {Object} { isValid: boolean, numericValue: number, error: string }
   */
  static validateNumeric(value, paramName) {
    const numericValue = parseFloat(value);
    
    if (isNaN(numericValue)) {
      return {
        isValid: false,
        numericValue: null,
        error: `${paramName} must be a valid number`
      };
    }
    
    return {
      isValid: true,
      numericValue: numericValue,
      error: null
    };
  }
}