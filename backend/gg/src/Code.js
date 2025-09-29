/** updated 2025-09-29 T 18:56:00
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
    'login',                    // 🔥 LOGIN ENDPOINT (redirects to POST)
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
    'debugLogin',
    'testNewCode'
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
    
    case 'refreshSchemas':
      // Admin-only endpoint to refresh SHEET_SCHEMAS from Google Sheets
      const refreshSchemasAuthResult = authenticateRequest(params);
      if (refreshSchemasAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(refreshSchemasAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      try {
        const refreshResult = loadSchemasFromSheets(); // Use new Config.js function
        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          message: 'SHEET_SCHEMAS refreshed successfully',
          schemas: refreshResult
        })).setMimeType(ContentService.MimeType.JSON);
      } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Failed to refresh schemas: ' + error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
      }
    
    case 'getSchemas':
      // Admin-only endpoint to get current SHEET_SCHEMAS
      const getSchemasAuthResult = authenticateRequest(params);
      if (getSchemasAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(getSchemasAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      try {
        const currentSchemas = getSheetSchemas(); // Use new Config.js function
        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          message: 'Current SHEET_SCHEMAS retrieved',
          schemas: currentSchemas
        })).setMimeType(ContentService.MimeType.JSON);
      } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Failed to get schemas: ' + error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
      }
    
    case 'validateSheetsWithSchemas':
      // Admin-only endpoint to validate all sheets against their schemas
      const validateSchemasAuthResult = authenticateRequest(params);
      if (validateSchemasAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(validateSchemasAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      try {
        const validationResult = validateAllSheetsAgainstSchemas(); // Use new ValidationService.js function
        return ContentService.createTextOutput(JSON.stringify(validationResult))
                            .setMimeType(ContentService.MimeType.JSON);
      } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Failed to validate sheets: ' + error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
      }
    
    case 'refreshAndValidate':
      // Admin-only endpoint to refresh schemas and validate all sheets
      const refreshValidateAuthResult = authenticateRequest(params);
      if (refreshValidateAuthResult.status === 'error') {
        return ContentService.createTextOutput(JSON.stringify(refreshValidateAuthResult))
                            .setMimeType(ContentService.MimeType.JSON);
      }
      
      try {
        const result = refreshSchemasAndValidate(); // Use new ValidationService.js function
        return ContentService.createTextOutput(JSON.stringify(result))
                            .setMimeType(ContentService.MimeType.JSON);
      } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Failed to refresh and validate: ' + error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
      }

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

    case 'testNewCode':
      // Test endpoint to verify new code is deployed
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'NEW CODE IS DEPLOYED! 🎉',
        timestamp: new Date().toISOString(),
        version: '2025-09-28-v3',
        features: [
          'debugLogin endpoint',
          'debugPOST endpoint', 
          'Public endpoints configured',
          'Enhanced parameter extraction'
        ]
      })).setMimeType(ContentService.MimeType.JSON);

    case 'login':
      // Redirect GET login requests to use POST for security
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Login ต้องใช้ POST method เพื่อความปลอดภัย',
        suggestion: 'กรุณาใช้ POST request แทน GET request สำหรับการล็อกอิน',
        debug: {
          method: 'GET',
          redirect: 'Please use POST method for login',
          security: 'Credentials should not be sent via URL parameters'
        },
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);

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
  
  // Handle login request (PUBLIC - main login endpoint)
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

    // 🎯 ENHANCED LOGIN WITH DETAILED DEBUG
    try {
      // Step 1: Check if user exists
      const sheet = getSheet(CONFIG.SHEETS.USER);
      const values = sheet.getDataRange().getValues();
      
      // 🔍 DEBUG: Log sheet data for troubleshooting
      console.log('🔍 POST LOGIN DEBUG - Sheet Data Analysis:');
      console.log('📊 Total rows:', values.length);
      console.log('📋 Headers:', values[0]);
      console.log('🔍 Looking for username:', username, 'Type:', typeof username);
      
      let userFound = false;
      let userRow = null;
      let foundByEmpId = false;
      let foundByEmail = false;
      let debugInfo = [];
      
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        const empId = row[0];
        const email = row[2];
        const userStatus = row[4];
        
        // 🔍 DEBUG: Log each row comparison
        debugInfo.push({
          rowIndex: i,
          empId: empId,
          empIdType: typeof empId,
          empIdStr: String(empId),
          email: email,
          status: userStatus,
          statusType: typeof userStatus,
          statusStr: String(userStatus),
          username: username,
          usernameType: typeof username,
          usernameStr: String(username),
          empIdMatch: empId === username,
          empIdStringMatch: String(empId) === String(username),
          statusMatch: userStatus === 1,
          statusStringMatch: String(userStatus) === '1'
        });
        
        // Convert both to strings for safe comparison (Google Sheets stores numbers as Number type)
        const empIdStr = String(empId);
        const emailStr = String(email);
        const usernameStr = String(username);
        const statusStr = String(userStatus);
        
        if (empIdStr === usernameStr && (statusStr === '1')) {
          userFound = true;
          userRow = row;
          foundByEmpId = true;
          console.log('✅ FOUND USER by EmpId:', empId, '(converted to string)', empIdStr, 'at row', i);
          break;
        } else if (emailStr === usernameStr && (statusStr === '1')) {
          userFound = true;
          userRow = row;
          foundByEmail = true;
          console.log('✅ FOUND USER by Email:', email, 'at row', i);
          break;
        }
      }
      
      console.log('🔍 User search completed:', {
        userFound: userFound,
        totalRowsChecked: values.length - 1,
        searchTerm: username,
        firstFewRows: debugInfo.slice(0, 3)
      });
      
      // If user not found, return specific error with detailed debug
      if (!userFound) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
          debug: {
            step: 'USER_LOOKUP',
            issue: 'USERNAME_NOT_FOUND',
            username: username,
            usernameType: typeof username,
            message: `ไม่พบ username "${username}" ในระบบ หรือ user ถูก deactivate`,
            suggestion: 'ตรวจสอบ username ใน Google Sheets USER tab',
            sheetDebug: {
              totalRows: values.length,
              headers: values[0],
              sampleRows: debugInfo.slice(0, 5),
              searchPerformed: `Looking for "${username}" in EmpId or Email columns`
            }
          },
          timestamp: new Date().toISOString()
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Step 2: Check password
      const empId = userRow[CONFIG.COLUMNS.USER.EMP_ID];
      const email = userRow[CONFIG.COLUMNS.USER.EMAIL];
      const isPasswordValid = verifyPassword(password, email, empId);
      
      if (!isPasswordValid) {
        // Test what the expected password should be
        const expectedHash = hashPassword(email, empId);
        const providedHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
                                     .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                                     .join('');
        
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
          debug: {
            step: 'PASSWORD_VERIFICATION',
            issue: 'PASSWORD_MISMATCH',
            username: username,
            userFound: true,
            foundBy: foundByEmpId ? 'EmpId' : 'Email',
            userInfo: {
              empId: empId,
              email: email,
              status: userRow[CONFIG.COLUMNS.USER.USER_STATUS]
            },
            passwordCheck: {
              expectedHash: expectedHash,
              providedHash: providedHash,
              match: false
            },
            message: `Username "${username}" ถูกต้อง แต่ password ไม่ถูกต้อง`,
            suggestion: `ลอง password: likit.se${empId} หรือตรวจสอบ password format`
          },
          timestamp: new Date().toISOString()
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Step 3: Check if password change is required (SAP Style)
      const requirePasswordChange = userRow[CONFIG.COLUMNS.USER.REQUIRE_PASSWORD_CHANGE]; // *** ใช้ CONFIG แทน hard-coded index ***
      
      if (requirePasswordChange === true || String(requirePasswordChange) === 'true') {
        // *** SAP STYLE: บังคับเปลี่ยนรหัสผ่าน ***
        return ContentService.createTextOutput(JSON.stringify({
          status: 'password_change_required',
          message: 'กรุณาเปลี่ยนรหัสผ่านก่อนเข้าใช้งาน',
          user: {
            id: empId,
            fullName: userRow[CONFIG.COLUMNS.USER.FULL_NAME_TH],
            email: email,
            role: userRow[CONFIG.COLUMNS.USER.ROLE],
            status: userRow[CONFIG.COLUMNS.USER.USER_STATUS]
          },
          action: 'change_password',
          redirectTo: 'change-password.html',
          timestamp: new Date().toISOString()
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Step 4: Generate token for normal login (no password change required)
      const user = {
        id: empId,
        fullName: userRow[CONFIG.COLUMNS.USER.FULL_NAME_TH],
        email: email,
        role: userRow[CONFIG.COLUMNS.USER.ROLE],
        status: userRow[CONFIG.COLUMNS.USER.USER_STATUS]
      };
      
      const token = generateToken(user);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'เข้าสู่ระบบสำเร็จ',
        user: user,
        token: token,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
      
    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
        debug: {
          step: 'ERROR',
          error: error.message,
          stack: error.stack
        },
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
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
      
      // 🎯 STEP 1: Test USER LOOKUP
      debugLogs.push('👤 STEP 1: Testing User Lookup...');
      const sheet = getSheet(CONFIG.SHEETS.USER);
      const values = sheet.getDataRange().getValues();
      
      let userFound = false;
      let userRow = null;
      
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        const empId = row[0];
        const email = row[2];
        const userStatus = row[4];
        
        if ((empId === username || email === username) && userStatus === 1) {
          userFound = true;
          userRow = row;
          debugLogs.push(`✅ USER FOUND: EmpId=${empId}, Email=${email}, Status=${userStatus}`);
          break;
        }
      }
      
      if (!userFound) {
        debugLogs.push(`❌ USER NOT FOUND: Username "${username}" not in database or inactive`);
        return ContentService.createTextOutput(JSON.stringify({
          status: 'debug',
          message: 'User Lookup Failed',
          logs: debugLogs,
          userFound: false
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // 🎯 STEP 2: Test PASSWORD VERIFICATION
      debugLogs.push('🔐 STEP 2: Testing Password Verification...');
      const empId = userRow[0];
      const email = userRow[2];
      
      debugLogs.push(`📧 User Email: ${email}, EmpId: ${empId}`);
      
      // Get expected hash
      const expectedHash = hashPassword(email, empId);
      debugLogs.push(`🔍 Expected Hash: ${expectedHash}`);
      
      // Test plain password hash
      const plainHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
                                 .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                                 .join('');
      debugLogs.push(`📝 Provided Password Hash: ${plainHash}`);
      
      const passwordMatch = plainHash === expectedHash;
      debugLogs.push(`${passwordMatch ? '✅' : '❌'} PASSWORD MATCH: ${passwordMatch}`);
      
      // 🎯 STEP 3: Test Full Authentication
      debugLogs.push('🚀 STEP 3: Testing Full Authentication...');
      const authResult = authenticateUser(username, password);
      debugLogs.push(`📊 Auth Result Status: ${authResult.status}`);
      debugLogs.push(`📊 Auth Result Message: ${authResult.message}`);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'debug',
        message: 'Step-by-Step Debug Complete',
        logs: debugLogs,
        results: {
          step1_userFound: userFound,
          step2_passwordMatch: passwordMatch,
          step3_fullAuth: authResult.status === 'success'
        },
        details: {
          userInfo: userFound ? {
            empId: userRow[CONFIG.COLUMNS.USER.EMP_ID],
            name: userRow[CONFIG.COLUMNS.USER.FULL_NAME_TH],
            email: userRow[CONFIG.COLUMNS.USER.EMAIL],
            role: userRow[CONFIG.COLUMNS.USER.ROLE],
            status: userRow[CONFIG.COLUMNS.USER.USER_STATUS]
          } : null,
          hashComparison: {
            expected: expectedHash,
            actual: plainHash,
            match: passwordMatch
          },
          authResult: authResult
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
  
  // Handle change password request (SAP Style - after temporary password login)
  if (action === 'changePassword') {
    const empId = getParam('empId');
    const currentPassword = getParam('currentPassword');
    const newPassword = getParam('newPassword');
    const confirmPassword = getParam('confirmPassword');
    
    if (!empId || !currentPassword || !newPassword || !confirmPassword) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (newPassword !== confirmPassword) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'รหัสผ่านใหม่ไม่ตรงกัน'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (newPassword.length < 8) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    try {
      const result = changeUserPassword(empId, currentPassword, newPassword);
      return ContentService.createTextOutput(JSON.stringify(result))
                          .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน: ' + error.message
      })).setMimeType(ContentService.MimeType.JSON);
    }
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

  // Handle direct authentication test (public endpoint)
  if (action === 'testDirectAuthentication') {
    if (!username || !password) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Missing username or password for direct authentication test'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const result = testDirectAuthentication(username, password);
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