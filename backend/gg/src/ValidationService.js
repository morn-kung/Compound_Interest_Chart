/**
 * Validation Layer - Centralized validation functions
 * Provides comprehensive validation functions for data integrity and business rules
 * @requires Types.js - For type definitions
 * @requires Config.js - For configuration constants
 * @created 2025-09-27
 */

// ==========================================
// Trade Data Validation
// ==========================================

/**
 * Validate TradeData object for completeness and business rules
 * @param {TradeData} tradeData - Trade data to validate
 * @returns {ValidationResult} Validation result with details
 */
function validateTradeData(tradeData) {
  const errors = [];
  
  // Check required fields
  if (!tradeData.accountId) errors.push('accountId is required');
  if (!tradeData.assetId) errors.push('assetId is required');
  if (tradeData.startBalance === undefined || tradeData.startBalance === null) {
    errors.push('startBalance is required');
  }
  if (tradeData.dailyProfit === undefined || tradeData.dailyProfit === null) {
    errors.push('dailyProfit is required');
  }
  if (tradeData.lotSize === undefined || tradeData.lotSize === null) {
    errors.push('lotSize is required');
  }
  
  // Business rule validations
  if (tradeData.startBalance !== undefined && tradeData.startBalance <= 0) {
    errors.push('startBalance must be greater than 0');
  }
  
  if (tradeData.lotSize !== undefined && tradeData.lotSize <= 0) {
    errors.push('lotSize must be greater than 0');
  }
  
  // Date format validation
  if (tradeData.tradeDate && !isValidDateFormat(tradeData.tradeDate)) {
    errors.push('tradeDate must be in YYYY-MM-DD format');
  }
  
  return {
    isValid: errors.length === 0,
    missing: errors
  };
}

/**
 * Validate array of TradeData objects for batch operations
 * @param {TradeData[]} tradesArray - Array of trade data to validate
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
    results: results
  };
}

// ==========================================
// Account and Asset Validation
// ==========================================

/**
 * Validate if account ID exists and is accessible
 * @param {string} accountId - Account ID to validate
 * @returns {Promise<boolean>} True if account exists and is valid
 */
function validateAccountExists(accountId) {
  try {
    if (isEmpty(accountId)) return false;
    
    const accountResult = getAccountById(accountId);
    return accountResult.status === 'success';
  } catch (error) {
    console.error('Error validating account existence:', error);
    return false;
  }
}

/**
 * Validate if asset ID exists and is accessible
 * @param {string} assetId - Asset ID to validate
 * @returns {Promise<boolean>} True if asset exists and is valid
 */
function validateAssetExists(assetId) {
  try {
    if (isEmpty(assetId)) return false;
    
    const assetResult = getAssetById(assetId);
    return assetResult.status === 'success';
  } catch (error) {
    console.error('Error validating asset existence:', error);
    return false;
  }
}

// ==========================================
// Data Format Validation
// ==========================================

/**
 * Validate date string format (YYYY-MM-DD)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if date format is valid
 */
function isValidDateFormat(dateString) {
  if (!dateString || typeof dateString !== 'string') return false;
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  // Check if date is actually valid
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && date.toISOString().substr(0, 10) === dateString;
}

/**
 * Validate email format
 * @param {string} email - Email string to validate
 * @returns {boolean} True if email format is valid
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate that a number is within specified range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} True if number is within range
 */
function isNumberInRange(value, min, max) {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
}

// ==========================================
// Business Rule Validation
// ==========================================

/**
 * Validate trading balance calculations
 * @param {number} startBalance - Starting balance
 * @param {number} dailyProfit - Daily profit/loss
 * @param {number} expectedEndBalance - Expected end balance
 * @returns {boolean} True if calculation is correct
 */
function validateBalanceCalculation(startBalance, dailyProfit, expectedEndBalance) {
  const calculatedEndBalance = startBalance + dailyProfit;
  return Math.abs(calculatedEndBalance - expectedEndBalance) < 0.001; // Allow for floating point precision
}

/**
 * Validate lot size based on asset type and business rules
 * @param {number} lotSize - Lot size to validate
 * @param {string} assetType - Type of asset
 * @returns {ValidationResult} Validation result
 */
function validateLotSize(lotSize, assetType) {
  const errors = [];
  
  if (lotSize <= 0) {
    errors.push('Lot size must be greater than 0');
  }
  
  // Add specific validations based on asset type
  switch (assetType?.toLowerCase()) {
    case 'forex':
      if (lotSize > 100) {
        errors.push('Forex lot size should not exceed 100');
      }
      break;
    case 'crypto':
      if (lotSize > 1000) {
        errors.push('Crypto lot size should not exceed 1000');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    missing: errors
  };
}

// ==========================================
// Access Control Validation
// ==========================================

/**
 * Validate user access to specific account
 * @param {string} token - User authentication token
 * @param {string} accountId - Account ID to check access for
 * @returns {APIResponse} Access validation result
 */
function verifyAccountAccess(token, accountId) {
  try {
    // Get user info from token
    const userInfo = getUserInfoFromToken(token);
    
    if (userInfo.status === 'error') {
      return createJSONResponse('error', 'Invalid authentication token');
    }
    
    // For now, allow access to all accounts for valid users
    // In a real implementation, you might check specific permissions
    return createJSONResponse('success', 'Access granted');
    
  } catch (error) {
    logError('verifyAccountAccess', error, { token, accountId });
    return createJSONResponse('error', 'Access verification failed');
  }
}

/**
 * Validate API request parameters completeness
 * @param {Object} params - Request parameters
 * @param {string[]} requiredParams - Array of required parameter names
 * @returns {ValidationResult} Validation result with missing parameters
 */
function validateApiRequest(params, requiredParams) {
  const missing = [];
  
  requiredParams.forEach(param => {
    if (!params[param] && params[param] !== 0) {
      missing.push(param);
    }
  });
  
  return {
    isValid: missing.length === 0,
    missing: missing
  };
}

// ==========================================
// Sheet Structure Validation
// ==========================================

/**
 * Validate sheet headers against expected configuration
 * @param {string} sheetName - Name of sheet to validate
 * @param {string[]} expectedHeaders - Expected header array
 * @returns {SheetValidationResult} Detailed validation result
 */
function validateSheetHeaders(sheetName, expectedHeaders) {
  try {
    const sheet = getSheet(sheetName);
    const values = sheet.getDataRange().getValues();
    
    if (values.length === 0) {
      return {
        exists: true,
        hasValidHeaders: false,
        missingHeaders: expectedHeaders,
        extraHeaders: [],
        rowCount: 0,
        columnCount: 0
      };
    }
    
    const actualHeaders = values[0];
    const missingHeaders = expectedHeaders.filter(header => !actualHeaders.includes(header));
    const extraHeaders = actualHeaders.filter(header => !expectedHeaders.includes(header));
    
    return {
      exists: true,
      hasValidHeaders: missingHeaders.length === 0,
      missingHeaders: missingHeaders,
      extraHeaders: extraHeaders,
      rowCount: values.length,
      columnCount: actualHeaders.length
    };
    
  } catch (error) {
    logError('validateSheetHeaders', error, { sheetName, expectedHeaders });
    return {
      exists: false,
      hasValidHeaders: false,
      missingHeaders: expectedHeaders,
      extraHeaders: [],
      rowCount: 0,
      columnCount: 0
    };
  }
}

// ==========================================
// Schema Validation Functions (New)
// ==========================================

/**
 * Validate all sheets against their schemas from SHEET_SCHEMAS
 * @returns {Object} Validation results for all sheets
 */
function validateAllSheetsAgainstSchemas() {
  const results = {};
  
  try {
    const schemas = getSheetSchemas(); // Use new Config.js function
    
    Object.keys(schemas).forEach(function(sheetName) {
      const schema = schemas[sheetName];
      if (schema && schema.headers) {
        results[sheetName] = validateSheetHeaders(sheetName, schema.headers);
        results[sheetName].expectedDataTypes = schema.dataTypes || [];
      }
    });
    
    return {
      status: 'success',
      message: 'Sheet validation completed',
      results: results
    };
    
  } catch (error) {
    logError('validateAllSheetsAgainstSchemas', error);
    return {
      status: 'error',
      message: 'Failed to validate sheets: ' + error.toString(),
      results: {}
    };
  }
}

/**
 * Validate a specific sheet against its schema
 * @param {string} sheetName - Name of the sheet to validate
 * @returns {Object} Detailed validation result
 */
function validateSheetAgainstSchema(sheetName) {
  try {
    const schema = getSheetSchema(sheetName); // Use new Config.js function
    
    if (!schema) {
      return {
        status: 'error',
        message: `No schema found for sheet: ${sheetName}`,
        validation: null
      };
    }
    
    const validation = validateSheetHeaders(sheetName, schema.headers);
    validation.expectedDataTypes = schema.dataTypes || [];
    
    return {
      status: 'success',
      message: `Validation completed for sheet: ${sheetName}`,
      validation: validation
    };
    
  } catch (error) {
    logError('validateSheetAgainstSchema', error, { sheetName });
    return {
      status: 'error',
      message: `Failed to validate sheet ${sheetName}: ${error.toString()}`,
      validation: null
    };
  }
}

/**
 * Refresh schemas from Google Sheets and validate all sheets
 * @returns {Object} Validation results after schema refresh
 */
function refreshSchemasAndValidate() {
  try {
    console.log('🔄 Refreshing schemas from Google Sheets...');
    loadSchemasFromSheets(); // Use new Config.js function
    
    console.log('✅ Schemas refreshed, validating all sheets...');
    return validateAllSheetsAgainstSchemas();
    
  } catch (error) {
    logError('refreshSchemasAndValidate', error);
    return {
      status: 'error',
      message: 'Failed to refresh schemas and validate: ' + error.toString(),
      results: {}
    };
  }
}