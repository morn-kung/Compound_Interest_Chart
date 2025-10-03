/** updated 2025-10-03 T 00:00:00
 * Main Entry Point - Google Apps Script Web App Handler (MVC Architecture)
 * Routes HTTP requests to appropriate MVC Controllers
 * @requires Controllers - AuthController, TradingController, AccountController, AssetController
 * @requires Models - UserModel, TradingModel, AccountModel, AssetModel
 * @requires Utils - ApiResponse, Config, ValidationService
 * @created 2025-09-27 (refactored to MVC 2025-10-03)
 */

// ==========================================
// Initialize Controllers
// ==========================================

let authController;
let tradingController; 
let accountController;
let assetController;

/**
 * Initialize all controllers (lazy loading)
 */
function initializeControllers() {
  if (!authController) {
    authController = new AuthController();
    tradingController = new TradingController();
    accountController = new AccountController();
    assetController = new AssetController();
  }
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
    initializeControllers();
    return handleGetRequest(e);
  } catch (error) {
    console.error('Error in doGet:', error);
    const errorResponse = ApiResponse.error('Server error: ' + error.message);
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
                        .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle HTTP POST requests for data submission operations
 * @param {GoogleAppsScript.Events.DoPost} e - POST request event object
 * @returns {GoogleAppsScript.Content.TextOutput} JSON response
 */
function doPost(e) {
  try {
    initializeControllers();
    return handlePostRequest(e);
  } catch (error) {
    console.error('Error in doPost:', error);
    const errorResponse = ApiResponse.error('Server error: ' + error.message);
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
                        .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// Request Routing Functions
// ==========================================

/**
 * Handle GET request routing using MVC Controllers
 * @param {GoogleAppsScript.Events.DoGet} e - GET request event object
 * @returns {GoogleAppsScript.Content.TextOutput} JSON response
 */
function handleGetRequest(e) {
  const params = e.parameter;
  const action = params.action;
  
  // Extract common parameters
  const username = params.username;
  const token = params.token;
  const account_id = params.accountId || params.account_id;
  
  try {
    let response;
    
    switch (action) {
      // ==========================================
      // AUTHENTICATION ENDPOINTS
      // ==========================================
      case 'login':
        // Redirect GET login to POST for security
        response = ApiResponse.error('Login must use POST method for security', 405);
        break;
        
      case 'verifySession':
        response = authController.handleVerifySession({ username, sessionToken: token });
        break;
        
      // ==========================================
      // ACCOUNT ENDPOINTS  
      // ==========================================
      case 'getAccounts':
        response = accountController.handleGetAccounts({ username });
        break;
        
      case 'getAccountDetails':
        response = accountController.handleGetAccountDetails({ username, account_id });
        break;
        
      case 'getAccountSummary':
        // Backward compatibility
        response = accountController.handleGetAccountDetails({ username, account_id });
        break;
        
      case 'getAccountPerformance':
        response = accountController.handleGetAccountPerformance({ 
          username, 
          account_id, 
          period: params.period 
        });
        break;
        
      case 'getTransactionHistory':
        response = accountController.handleGetTransactionHistory({ 
          username, 
          account_id, 
          limit: params.limit, 
          offset: params.offset 
        });
        break;
        
      // ==========================================
      // TRADING ENDPOINTS
      // ==========================================
      case 'getTradingHistory':
        response = tradingController.handleGetTradingHistory({ 
          username, 
          account_id, 
          limit: params.limit, 
          offset: params.offset 
        });
        break;
        
      case 'getTradingStats':
        response = tradingController.handleGetTradingStats({ 
          username, 
          account_id, 
          period: params.period 
        });
        break;
        
      case 'getRecentTrades':
        response = tradingController.handleGetRecentTrades({ 
          username, 
          account_id, 
          limit: params.limit 
        });
        break;
        
      case 'getPortfolio':
        response = tradingController.handleGetPortfolio({ username, account_id });
        break;
        
      // ==========================================
      // ASSET ENDPOINTS
      // ==========================================
      case 'getAssets':
        response = assetController.handleGetAllAssets({ 
          category: params.category, 
          active_only: params.active_only 
        });
        break;
        
      case 'getAssetDetails':
        response = assetController.handleGetAssetDetails({ 
          asset_symbol: params.asset || params.asset_symbol 
        });
        break;
        
      case 'getAssetsByCategory':
        response = assetController.handleGetAssetsByCategory({ 
          category: params.category, 
          active_only: params.active_only 
        });
        break;
        
      case 'searchAssets':
        response = assetController.handleSearchAssets({ 
          query: params.query, 
          category: params.category, 
          active_only: params.active_only, 
          limit: params.limit 
        });
        break;
        
      case 'getPopularAssets':
        response = assetController.handleGetPopularAssets({ 
          period: params.period, 
          limit: params.limit 
        });
        break;
        
      case 'getPriceHistory':
        response = assetController.handleGetPriceHistory({ 
          asset_symbol: params.asset || params.asset_symbol, 
          period: params.period, 
          limit: params.limit 
        });
        break;
        
      // ==========================================
      // USER INFO ENDPOINTS
      // ==========================================
      case 'getUserInfo':
        // Legacy endpoint - get user info from token
        const userInfo = getUserInfoFromToken(token);
        response = userInfo;
        break;
        
      // ==========================================
      // ADMIN ENDPOINTS (Legacy - kept for compatibility)
      // ==========================================
      case 'validateSheets':
      case 'fixSheets':
      case 'validateHeaders':
      case 'validateDataTypes':
      case 'validateComprehensive':
      case 'getAllSheets':
      case 'getConfiguredSheets':
      case 'compareSheets':
      case 'getCurrentSpreadsheet':
      case 'getSystemHealth':
      case 'refreshSchemas':
      case 'getSchemas':
      case 'validateSheetsWithSchemas':
      case 'refreshAndValidate':
      case 'testSpreadsheet':
        // These endpoints require admin authentication
        const adminAuthResult = authenticateRequest(params);
        if (adminAuthResult.status === 'error') {
          response = adminAuthResult;
        } else {
          // Call legacy functions for admin endpoints
          response = handleLegacyAdminEndpoint(action, params);
        }
        break;
        
      // ==========================================
      // LEGACY PASSWORD RESET
      // ==========================================
      case 'resetPassword':
        const resetEmail = params.email;
        const resetResult = requestPasswordReset(resetEmail);
        response = resetResult;
        break;
        
      // ==========================================
      // DEFAULT CASE
      // ==========================================
      default:
        response = ApiResponse.error('Invalid action parameter: ' + action, 400);
        break;
    }
    
    return ContentService.createTextOutput(JSON.stringify(response))
                        .setMimeType(ContentService.MimeType.JSON);
                        
  } catch (error) {
    console.error('Error in handleGetRequest:', error);
    const errorResponse = ApiResponse.error('Request processing failed: ' + error.message);
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
                        .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST request routing using MVC Controllers
 * @param {GoogleAppsScript.Events.DoPost} e - POST request event object
 * @returns {GoogleAppsScript.Content.TextOutput} JSON response
 */
function handlePostRequest(e) {
  // Helper function to get parameters from form data or URL params
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
  
  try {
    let response;
    
    switch (action) {
      // ==========================================
      // AUTHENTICATION ENDPOINTS
      // ==========================================
      case 'login':
        response = authController.handleLogin({
          username: getParam('username'),
          password: getParam('password')
        });
        break;
        
      case 'register':
        response = authController.handleRegister({
          username: getParam('username'),
          password: getParam('password'),
          email: getParam('email')
        });
        break;
        
      case 'resetPassword':
        response = authController.handleResetPassword({
          username: getParam('username') || getParam('email')
        });
        break;
        
      case 'changePassword':
        response = authController.handleChangePassword({
          username: getParam('username') || getParam('empId'),
          currentPassword: getParam('currentPassword'),
          newPassword: getParam('newPassword')
        });
        break;
        
      case 'logout':
        response = authController.handleLogout({
          username: getParam('username'),
          token: getParam('token')
        });
        break;
        
      // ==========================================
      // TRADING ENDPOINTS
      // ==========================================
      case 'addTrade':
        response = tradingController.handleAddTrade({
          username: getParam('username'),
          account_id: getParam('accountId') || getParam('account_id'),
          asset: getParam('assetId') || getParam('asset'),
          amount: getParam('lotSize') || getParam('amount'),
          action: 'BUY', // Default action, could be parameterized
          price: getParam('price') || '1', // Default price if not provided
          notes: getParam('notes'),
          trade_date: getParam('tradeDate')
        });
        break;
        
      case 'addMultipleTrades':
        response = tradingController.handleAddMultipleTrades({
          username: getParam('username'),
          tradesData: getParam('tradesData'),
          token: getParam('token')
        });
        break;
        
      case 'updateTrade':
        response = tradingController.handleUpdateTrade({
          username: getParam('username'),
          trade_id: getParam('trade_id'),
          updates: JSON.parse(getParam('updates') || '{}')
        });
        break;
        
      case 'deleteTrade':
        response = tradingController.handleDeleteTrade({
          username: getParam('username'),
          trade_id: getParam('trade_id')
        });
        break;
        
      // ==========================================
      // ACCOUNT ENDPOINTS
      // ==========================================
      case 'createAccount':
        response = accountController.handleCreateAccount({
          username: getParam('username'),
          account_name: getParam('account_name'),
          account_type: getParam('account_type'),
          initial_balance: getParam('initial_balance'),
          description: getParam('description')
        });
        break;
        
      case 'updateAccount':
        response = accountController.handleUpdateAccount({
          username: getParam('username'),
          account_id: getParam('account_id'),
          updates: JSON.parse(getParam('updates') || '{}')
        });
        break;
        
      case 'deleteAccount':
        response = accountController.handleDeleteAccount({
          username: getParam('username'),
          account_id: getParam('account_id')
        });
        break;
        
      case 'transferFunds':
        response = accountController.handleTransferFunds({
          username: getParam('username'),
          from_account_id: getParam('from_account_id'),
          to_account_id: getParam('to_account_id'),
          amount: getParam('amount'),
          description: getParam('description')
        });
        break;
        
      // ==========================================
      // ASSET ENDPOINTS
      // ==========================================
      case 'createAsset':
        response = assetController.handleCreateAsset({
          symbol: getParam('symbol'),
          name: getParam('name'),
          category: getParam('category'),
          description: getParam('description'),
          current_price: getParam('current_price')
        });
        break;
        
      case 'updateAsset':
        response = assetController.handleUpdateAsset({
          asset_symbol: getParam('asset_symbol'),
          updates: JSON.parse(getParam('updates') || '{}')
        });
        break;
        
      case 'deleteAsset':
        response = assetController.handleDeleteAsset({
          asset_symbol: getParam('asset_symbol')
        });
        break;
        
      case 'updatePrice':
        response = assetController.handleUpdatePrice({
          asset_symbol: getParam('asset_symbol'),
          new_price: getParam('new_price'),
          source: getParam('source')
        });
        break;
        
      // ==========================================
      // DEFAULT CASE
      // ==========================================
      default:
        response = ApiResponse.error('Unknown action: ' + action, 400);
        break;
    }
    
    return ContentService.createTextOutput(JSON.stringify(response))
                        .setMimeType(ContentService.MimeType.JSON);
                        
  } catch (error) {
    console.error('Error in handlePostRequest:', error);
    const errorResponse = ApiResponse.error('Request processing failed: ' + error.message);
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
                        .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// Legacy Admin Functions Support
// ==========================================

/**
 * Handle legacy admin endpoints for backward compatibility
 * @param {string} action - The admin action to perform
 * @param {Object} params - Request parameters
 * @returns {Object} JSON response
 */
function handleLegacyAdminEndpoint(action, params) {
  try {
    switch (action) {
      case 'validateSheets':
        return validateSheetsStructure();
      case 'fixSheets':
        return validateAndFixSheets();
      case 'validateHeaders':
        return validateSheetHeaders();
      case 'validateDataTypes':
        return validateSheetDataTypes();
      case 'validateComprehensive':
        return validateSheetsComprehensive();
      case 'getAllSheets':
        return getAllSheetNames();
      case 'getConfiguredSheets':
        return getConfiguredSheetNames();
      case 'compareSheets':
        return compareConfiguredWithActualSheets();
      case 'getCurrentSpreadsheet':
        return getCurrentSpreadsheetInfo();
      case 'getSystemHealth':
        return getSystemHealth();
      case 'refreshSchemas':
        const refreshResult = loadSchemasFromSheets();
        return {
          status: 'success',
          message: 'SHEET_SCHEMAS refreshed successfully',
          schemas: refreshResult
        };
      case 'getSchemas':
        const currentSchemas = getSheetSchemas();
        return {
          status: 'success',
          message: 'Current SHEET_SCHEMAS retrieved',
          schemas: currentSchemas
        };
      case 'validateSheetsWithSchemas':
        return validateAllSheetsAgainstSchemas();
      case 'refreshAndValidate':
        return refreshSchemasAndValidate();
      case 'testSpreadsheet':
        return testSpreadsheetAccess();
      default:
        return ApiResponse.error('Unknown admin action: ' + action);
    }
  } catch (error) {
    return ApiResponse.error('Admin function failed: ' + error.message);
  }
}