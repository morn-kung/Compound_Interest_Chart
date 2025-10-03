/**
 * Validation Layer - Centralized validation functions
 * Provides comprehensive validation functions for data integrity and business rules
 * @requires types/TypeDefinitions.js - For type definitions
 * @requires Config.js - For configuration constants
 * @created 2025-09-27
 * @moved 2025-10-03 (to validators/ directory for MVC structure)
 */

// ==========================================
// Core Validation Functions
// ==========================================

/**
 * Validate that all required parameters are present and not empty
 * @param {Object} params - Parameters object to validate
 * @param {string[]} required - Array of required parameter names
 * @returns {ValidationResult} Validation result with isValid flag and missing array
 */
function validateRequiredParams(params, required) {
  const missing = required.filter(param => {
    const value = params[param];
    return value === undefined || value === null || value === '';
  });
  
  return {
    isValid: missing.length === 0,
    missing: missing,
    message: missing.length > 0 ? `Missing required parameters: ${missing.join(', ')}` : 'All required parameters present'
  };
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if date format is valid
 */
function isValidDateFormat(dateString) {
  if (!dateString || typeof dateString !== 'string') return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  // Check if it's a valid date
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && date.toISOString().slice(0, 10) === dateString;
}

/**
 * Validate numeric value is positive
 * @param {any} value - Value to validate
 * @returns {boolean} True if value is a positive number
 */
function isPositiveNumber(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

/**
 * Validate numeric value is non-negative
 * @param {any} value - Value to validate
 * @returns {boolean} True if value is a non-negative number
 */
function isNonNegativeNumber(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
}

// ==========================================
// Trade Data Validation
// ==========================================

/**
 * Validate TradeData object for completeness and business rules
 * @param {Object} tradeData - Trade data to validate
 * @returns {ValidationResult} Validation result with details
 */
function validateTradeData(tradeData) {
  const errors = [];
  
  // Check required fields
  if (!tradeData.account_id) errors.push('account_id is required');
  if (!tradeData.asset) errors.push('asset is required');
  if (!tradeData.action) errors.push('action is required');
  if (tradeData.amount === undefined || tradeData.amount === null) {
    errors.push('amount is required');
  }
  if (tradeData.price === undefined || tradeData.price === null) {
    errors.push('price is required');
  }
  
  // Business rule validations
  if (tradeData.amount !== undefined && !isPositiveNumber(tradeData.amount)) {
    errors.push('amount must be a positive number');
  }
  
  if (tradeData.price !== undefined && !isPositiveNumber(tradeData.price)) {
    errors.push('price must be a positive number');
  }
  
  // Action validation
  if (tradeData.action && !['BUY', 'SELL'].includes(tradeData.action.toUpperCase())) {
    errors.push('action must be BUY or SELL');
  }
  
  // Date format validation
  if (tradeData.trade_date && !isValidDateFormat(tradeData.trade_date)) {
    errors.push('trade_date must be in YYYY-MM-DD format');
  }
  
  return {
    isValid: errors.length === 0,
    missing: errors,
    message: errors.length > 0 ? errors.join('; ') : 'Trade data is valid'
  };
}

/**
 * Validate array of TradeData objects for batch operations
 * @param {Object[]} tradesArray - Array of trade data to validate
 * @returns {Object} Detailed validation results for each trade
 */
function validateTradeDataArray(tradesArray) {
  if (!Array.isArray(tradesArray)) {
    return {
      isValid: false,
      error: 'Input must be an array',
      results: []
    };
  }
  
  if (tradesArray.length === 0) {
    return {
      isValid: false,
      error: 'Array must contain at least one trade',
      results: []
    };
  }
  
  const results = tradesArray.map((trade, index) => ({
    index: index + 1,
    validation: validateTradeData(trade),
    trade: trade
  }));
  
  const validCount = results.filter(r => r.validation.isValid).length;
  
  return {
    isValid: validCount === tradesArray.length,
    validCount: validCount,
    invalidCount: tradesArray.length - validCount,
    results: results,
    message: `${validCount}/${tradesArray.length} trades are valid`
  };
}

// ==========================================
// User Data Validation
// ==========================================

/**
 * Validate user registration data
 * @param {Object} userData - User data to validate
 * @returns {ValidationResult} Validation result with details
 */
function validateUserData(userData) {
  const errors = [];
  
  // Check required fields
  if (!userData.username) errors.push('username is required');
  if (!userData.password) errors.push('password is required');
  if (!userData.email) errors.push('email is required');
  
  // Validate email format
  if (userData.email && !isValidEmail(userData.email)) {
    errors.push('email format is invalid');
  }
  
  // Password strength validation
  if (userData.password && userData.password.length < 8) {
    errors.push('password must be at least 8 characters long');
  }
  
  // Username validation
  if (userData.username && userData.username.length < 3) {
    errors.push('username must be at least 3 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    missing: errors,
    message: errors.length > 0 ? errors.join('; ') : 'User data is valid'
  };
}

/**
 * Validate password change data
 * @param {Object} passwordData - Password change data to validate
 * @returns {ValidationResult} Validation result with details
 */
function validatePasswordChange(passwordData) {
  const errors = [];
  
  // Check required fields
  if (!passwordData.currentPassword) errors.push('currentPassword is required');
  if (!passwordData.newPassword) errors.push('newPassword is required');
  
  // Password strength validation
  if (passwordData.newPassword && passwordData.newPassword.length < 8) {
    errors.push('new password must be at least 8 characters long');
  }
  
  // Check if new password is different from current
  if (passwordData.currentPassword && passwordData.newPassword && 
      passwordData.currentPassword === passwordData.newPassword) {
    errors.push('new password must be different from current password');
  }
  
  return {
    isValid: errors.length === 0,
    missing: errors,
    message: errors.length > 0 ? errors.join('; ') : 'Password change data is valid'
  };
}

// ==========================================
// Account Data Validation
// ==========================================

/**
 * Validate account creation data
 * @param {Object} accountData - Account data to validate
 * @returns {ValidationResult} Validation result with details
 */
function validateAccountData(accountData) {
  const errors = [];
  
  // Check required fields
  if (!accountData.account_name) errors.push('account_name is required');
  if (!accountData.account_type) errors.push('account_type is required');
  if (!accountData.owner_username) errors.push('owner_username is required');
  
  // Validate account type
  const validTypes = ['TRADING', 'DEMO', 'PAPER'];
  if (accountData.account_type && !validTypes.includes(accountData.account_type.toUpperCase())) {
    errors.push(`account_type must be one of: ${validTypes.join(', ')}`);
  }
  
  // Validate initial balance
  if (accountData.initial_balance !== undefined && !isNonNegativeNumber(accountData.initial_balance)) {
    errors.push('initial_balance must be a non-negative number');
  }
  
  return {
    isValid: errors.length === 0,
    missing: errors,
    message: errors.length > 0 ? errors.join('; ') : 'Account data is valid'
  };
}

// ==========================================
// Asset Data Validation
// ==========================================

/**
 * Validate asset creation data
 * @param {Object} assetData - Asset data to validate
 * @returns {ValidationResult} Validation result with details
 */
function validateAssetData(assetData) {
  const errors = [];
  
  // Check required fields
  if (!assetData.symbol) errors.push('symbol is required');
  if (!assetData.name) errors.push('name is required');
  if (!assetData.category) errors.push('category is required');
  
  // Validate category
  const validCategories = ['STOCK', 'CRYPTO', 'FOREX', 'COMMODITY', 'BOND', 'ETF', 'MUTUAL_FUND'];
  if (assetData.category && !validCategories.includes(assetData.category.toUpperCase())) {
    errors.push(`category must be one of: ${validCategories.join(', ')}`);
  }
  
  // Validate current price
  if (assetData.current_price !== undefined && !isNonNegativeNumber(assetData.current_price)) {
    errors.push('current_price must be a non-negative number');
  }
  
  // Symbol format validation (basic)
  if (assetData.symbol && !/^[A-Z0-9._-]+$/i.test(assetData.symbol)) {
    errors.push('symbol can only contain letters, numbers, dots, underscores, and hyphens');
  }
  
  return {
    isValid: errors.length === 0,
    missing: errors,
    message: errors.length > 0 ? errors.join('; ') : 'Asset data is valid'
  };
}

// ==========================================
// Sheet Validation Functions (Legacy Support)
// ==========================================

/**
 * Validate Google Sheets structure against configuration
 * @param {string} sheetName - Name of sheet to validate
 * @returns {Object} Validation result with sheet status
 */
function validateSheetStructure(sheetName) {
  try {
    const sheet = getSheet(sheetName);
    if (!sheet) {
      return {
        isValid: false,
        exists: false,
        error: `Sheet '${sheetName}' does not exist`
      };
    }
    
    // Get expected headers from config
    const expectedHeaders = getExpectedHeaders(sheetName);
    if (!expectedHeaders) {
      return {
        isValid: false,
        error: `No configuration found for sheet '${sheetName}'`
      };
    }
    
    // Get actual headers
    const actualHeaders = sheet.getRange(1, 1, 1, expectedHeaders.length).getValues()[0];
    
    // Compare headers
    const missingHeaders = expectedHeaders.filter(header => !actualHeaders.includes(header));
    const extraHeaders = actualHeaders.filter(header => expectedHeaders.includes(header));
    
    return {
      isValid: missingHeaders.length === 0,
      exists: true,
      hasValidHeaders: missingHeaders.length === 0,
      missingHeaders: missingHeaders,
      extraHeaders: extraHeaders,
      rowCount: sheet.getLastRow(),
      columnCount: sheet.getLastColumn()
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: `Validation failed: ${error.message}`
    };
  }
}

/**
 * Get expected headers for a sheet from configuration
 * @param {string} sheetName - Name of sheet
 * @returns {string[]|null} Array of expected headers or null if not found
 */
function getExpectedHeaders(sheetName) {
  // This would need to be implemented based on your CONFIG structure
  // For now, return null to indicate no configuration found
  return null;
}

// ==========================================
// Comprehensive Validation Functions
// ==========================================

/**
 * Validate all sheets against their schemas
 * @returns {Object} Comprehensive validation result
 */
function validateAllSheetsAgainstSchemas() {
  try {
    const results = {};
    const sheets = Object.keys(CONFIG.SHEETS);
    
    sheets.forEach(sheetKey => {
      const sheetName = CONFIG.SHEETS[sheetKey];
      results[sheetName] = validateSheetStructure(sheetName);
    });
    
    const allValid = Object.values(results).every(result => result.isValid);
    
    return {
      status: allValid ? 'success' : 'error',
      message: allValid ? 'All sheets are valid' : 'Some sheets have validation errors',
      results: results,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      status: 'error',
      message: 'Sheet validation failed: ' + error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Refresh schemas and validate all sheets
 * @returns {Object} Combined refresh and validation result
 */  
function refreshSchemasAndValidate() {
  try {
    // Refresh schemas first
    const refreshResult = loadSchemasFromSheets();
    
    // Then validate all sheets
    const validationResult = validateAllSheetsAgainstSchemas();
    
    return {
      status: 'success',
      message: 'Schemas refreshed and validation completed',
      refresh: refreshResult,
      validation: validationResult,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      status: 'error', 
      message: 'Refresh and validation failed: ' + error.message,
      timestamp: new Date().toISOString()
    };
  }
}