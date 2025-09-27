/**
 * Test Functions for Data Generator Service
 * Test and debug generateTradingDataToYesterday function
 * @created 2025-09-27
 */

/**
 * Test validateAccountExists function
 */
function testValidateAccountExists() {
  console.log("=== Testing validateAccountExists ===");
  
  try {
    const result = validateAccountExists("405911362");
    console.log(`validateAccountExists("405911362"): ${result}`);
    return result;
  } catch (error) {
    console.error("Error in validateAccountExists:", error.toString());
    return false;
  }
}

/**
 * Test findLastRowByAccountId function
 */
function testFindLastRowByAccountId() {
  console.log("=== Testing findLastRowByAccountId ===");
  
  try {
    const result = findLastRowByAccountId("405911362");
    console.log("findLastRowByAccountId result:", result);
    return result;
  } catch (error) {
    console.error("Error in findLastRowByAccountId:", error.toString());
    return null;
  }
}

/**
 * Test addTrade function with a single trade
 */
function testAddSingleTrade() {
  console.log("=== Testing addTrade ===");
  
  try {
    const result = addTrade(
      "405911362",      // accountId
      "1",              // assetId  
      1005.5,           // startBalance
      25.0,             // dailyProfit
      0.05,             // lotSize
      "Test trade",     // notes
      "2025-08-03"      // tradeDate
    );
    
    console.log("addTrade result:", result);
    return result;
  } catch (error) {
    console.error("Error in addTrade:", error.toString());
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Test dependencies required by generateTradingDataToYesterday
 */
function testAllDependencies() {
  console.log("=== Testing All Dependencies for generateTradingDataToYesterday ===");
  
  const results = {
    validateAccountExists: false,
    findLastRowByAccountId: null,
    addTrade: null
  };
  
  try {
    // Test 1: validateAccountExists
    results.validateAccountExists = testValidateAccountExists();
    
    // Test 2: findLastRowByAccountId
    results.findLastRowByAccountId = testFindLastRowByAccountId();
    
    // Test 3: addTrade (only if validation passes)
    if (results.validateAccountExists) {
      results.addTrade = testAddSingleTrade();
    } else {
      console.log("Skipping addTrade test - account validation failed");
    }
    
    console.log("=== Summary ===");
    console.log("All test results:", results);
    
    return results;
    
  } catch (error) {
    console.error("Error in testAllDependencies:", error.toString());
    return { error: error.toString() };
  }
}

/**
 * Test generateTradingDataToYesterday with debugging
 */
function testGenerateTradingDataWithDebug() {
  console.log("=== Testing generateTradingDataToYesterday with Debug ===");
  
  try {
    // First test dependencies
    const depResults = testAllDependencies();
    console.log("Dependencies test results:", depResults);
    
    if (!depResults.validateAccountExists) {
      console.error("❌ Account validation failed - cannot proceed");
      return { status: 'error', message: 'Account validation failed' };
    }
    
    // Now test the main function
    console.log("--- Running generateTradingDataToYesterday ---");
    const result = generateTradingDataToYesterday();
    console.log("generateTradingDataToYesterday result:", result);
    
    return result;
    
  } catch (error) {
    console.error("Error in testGenerateTradingDataWithDebug:", error.toString());
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Simple test to check if basic functions work
 */
function testBasicFunctions() {
  console.log("=== Testing Basic Functions ===");
  
  try {
    // Test sheet access
    console.log("Testing sheet access...");
    const sheet = getSheet(CONFIG.SHEETS.TRADING_JOURNAL);
    console.log("Sheet name:", sheet.getName());
    
    // Test sheet data
    const values = sheet.getDataRange().getValues();
    console.log("Number of rows in sheet:", values.length);
    console.log("Headers:", values[0]);
    
    if (values.length > 1) {
      console.log("Sample data row:", values[1]);
    }
    
    return {
      sheetAccess: true,
      rowCount: values.length,
      headers: values[0]
    };
    
  } catch (error) {
    console.error("Error in testBasicFunctions:", error.toString());
    return { error: error.toString() };
  }
}