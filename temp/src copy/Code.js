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
  const publicEndpoints = ['getAccounts', 'getAssets'];
  
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
  const params = e.parameter;
  
  // Handle login request
  if (params.action === 'login') {
    const result = authenticateUser(params.username, params.password);
    return ContentService.createTextOutput(JSON.stringify(result))
                        .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Handle logout request
  if (params.action === 'logout') {
    const result = revokeToken(params.token);
    return ContentService.createTextOutput(JSON.stringify({
      status: result ? 'success' : 'error',
      message: result ? 'ออกจากระบบสำเร็จ' : 'เกิดข้อผิดพลาด'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Handle password reset request (public endpoint)
  if (params.action === 'resetPassword') {
    const result = requestPasswordReset(params.email);
    return ContentService.createTextOutput(JSON.stringify(result))
                        .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Handle batch trading records submission
  if (params.action === 'addMultipleTrades') {
    // Verify authentication
    const authResult = authenticateRequest(params);
    if (authResult.status === 'error') {
      return ContentService.createTextOutput(JSON.stringify(authResult))
                          .setMimeType(ContentService.MimeType.JSON);
    }
    
    const result = addMultipleTrades(params.tradesData, params.token);
    return ContentService.createTextOutput(JSON.stringify(result))
                        .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Handle single trading record submission (backward compatibility)
  // Check if token is provided for authentication
  if (params.token) {
    const authResult = authenticateRequest(params);
    if (authResult.status === 'error') {
      return ContentService.createTextOutput(JSON.stringify(authResult))
                          .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Verify access to the account
    const accessResult = verifyAccountAccess(params.token, params.accountId);
    if (accessResult.status === 'error') {
      return ContentService.createTextOutput(JSON.stringify(accessResult))
                          .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  const result = addTrade(
    params.accountId,
    params.assetId,
    parseFloat(params.startBalance),
    parseFloat(params.dailyProfit),
    parseFloat(params.lotSize),
    params.notes || '',
    params.tradeDate || ''
  );
  
  return ContentService.createTextOutput(JSON.stringify(result))
                      .setMimeType(ContentService.MimeType.JSON);
}