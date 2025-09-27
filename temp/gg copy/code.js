/**
 * Main Entry Points for Trading Journal & Compound Calculator
 * This file contains only the main doPost() and doGet() functions
 * All other functionality is separated into service files
 */

/**
 * Handle POST requests - Add new trading records
 * @param {object} e The event object containing the post data
 * @return {GoogleAppsScript.Content.TextOutput} JSON response
 */
function doPost(e) {
  try {
    Logger.log('doPost: Received POST request');
    
    // Validate content type
    if (e.postData.type !== 'application/x-www-form-urlencoded') {
      return createErrorResponse(CONFIG.MESSAGES.ERROR.INVALID_CONTENT_TYPE);
    }

    // Delegate to TradingService
    return TradingService.addTrade(e.parameter);
    
  } catch (error) {
    logError('doPost', error, e.parameter);
    return createErrorResponse(
      `${CONFIG.MESSAGES.ERROR.TRADE_SAVE_FAILED}: ${error.message}`
    );
  }
}

/**
 * Handle GET requests - Retrieve data
 * @param {object} e The event object containing the get parameters
 * @return {GoogleAppsScript.Content.TextOutput} JSON response
 */
function doGet(e) {
  try {
    Logger.log(`doGet: Received GET request with action: ${e.parameter.action}`);
    
    const action = e.parameter.action;
    
    // Route to appropriate service based on action
    switch(action) {
      case 'getAccounts':
        return AccountService.getAccounts();
        
      case 'getAssets':
        return AssetService.getAssets();
        
      case 'getTradingHistory':
        return TradingService.getTradingHistory(e.parameter.accountId);
        
      default:
        return createErrorResponse(CONFIG.MESSAGES.ERROR.INVALID_ACTION);
    }
    
  } catch (error) {
    logError('doGet', error, e.parameter);
    return createErrorResponse(`${CONFIG.MESSAGES.ERROR.DATA_RETRIEVAL_FAILED}: ${error.message}`);
  }
}


