/**
 * Test Functions
 * Contains all testing and debugging functions
 */

/**
 * Test all GET functions
 */
function testGetFunctions() {
  Logger.log("=== Testing All GET Functions ===");
  
  Logger.log("=== Testing AccountService.getAccounts ===");
  const accountsResult = AccountService.getAccounts();
  Logger.log("Accounts result: " + accountsResult.getContent());
  
  Logger.log("=== Testing AssetService.getAssets ===");
  const assetsResult = AssetService.getAssets();
  Logger.log("Assets result: " + assetsResult.getContent());
  
  Logger.log("=== Testing TradingService.getTradingHistory ===");
  const historyResult = TradingService.getTradingHistory("405911362");
  Logger.log("Trading history result: " + historyResult.getContent());
  
  Logger.log("=== All GET Tests Completed ===");
}

/**
 * Test POST function (add new trade)
 */
function testAddNewTrade() {
  Logger.log("=== Testing TradingService.addTrade ===");
  
  const testTradeData = {
    accountId: "405911362",
    assetId: "2",
    startBalance: "990.00",
    dailyProfit: "15.50",
    lotSize: "0.02",
    notes: "Test trade from TestFunctions.js"
  };
  
  const result = TradingService.addTrade(testTradeData);
  Logger.log("Add trade result: " + result.getContent());
  
  // Parse and log the response
  const response = JSON.parse(result.getContent());
  Logger.log("Status: " + response.status);
  if (response.status === 'success') {
    Logger.log("Transaction ID: " + response.id);
    Logger.log("End Balance: " + response.endBalance);
  }
}

/**
 * Test doPost function with mock event
 */
function testDoPost() {
  Logger.log("=== Testing doPost Function ===");
  
  const testData = {
    accountId: "405911362",
    assetId: "1",
    startBalance: "1000.00",
    dailyProfit: "25.75",
    lotSize: "0.03",
    notes: "Test trade from doPost simulation"
  };
  
  const mockEvent = {
    parameter: testData,
    postData: {
      type: 'application/x-www-form-urlencoded',
      contents: ''
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log("doPost result: " + result.getContent());
}

/**
 * Test doGet function with different actions
 */
function testDoGet() {
  Logger.log("=== Testing doGet Function ===");
  
  // Test getAccounts
  Logger.log("--- Testing doGet with action=getAccounts ---");
  let mockEvent = {
    parameter: { action: 'getAccounts' }
  };
  let result = doGet(mockEvent);
  Logger.log("getAccounts result: " + result.getContent());
  
  // Test getAssets
  Logger.log("--- Testing doGet with action=getAssets ---");
  mockEvent = {
    parameter: { action: 'getAssets' }
  };
  result = doGet(mockEvent);
  Logger.log("getAssets result: " + result.getContent());
  
  // Test getTradingHistory
  Logger.log("--- Testing doGet with action=getTradingHistory ---");
  mockEvent = {
    parameter: { 
      action: 'getTradingHistory',
      accountId: '405911362'
    }
  };
  result = doGet(mockEvent);
  Logger.log("getTradingHistory result: " + result.getContent());
  
  // Test invalid action
  Logger.log("--- Testing doGet with invalid action ---");
  mockEvent = {
    parameter: { action: 'invalidAction' }
  };
  result = doGet(mockEvent);
  Logger.log("Invalid action result: " + result.getContent());
}

/**
 * Test account-specific functions
 */
function testAccountFunctions() {
  Logger.log("=== Testing Account Functions ===");
  
  const accountId = "405911362";
  
  // Test getAccountById
  Logger.log("--- Testing AccountService.getAccountById ---");
  const account = AccountService.getAccountById(accountId);
  Logger.log("Account found: " + JSON.stringify(account));
  
  // Test validateAccountExists
  Logger.log("--- Testing AccountService.validateAccountExists ---");
  const exists = AccountService.validateAccountExists(accountId);
  Logger.log("Account exists: " + exists);
  
  // Test getAccountSummary
  Logger.log("--- Testing AccountService.getAccountSummary ---");
  const summary = AccountService.getAccountSummary(accountId);
  Logger.log("Account summary: " + JSON.stringify(summary));
}

/**
 * Test asset-specific functions
 */
function testAssetFunctions() {
  Logger.log("=== Testing Asset Functions ===");
  
  const assetId = "1";
  
  // Test getAssetById
  Logger.log("--- Testing AssetService.getAssetById ---");
  const asset = AssetService.getAssetById(assetId);
  Logger.log("Asset found: " + JSON.stringify(asset));
  
  // Test validateAssetExists
  Logger.log("--- Testing AssetService.validateAssetExists ---");
  const exists = AssetService.validateAssetExists(assetId);
  Logger.log("Asset exists: " + exists);
  
  // Test getAssetsByType
  Logger.log("--- Testing AssetService.getAssetsByType ---");
  const cryptoAssets = AssetService.getAssetsByType("Crypto");
  Logger.log("Crypto assets: " + JSON.stringify(cryptoAssets));
  
  // Test getAssetStatistics
  Logger.log("--- Testing AssetService.getAssetStatistics ---");
  const stats = AssetService.getAssetStatistics(assetId);
  Logger.log("Asset statistics: " + JSON.stringify(stats));
}

/**
 * Test trading statistics
 */
function testTradingStatistics() {
  Logger.log("=== Testing Trading Statistics ===");
  
  const accountId = "405911362";
  
  const stats = TradingService.getTradingStatistics(accountId);
  Logger.log("Trading statistics: " + JSON.stringify(stats));
  
  const recentTrades = TradingService.getRecentTrades(accountId, 5);
  Logger.log(`Recent trades (${recentTrades.length}): ` + JSON.stringify(recentTrades));
}

/**
 * Test utility functions
 */
function testUtilityFunctions() {
  Logger.log("=== Testing Utility Functions ===");
  
  // Test createUUID
  Logger.log("--- Testing createUUID ---");
  const uuid = createUUID();
  Logger.log("Generated UUID: " + uuid);
  
  // Test safeParseFloat
  Logger.log("--- Testing safeParseFloat ---");
  Logger.log("safeParseFloat('123.45'): " + safeParseFloat('123.45'));
  Logger.log("safeParseFloat('invalid'): " + safeParseFloat('invalid'));
  Logger.log("safeParseFloat('invalid', 100): " + safeParseFloat('invalid', 100));
  
  // Test formatNumber
  Logger.log("--- Testing formatNumber ---");
  Logger.log("formatNumber(123.456789): " + formatNumber(123.456789));
  Logger.log("formatNumber(123.456789, 3): " + formatNumber(123.456789, 3));
  
  // Test validateRequiredParams
  Logger.log("--- Testing validateRequiredParams ---");
  const params = { name: "test", age: 25, email: "" };
  const requiredFields = ["name", "age", "email", "phone"];
  const validation = validateRequiredParams(params, requiredFields);
  Logger.log("Validation result: " + JSON.stringify(validation));
}

/**
 * Run all tests
 */
function runAllTests() {
  Logger.log("🚀 === RUNNING ALL TESTS === 🚀");
  
  try {
    testUtilityFunctions();
    testAccountFunctions();
    testAssetFunctions();
    testTradingStatistics();
    testGetFunctions();
    testDoGet();
    testAddNewTrade();
    testDoPost();
    
    Logger.log("✅ === ALL TESTS COMPLETED SUCCESSFULLY === ✅");
  } catch (error) {
    Logger.log("❌ === TEST FAILED === ❌");
    logError('runAllTests', error);
  }
}

/**
 * Quick test for debugging
 */
function quickTest() {
  Logger.log("🔍 === QUICK TEST === 🔍");
  
  // Test basic connectivity
  const accounts = AccountService.getAccounts();
  Logger.log("Quick test result: " + accounts.getContent());
}