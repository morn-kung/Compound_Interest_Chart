/**
 * Main Entry Point - Google Apps Script Web App Handler
 * Handles HTTP requests and routes them to appropriate service functions
 * @requires Types.js - For type definitions
 * @requires Config.js - For conf    case 'getSystemHealth':
      // Admin-only endpoint for system health check
      const systemHealthAuthResult = authenticateRequest(params);
      if (systemHealthAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(systemHealthAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const systemHealth = getSystemHealthCheck();
      return ContentService.createTextOutput(JSON.stringify(systemHealth))
                          .setMimeType(ContentService.MimeType.JSON);

    case 'generateTradingData':
      // Admin-only endpoint for generating sample trading data
      const generateAuthResult = authenticateRequest(params);
      if (generateAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(generateAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const accountId = params.accountId;
      const daysToGenerate = params.days ? parseInt(params.days) : null;
      
      if (!accountId) {
        const errorResponse = createJSONResponse('error', 'Account ID is required');
        return ContentService.createTextOutput(JSON.stringify(errorResponse))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const generationResult = generateTradingDataToYesterday(accountId, daysToGenerate);
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
                          .setMimeType(ContentService.MimeType.JSON); * @requires All service files - For business logic
 * @created 2025-09-27 (refactored)
 */

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
    return createJSONResponse('error', error.toString());
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
    return createJSONResponse('error', error.toString());
  }
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
    'getAccounts', 
    'getAssets',
    'testGetUserData',
    'testFindUser', 
    'testVerifyPassword',
    'testLoginStepByStep',
    'runAllLoginTests',
    'testConfiguration',
    'testLoginWithFullDebug',
    'testDirectAuthentication',
    'debugPOST',
    'debugLogin'
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
      // Admin-only endpoint to get all sheet names
      const allSheetsAuthResult = authenticateRequest(params);
      if (allSheetsAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(allSheetsAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const allSheets = getAllSheetNames();
      return ContentService.createTextOutput(JSON.stringify(allSheets))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'getConfiguredSheets':
      // Admin-only endpoint to get configured sheet names
      const configSheetsAuthResult = authenticateRequest(params);
      if (configSheetsAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(configSheetsAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const configuredSheets = getConfiguredSheetNames();
      return ContentService.createTextOutput(JSON.stringify(configuredSheets))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'compareSheets':
      // Admin-only endpoint to compare configured vs actual sheets
      const compareSheetsAuthResult = authenticateRequest(params);
      if (compareSheetsAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(compareSheetsAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const sheetComparison = compareConfiguredWithActualSheets();
      return ContentService.createTextOutput(JSON.stringify(sheetComparison))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'getCurrentSpreadsheet':
      // Admin-only endpoint to get current spreadsheet info
      const currentSpreadsheetAuthResult = authenticateRequest(params);
      if (currentSpreadsheetAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(currentSpreadsheetAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const currentSpreadsheetInfo = getCurrentSpreadsheetInfo();
      return ContentService.createTextOutput(JSON.stringify(currentSpreadsheetInfo))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'getSystemHealth':
      // Admin-only endpoint to get system health status
      const systemHealthAuthResult = authenticateRequest(params);
      if (systemHealthAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(systemHealthAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const systemHealth = getSystemHealth();
      return ContentService.createTextOutput(JSON.stringify(systemHealth))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'testSpreadsheet':
      // Admin-only endpoint to test spreadsheet access
      const testSpreadsheetAuthResult = authenticateRequest(params);
      if (testSpreadsheetAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(testSpreadsheetAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const testResult = testSpreadsheetAccess();
      return ContentService.createTextOutput(JSON.stringify(testResult))
                          .setMimeType(ContentService.MimeType.JSON);
    
    // ==========================================
    // LOGIN DEBUG ENDPOINTS (ไม่ต้อง Authentication)
    // ==========================================
    case 'testGetUserData':
      const testUserData = testGetUserData();
      return ContentService.createTextOutput(JSON.stringify(testUserData))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'testFindUser':
      const testUsername = params.username || '4498';
      const findUserResult = testFindUser(testUsername);
      return ContentService.createTextOutput(JSON.stringify(findUserResult))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'testVerifyPassword':
      const verifyUsername = params.username || '4498';
      const verifyPassword = params.password || 'likit.se4498';
      const verifyResult = testVerifyPassword(verifyUsername, verifyPassword);
      return ContentService.createTextOutput(JSON.stringify(verifyResult))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'testLoginStepByStep':
      const stepUsername = params.username || '4498';
      const stepPassword = params.password || 'likit.se4498';
      const stepResult = testLoginStepByStep(stepUsername, stepPassword);
      return ContentService.createTextOutput(JSON.stringify(stepResult))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'runAllLoginTests':
      const allTestUsername = params.username || '4498';
      const allTestPassword = params.password || 'likit.se4498';
      const allTestResults = runAllLoginTests(allTestUsername, allTestPassword);
      return ContentService.createTextOutput(JSON.stringify(allTestResults))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'testConfiguration':
      const configResult = testConfiguration();
      return ContentService.createTextOutput(JSON.stringify(configResult))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'testLoginWithFullDebug':
      const debugUsername = params.username || '4498';
      const debugPassword = params.password || 'likit.se4498';
      const fullDebugResult = testLoginWithFullDebug(debugUsername, debugPassword);
      return ContentService.createTextOutput(JSON.stringify(fullDebugResult))
                          .setMimeType(ContentService.MimeType.JSON);
    
    case 'testDirectAuthentication':
      const directUsername = params.username || '4498';
      const directPassword = params.password || 'likit.se4498';
      const directResult = testDirectAuthentication(directUsername, directPassword);
      return ContentService.createTextOutput(JSON.stringify(directResult))
                          .setMimeType(ContentService.MimeType.JSON);

    default:
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Invalid action parameter"
      })).setMimeType(ContentService.MimeType.JSON);
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
  
  // Log received parameters for debugging
  console.log('🔍 POST Request Debug:', {
    action: action,
    username: username,
    password: password ? '[HIDDEN]' : null,
    token: token ? '[HIDDEN]' : null,
    hasParameters: !!e.parameters,
    hasParameter: !!e.parameter,
    parameterKeys: e.parameter ? Object.keys(e.parameter) : [],
    parametersKeys: e.parameters ? Object.keys(e.parameters) : []
  });
  
  // Handle debug POST request (PUBLIC - no auth needed)
  if (action === 'debugPOST') {
    const debugResult = {
      status: 'debug',
      message: 'POST Parameter Debug',
      timestamp: new Date().toISOString(),
      debug: {
        hasParameter: !!e.parameter,
        hasParameters: !!e.parameters,
        hasPostData: !!e.postData,
        
        // Show what we received
        parameterKeys: e.parameter ? Object.keys(e.parameter) : [],
        parametersKeys: e.parameters ? Object.keys(e.parameters) : [],
        
        // Test parameter extraction
        extractionTest: {
          action: getParam('action'),
          username: getParam('username'),
          password: getParam('password') ? '[PROVIDED]' : '[MISSING]'
        },
        
        // Show raw data (sanitized)
        rawParameter: e.parameter || {},
        rawParameters: e.parameters || {}
      }
    };
    
    // Sanitize sensitive data
    if (debugResult.debug.rawParameter.password) {
      debugResult.debug.rawParameter.password = '[HIDDEN]';
    }
    if (debugResult.debug.rawParameters.password) {
      debugResult.debug.rawParameters.password = ['[HIDDEN]'];
    }
    
    return ContentService.createTextOutput(JSON.stringify(debugResult))
                        .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Handle debug login (PUBLIC - step by step authentication debug)
  if (action === 'debugLogin') {
    const debugLogs = [];
    
    try {
      debugLogs.push('🔍 Starting debugLogin...');
      debugLogs.push(`📝 Username: ${username}, Password: ${password ? '[PROVIDED]' : '[MISSING]'}`);
      
      if (!username || !password) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'debug',
          message: 'Missing credentials',
          logs: debugLogs,
          error: 'Username or password not provided'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Test password verification directly
      debugLogs.push('🔐 Testing password verification...');
      const email = 'likit.se' + username + '@company.com'; // Mock email format
      const empId = username;
      
      debugLogs.push(`📧 Email: ${email}, EmpId: ${empId}`);
      
      // Get expected hash
      const expectedHash = hashPassword(email, empId);
      debugLogs.push(`🔍 Expected hash: ${expectedHash}`);
      
      // Test plain password hash
      const plainHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
                                 .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                                 .join('');
      debugLogs.push(`📝 Plain password hash: ${plainHash}`);
      debugLogs.push(`✅ Hash match: ${plainHash === expectedHash}`);
      
      // Test full authentication
      debugLogs.push('🚀 Testing full authentication...');
      const authResult = authenticateUser(username, password);
      debugLogs.push(`📊 Auth result: ${JSON.stringify(authResult)}`);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'debug',
        message: 'Debug Login Complete',
        logs: debugLogs,
        authResult: authResult,
        hashComparison: {
          expected: expectedHash,
          actual: plainHash,
          match: plainHash === expectedHash
        }
      })).setMimeType(ContentService.MimeType.JSON);
      
    } catch (error) {
      debugLogs.push(`❌ Error: ${error.message}`);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'debug',
        message: 'Debug Login Error',
        logs: debugLogs,
        error: error.message
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Handle login request
  if (action === 'login') {
    if (!username || !password) {
      const errorResponse = {
        status: 'error',
        message: 'ต้องระบุชื่อผู้ใช้และรหัสผ่าน',
        timestamp: new Date().toISOString(),
        debug: { 
          username: !!username, 
          password: !!password,
          usernameValue: username,
          passwordValue: password ? '[PROVIDED]' : null,
          parameterExtraction: {
            action: action,
            fromParameters: e.parameters ? Object.keys(e.parameters) : [],
            fromParameter: e.parameter ? Object.keys(e.parameter) : []
          }
        }
      };
      return ContentService.createTextOutput(JSON.stringify(errorResponse))
                          .setMimeType(ContentService.MimeType.JSON);
    }
    
    const result = authenticateUser(username, password);
    return ContentService.createTextOutput(JSON.stringify(result))
                        .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Handle logout request
  if (action === 'logout') {
    const result = revokeToken(token);
    return ContentService.createTextOutput(JSON.stringify({
      status: result ? 'success' : 'error',
      message: result ? 'ออกจากระบบสำเร็จ' : 'เกิดข้อผิดพลาด'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Handle password reset request (public endpoint)
  if (action === 'resetPassword') {
    const email = getParam('email');
    const result = requestPasswordReset(email);
    return ContentService.createTextOutput(JSON.stringify(result))
                        .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Handle batch trading records submission
  if (action === 'addMultipleTrades') {
    // Create params object for authentication
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
  // Check if token is provided for authentication
  if (token) {
    const authParams = { token: token };
    const authResult = authenticateRequest(authParams);
    if (authResult.status === 'error') {
      return ContentService.createTextOutput(JSON.stringify(authResult))
                          .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Verify access to the account
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