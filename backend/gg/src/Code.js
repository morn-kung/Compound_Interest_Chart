/** updated 2025-10-03 T 12:00:00 - Enhanced with MVC Features
 * Main Entry Point - Google Apps Script Web App Handler
 * Handles HTTP requests and routes them to appropriate service functions
 * Enhanced with improved error handling and standardized response format
 * @requires Types.js - For type definitions
 * @requires Config.js - For configuration settings
 * @requires All service files - For business logic
 * @created 2025-09-27 (refactored) | Enhanced 2025-10-03
 */

// ==========================================
// Enhanced Response Helper Functions
// ==========================================

/**
 * Create standardized JSON response with enhanced error handling
 * @param {string} status - Response status ('success', 'error', 'validation_error')
 * @param {*} data - Response data or error message
 * @param {Object} options - Additional options (code, timestamp, etc.)
 * @returns {GoogleAppsScript.Content.TextOutput} JSON response
 */
function createEnhancedJSONResponse(status, data, options = {}) {
  const response = {
    status: status,
    timestamp: new Date().toISOString(),
    ...options
  };
  
  if (status === 'success') {
    response.data = data;
  } else {
    response.message = data;
    if (options.code) response.code = options.code;
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
                      .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Backward compatibility wrapper for createJSONResponse
 */
function createJSONResponse(status, data) {
  return createEnhancedJSONResponse(status, data);
}

// ==========================================
// HTTP Request Handlers
// ==========================================

/**
 * Handle HTTP GET requests for data retrieval operations
 * @param {GoogleAppsScript.Events.DoGet} e - GET request event object
 * @returns {GoogleAppsScript.Content.TextOutput} JSON response
 */
function doGet(e) {
  try {
    return handleGetRequest(e);
  } catch (error) {
    console.error('Error in doGet:', error);
    return createEnhancedJSONResponse('error', 'Server error: ' + error.message, { code: 500 });
  }
}

/**
 * Handle HTTP POST requests for data submission operations
 * @param {GoogleAppsScript.Events.DoPost} e - POST request event object
 * @returns {GoogleAppsScript.Content.TextOutput} JSON response
 */
function doPost(e) {
  try {
    return handlePostRequest(e);
  } catch (error) {
    console.error('Error in doPost:', error);
    return createEnhancedJSONResponse('error', 'Server error: ' + error.message, { code: 500 });
  }
}

/**
 * Handle HTTP OPTIONS requests for CORS preflight
 * Google Apps Script handles CORS automatically, but this provides explicit support
 * @param {GoogleAppsScript.Events.DoGet} e - OPTIONS request event object
 * @returns {GoogleAppsScript.Content.TextOutput} Empty response for preflight
 */
function doOptions(e) {
  // Google Apps Script automatically handles CORS headers
  // This function ensures proper response to OPTIONS preflight requests
  return ContentService.createTextOutput('')
                      .setMimeType(ContentService.MimeType.TEXT);
}

// ==========================================
// Request Routing Functions
// ==========================================

/**
 * Handle GET request routing with proper authentication and authorization
 * @param {GoogleAppsScript.Events.DoGet} e - GET request event object
 * @returns {GoogleAppsScript.Content.TextOutput} JSON response
 */
function handleGetRequest(e) {
  const params = e.parameter;
  const action = params.action;
  
  // Public endpoints (no authentication required)
  const publicEndpoints = [
    'login',        // LOGIN ENDPOINT (redirects to POST)
    'getAccounts', 
    'getAssets',
    'resetPassword' // Password reset endpoint
  ];
  
  // Check authentication for protected endpoints
  if (!publicEndpoints.includes(action)) {
    const authResult = authenticateRequest(params);
    if (authResult.status === 'error') {
      return ContentService.createTextOutput(JSON.stringify(authResult))
                          .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  switch (action) {
    case 'getAccounts':
      return ContentService.createTextOutput(JSON.stringify(getAccounts()))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'getAssets':
      return ContentService.createTextOutput(JSON.stringify(getAssets()))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'getTradingHistory':
      const accountId = params.accountId;
      const token = params.token;
      
      // Verify user has access to this account
      const accessResult = verifyAccountAccess(token, accountId);
      if (accessResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(accessResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      return ContentService.createTextOutput(JSON.stringify(getTradingHistory(accountId)))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'getAccountSummary':
      const summaryAccountId = params.accountId;
      const summaryToken = params.token;
      
      // Verify user has access to this account
      const summaryAccessResult = verifyAccountAccess(summaryToken, summaryAccountId);
      if (summaryAccessResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(summaryAccessResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      return ContentService.createTextOutput(JSON.stringify(getAccountSummary(summaryAccountId)))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'getUserInfo':
      const userToken = params.token;
      const userInfo = getUserInfoFromToken(userToken);
      return ContentService.createTextOutput(JSON.stringify(userInfo))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'validateSheets':
      // Admin-only endpoint for sheet validation
      const adminAuthResult = authenticateRequest(params);
      if (adminAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(adminAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const validation = validateSheetsStructure();
      return ContentService.createTextOutput(JSON.stringify(validation))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'fixSheets':
      // Admin-only endpoint for sheet creation/repair
      const fixAuthResult = authenticateRequest(params);
      if (fixAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(fixAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const fixResult = validateAndFixSheets();
      return ContentService.createTextOutput(JSON.stringify(fixResult))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'validateHeaders':
      // Admin-only endpoint for detailed header validation
      const headerAuthResult = authenticateRequest(params);
      if (headerAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(headerAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const headerValidation = validateSheetHeaders();
      return ContentService.createTextOutput(JSON.stringify(headerValidation))
                          .setMimeType(ContentService.MimeType.JSON);

    case 'validateDataTypes':
      // Admin-only endpoint for data type validation
      const dataTypeAuthResult = authenticateRequest(params);
      if (dataTypeAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(dataTypeAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const dataTypeValidation = validateSheetDataTypes();
      return ContentService.createTextOutput(JSON.stringify(dataTypeValidation))
                          .setMimeType(ContentService.MimeType.JSON);

    case 'validateComprehensive':
      // Admin-only endpoint for comprehensive validation
      const comprehensiveAuthResult = authenticateRequest(params);
      if (comprehensiveAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(comprehensiveAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const comprehensiveValidation = validateSheetsComprehensive();
      return ContentService.createTextOutput(JSON.stringify(comprehensiveValidation))
                          .setMimeType(ContentService.MimeType.JSON);
      
    case 'getAllSheets':
      // Admin-only endpoint for getting all sheet names
      const allSheetsAuthResult = authenticateRequest(params);
      if (allSheetsAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(allSheetsAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const allSheets = getAllSheetNames();
      return ContentService.createTextOutput(JSON.stringify(allSheets))
                          .setMimeType(ContentService.MimeType.JSON);

    case 'getConfiguredSheets':
      // Admin-only endpoint for getting configured sheet names
      const configuredSheetsAuthResult = authenticateRequest(params);
      if (configuredSheetsAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(configuredSheetsAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const configuredSheets = getConfiguredSheetNames();
      return ContentService.createTextOutput(JSON.stringify(configuredSheets))
                          .setMimeType(ContentService.MimeType.JSON);

    case 'compareSheets':
      // Admin-only endpoint for comparing configured vs actual sheets
      const compareSheetsAuthResult = authenticateRequest(params);
      if (compareSheetsAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(compareSheetsAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const sheetComparison = compareConfiguredWithActualSheets();
      return ContentService.createTextOutput(JSON.stringify(sheetComparison))
                          .setMimeType(ContentService.MimeType.JSON);

    case 'getCurrentSpreadsheet':
      // Admin-only endpoint for getting current spreadsheet info
      const spreadsheetInfoAuthResult = authenticateRequest(params);
      if (spreadsheetInfoAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(spreadsheetInfoAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const spreadsheetInfo = getCurrentSpreadsheetInfo();
      return ContentService.createTextOutput(JSON.stringify(spreadsheetInfo))
                          .setMimeType(ContentService.MimeType.JSON);

    case 'getSystemHealth':
      // Admin-only endpoint for system health check
      const systemHealthAuthResult = authenticateRequest(params);
      if (systemHealthAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(systemHealthAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const systemHealth = getSystemHealth();
      return ContentService.createTextOutput(JSON.stringify(systemHealth))
                          .setMimeType(ContentService.MimeType.JSON);

    case 'generateTradingData':
      // Admin-only endpoint for generating sample trading data
      const generateAuthResult = authenticateRequest(params);
      if (generateAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(generateAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const generateAccountId = params.accountId;
      const daysToGenerate = params.days ? parseInt(params.days) : null;
      
      if (!generateAccountId) {
        const errorResponse = createJSONResponse('error', 'Account ID is required');
        return ContentService.createTextOutput(JSON.stringify(errorResponse))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const generationResult = generateTradingDataToYesterday(generateAccountId, daysToGenerate);
      return ContentService.createTextOutput(JSON.stringify(generationResult))
                          .setMimeType(ContentService.MimeType.JSON);

    case 'generateTradingDataRange':
      // Admin-only endpoint for generating trading data for specific date range
      const generateRangeAuthResult = authenticateRequest(params);
      if (generateRangeAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(generateRangeAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const rangeAccountId = params.accountId;
      const startDate = params.startDate;
      const endDate = params.endDate;
      const initialBalance = params.initialBalance ? parseFloat(params.initialBalance) : 1000;
      
      if (!rangeAccountId || !startDate || !endDate) {
        const errorResponse = createJSONResponse('error', 'Account ID, start date, and end date are required');
        return ContentService.createTextOutput(JSON.stringify(errorResponse))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const rangeGenerationResult = generateTradingDataForDateRange(rangeAccountId, startDate, endDate, initialBalance);
      return ContentService.createTextOutput(JSON.stringify(rangeGenerationResult))
                          .setMimeType(ContentService.MimeType.JSON);

    case 'login':
      // Redirect GET login to POST for security
      return createEnhancedJSONResponse('error', 'Login must use POST method for security', { code: 405 });

    default:
      return createEnhancedJSONResponse('error', 'Unknown action: ' + action, { 
        code: 400,
        availableActions: publicEndpoints 
      });
  }
}

/**
 * Handle POST request routing
 */
function handlePostRequest(e) {
  // For POST requests with form data, use e.parameters (plural) and get first value
  const getParam = (name) => {
    if (e.parameters && e.parameters[name]) {
      return e.parameters[name][0]; // Form data comes as arrays
    }
    if (e.parameter && e.parameter[name]) {
      return e.parameter[name]; // URL params (fallback)
    }
    return null;
  };
  
  const action = getParam('action');
  const username = getParam('username');
  const password = getParam('password');
  const token = getParam('token');
  
  // Handle login request (PUBLIC - main login endpoint)
  if (action === 'login') {
    if (!username || !password) {
      return createEnhancedJSONResponse('validation_error', 'ต้องระบุชื่อผู้ใช้และรหัสผ่าน', { code: 400 });
    }

    try {
      const sheet = getSheet(CONFIG.SHEETS.USER);
      const values = sheet.getDataRange().getValues();
      
      let userFound = false;
      let userRow = null;
      
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        const empId = String(row[0]);
        const email = String(row[2]);
        const userStatus = String(row[4]);
        const usernameStr = String(username);
        
        if ((empId === usernameStr || email === usernameStr) && userStatus === '1') {
          userFound = true;
          userRow = row;
          break;
        }
      }
      
      if (!userFound) {
        return createEnhancedJSONResponse('error', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', { code: 401 });
      }
      
      const empId = userRow[CONFIG.COLUMNS.USER.EMP_ID];
      const email = userRow[CONFIG.COLUMNS.USER.EMAIL];
      const isPasswordValid = verifyPassword(password, email, empId);
      
      if (!isPasswordValid) {
        return createEnhancedJSONResponse('error', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', { code: 401 });
      }
      
      // Check if password change is required (SAP Style)
      const requirePasswordChange = userRow[CONFIG.COLUMNS.USER.REQUIRE_PASSWORD_CHANGE];
      
      if (requirePasswordChange === true || String(requirePasswordChange) === 'true') {
        return createEnhancedJSONResponse('password_change_required', 'กรุณาเปลี่ยนรหัสผ่านก่อนเข้าใช้งาน', {
          user: {
            id: empId,
            fullName: userRow[CONFIG.COLUMNS.USER.FULL_NAME_TH],
            email: email,
            role: userRow[CONFIG.COLUMNS.USER.ROLE],
            status: userRow[CONFIG.COLUMNS.USER.USER_STATUS]
          },
          action: 'change_password',
          redirectTo: 'change-password.html'
        });
      }
      
      // Generate token for normal login
      const user = {
        id: empId,
        fullName: userRow[CONFIG.COLUMNS.USER.FULL_NAME_TH],
        email: email,
        role: userRow[CONFIG.COLUMNS.USER.ROLE],
        status: userRow[CONFIG.COLUMNS.USER.USER_STATUS]
      };
      
      const token = generateToken(user);
      
      return createEnhancedJSONResponse('success', {
        message: 'เข้าสู่ระบบสำเร็จ',
        user: user,
        token: token
      });
      
    } catch (error) {
      return createEnhancedJSONResponse('error', 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', {
        code: 500,
        debug: {
          step: 'ERROR',
          error: error.message,
          stack: error.stack
        }
      });
    }
  }

  // Handle change password request (SAP Style)
  if (action === 'changePassword') {
    const empId = getParam('empId');
    const currentPassword = getParam('currentPassword');
    const newPassword = getParam('newPassword');
    const confirmPassword = getParam('confirmPassword');
    
    if (!empId || !currentPassword || !newPassword || !confirmPassword) {
      return createEnhancedJSONResponse('validation_error', 'กรุณากรอกข้อมูลให้ครบถ้วน', { code: 400 });
    }
    
    if (newPassword !== confirmPassword) {
      return createEnhancedJSONResponse('validation_error', 'รหัสผ่านใหม่ไม่ตรงกัน', { code: 400 });
    }
    
    if (newPassword.length < 8) {
      return createEnhancedJSONResponse('validation_error', 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร', { code: 400 });
    }
    
    try {
      const result = changeUserPassword(empId, currentPassword, newPassword);
      return ContentService.createTextOutput(JSON.stringify(result))
                          .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
      return createEnhancedJSONResponse('error', 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน: ' + error.message, { code: 500 });
    }
  }

  // Handle logout request
  if (action === 'logout') {
    const result = revokeToken(token);
    return createEnhancedJSONResponse(result ? 'success' : 'error', result ? 'ออกจากระบบสำเร็จ' : 'เกิดข้อผิดพลาด');
  }
  
  // Handle password reset request (public endpoint)
  if (action === 'resetPassword') {
    const email = getParam('email');
    const result = requestPasswordReset(email);
    return ContentService.createTextOutput(JSON.stringify(result))
                        .setMimeType(ContentService.MimeType.JSON);
  }

  // ==========================================
  // AUTHENTICATED ENDPOINTS (Require Token)
  // ==========================================
  
  // Handle batch trading records submission
  if (action === 'addMultipleTrades') {
    const authParams = { token: token };
    const authResult = authenticateRequest(authParams);
    if (authResult.status === 'error') {
      return ContentService.createTextOutput(JSON.stringify(authResult))
                          .setMimeType(ContentService.MimeType.JSON);
    }
    
    const tradesData = getParam('tradesData');
    const result = addMultipleTrades(tradesData, token);
    return ContentService.createTextOutput(JSON.stringify(result))
                        .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Handle single trading record submission (backward compatibility)
  if (action === 'addTrade') {
    if (token) {
      const authParams = { token: token };
      const authResult = authenticateRequest(authParams);
      if (authResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(authResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const accountId = getParam('accountId');
      const accessResult = verifyAccountAccess(token, accountId);
      if (accessResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(accessResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    const result = addTrade(
      getParam('accountId'),
      getParam('assetId'),
      parseFloat(getParam('startBalance') || '0'),
      parseFloat(getParam('dailyProfit') || '0'),
      parseFloat(getParam('lotSize') || '0'),
      getParam('notes') || '',
      getParam('tradeDate') || ''
    );
    
    return ContentService.createTextOutput(JSON.stringify(result))
                        .setMimeType(ContentService.MimeType.JSON);
  }

  // Default handler for unknown actions
  return createEnhancedJSONResponse('error', `Unknown action: ${action}`, {
    code: 400,
    availableActions: [
      'login', 'logout', 'resetPassword', 'changePassword',
      'addTrade', 'addMultipleTrades'
    ]
  });
}