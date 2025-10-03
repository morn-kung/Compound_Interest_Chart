/**
 * Test Functions - Comprehensive testing suite for all system components
 * Use these functions to verify system functionality before deployment
 */

/**
 * Run all available tests
 * @returns {Object} Complete test results
 */
function runAllTests() {
  console.log('🚀 Starting comprehensive test suite...');
  
  const testResults = {
    timestamp: getCurrentTimestamp(),
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    }
  };
  
  try {
    // Test utility functions
    console.log('📋 Testing utility functions...');
    const utilityTests = testUtilityFunctions();
    testResults.tests.push(utilityTests);
    
    // Test GET functions
    console.log('📖 Testing GET functions...');
    const getTests = testGetFunctions();
    testResults.tests.push(getTests);
    
    // Test account functions
    console.log('👤 Testing account functions...');
    const accountTests = testAccountFunctions();
    testResults.tests.push(accountTests);
    
    // Test asset functions
    console.log('💰 Testing asset functions...');
    const assetTests = testAssetFunctions();
    testResults.tests.push(assetTests);
    
    // Test trading functions
    console.log('📈 Testing trading functions...');
    const tradingTests = testTradingFunctions();
    testResults.tests.push(tradingTests);
    
    // Test POST functionality
    console.log('📝 Testing POST functionality...');
    const postTests = testDoPost();
    testResults.tests.push(postTests);
    
    // Test sheet structure validation
    console.log('📋 Testing sheet structure...');
    const sheetValidation = validateSheetsStructure();
    testResults.tests.push({
      category: 'Sheet Structure Validation',
      results: [{
        test: 'validateSheetsStructure',
        passed: sheetValidation.overallStatus !== 'error',
        result: sheetValidation.message
      }]
    });
    
    // Test sheet headers validation
    console.log('📋 Testing sheet headers...');
    const headerValidation = validateSheetHeaders();
    testResults.tests.push({
      category: 'Sheet Headers Validation',
      results: [{
        test: 'validateSheetHeaders',
        passed: headerValidation.overallStatus !== 'error',
        result: headerValidation.message
      }]
    });
    
    // Test sheet data types validation
    console.log('🔍 Testing sheet data types...');
    const dataTypeValidation = validateSheetDataTypes();
    testResults.tests.push({
      category: 'Sheet Data Types Validation',
      results: [{
        test: 'validateSheetDataTypes',
        passed: dataTypeValidation.overallStatus !== 'error',
        result: dataTypeValidation.message
      }]
    });
    
    // Calculate summary
    testResults.tests.forEach(testGroup => {
      testResults.summary.total += testGroup.results.length;
      testGroup.results.forEach(result => {
        if (result.passed) {
          testResults.summary.passed++;
        } else {
          testResults.summary.failed++;
          testResults.summary.errors.push(`${testGroup.category}: ${result.error}`);
        }
      });
    });
    
    console.log(`✅ Test suite completed: ${testResults.summary.passed}/${testResults.summary.total} passed`);
    return testResults;
    
  } catch (error) {
    console.error('❌ Error running test suite:', error);
    testResults.summary.errors.push(`Test suite error: ${error.toString()}`);
    return testResults;
  }
}

/**
 * Test utility functions
 */
function testUtilityFunctions() {
  const results = [];
  
  // Test UUID generation
  try {
    const uuid = createUUID();
    results.push({
      test: 'createUUID',
      passed: uuid && uuid.length === 36,
      result: uuid
    });
  } catch (error) {
    results.push({
      test: 'createUUID',
      passed: false,
      error: error.toString()
    });
  }
  
  // Test JSON response creation
  try {
    const response = createJSONResponse('success', 'Test message', { data: 'test' });
    results.push({
      test: 'createJSONResponse',
      passed: response.status === 'success' && response.message === 'Test message',
      result: response
    });
  } catch (error) {
    results.push({
      test: 'createJSONResponse',
      passed: false,
      error: error.toString()
    });
  }
  
  // Test safe float parsing
  try {
    const parsed = safeParseFloat('123.45');
    results.push({
      test: 'safeParseFloat',
      passed: parsed === 123.45,
      result: parsed
    });
  } catch (error) {
    results.push({
      test: 'safeParseFloat',
      passed: false,
      error: error.toString()
    });
  }
  
  return {
    category: 'Utility Functions',
    results: results
  };
}

/**
 * Test all GET functions
 */
function testGetFunctions() {
  const results = [];
  
  // Test getAccounts
  try {
    const accounts = getAccounts();
    results.push({
      test: 'getAccounts',
      passed: accounts && accounts.status === 'success',
      result: `Found ${accounts.count} accounts`
    });
  } catch (error) {
    results.push({
      test: 'getAccounts',
      passed: false,
      error: error.toString()
    });
  }
  
  // Test getAssets
  try {
    const assets = getAssets();
    results.push({
      test: 'getAssets',
      passed: assets && assets.status === 'success',
      result: `Found ${assets.count} assets`
    });
  } catch (error) {
    results.push({
      test: 'getAssets',
      passed: false,
      error: error.toString()
    });
  }
  
  return {
    category: 'GET Functions',
    results: results
  };
}

/**
 * Test account-specific functions
 */
function testAccountFunctions() {
  const results = [];
  
  // Get first account for testing
  let testAccountId = null;
  try {
    const accounts = getAccounts();
    if (accounts.status === 'success' && accounts.accounts.length > 0) {
      testAccountId = accounts.accounts[0]['Account ID'];
    }
  } catch (error) {
    console.log('Could not get test account ID');
  }
  
  if (testAccountId) {
    // Test getAccountById
    try {
      const account = getAccountById(testAccountId);
      results.push({
        test: 'getAccountById',
        passed: account && account.status === 'success',
        result: `Found account: ${testAccountId}`
      });
    } catch (error) {
      results.push({
        test: 'getAccountById',
        passed: false,
        error: error.toString()
      });
    }
    
    // Test validateAccountExists
    try {
      const exists = validateAccountExists(testAccountId);
      results.push({
        test: 'validateAccountExists',
        passed: exists === true,
        result: `Account ${testAccountId} exists: ${exists}`
      });
    } catch (error) {
      results.push({
        test: 'validateAccountExists',
        passed: false,
        error: error.toString()
      });
    }
    
    // Test getAccountSummary
    try {
      const summary = getAccountSummary(testAccountId);
      results.push({
        test: 'getAccountSummary',
        passed: summary && summary.status === 'success',
        result: `Got summary for account: ${testAccountId}`
      });
    } catch (error) {
      results.push({
        test: 'getAccountSummary',
        passed: false,
        error: error.toString()
      });
    }
  }
  
  return {
    category: 'Account Functions',
    results: results
  };
}

/**
 * Test asset-specific functions
 */
function testAssetFunctions() {
  const results = [];
  
  // Get first asset for testing
  let testAssetId = null;
  try {
    const assets = getAssets();
    if (assets.status === 'success' && assets.assets.length > 0) {
      testAssetId = assets.assets[0]['Asset ID'];
    }
  } catch (error) {
    console.log('Could not get test asset ID');
  }
  
  if (testAssetId) {
    // Test getAssetById
    try {
      const asset = getAssetById(testAssetId);
      results.push({
        test: 'getAssetById',
        passed: asset && asset.status === 'success',
        result: `Found asset: ${testAssetId}`
      });
    } catch (error) {
      results.push({
        test: 'getAssetById',
        passed: false,
        error: error.toString()
      });
    }
    
    // Test validateAssetExists
    try {
      const exists = validateAssetExists(testAssetId);
      results.push({
        test: 'validateAssetExists',
        passed: exists === true,
        result: `Asset ${testAssetId} exists: ${exists}`
      });
    } catch (error) {
      results.push({
        test: 'validateAssetExists',
        passed: false,
        error: error.toString()
      });
    }
  }
  
  // Test getAssetStatistics
  try {
    const stats = getAssetStatistics();
    results.push({
      test: 'getAssetStatistics',
      passed: stats && stats.status === 'success',
      result: `Got statistics for ${stats.count} assets`
    });
  } catch (error) {
    results.push({
      test: 'getAssetStatistics',
      passed: false,
      error: error.toString()
    });
  }
  
  return {
    category: 'Asset Functions',
    results: results
  };
}

/**
 * Test trading-specific functions
 */
function testTradingFunctions() {
  const results = [];
  
  // Get first account for testing
  let testAccountId = null;
  try {
    const accounts = getAccounts();
    if (accounts.status === 'success' && accounts.accounts.length > 0) {
      testAccountId = accounts.accounts[0]['Account ID'];
    }
  } catch (error) {
    console.log('Could not get test account ID');
  }
  
  if (testAccountId) {
    // Test getTradingHistory
    try {
      const history = getTradingHistory(testAccountId);
      results.push({
        test: 'getTradingHistory',
        passed: history && history.status === 'success',
        result: `Found ${history.count} trades for account ${testAccountId}`
      });
    } catch (error) {
      results.push({
        test: 'getTradingHistory',
        passed: false,
        error: error.toString()
      });
    }
    
    // Test getTradingStatistics
    try {
      const stats = getTradingStatistics(testAccountId);
      results.push({
        test: 'getTradingStatistics',
        passed: stats && stats.status === 'success',
        result: `Got trading statistics for account ${testAccountId}`
      });
    } catch (error) {
      results.push({
        test: 'getTradingStatistics',
        passed: false,
        error: error.toString()
      });
    }
  }
  
  // Test getRecentTrades
  try {
    const recent = getRecentTrades(5);
    results.push({
      test: 'getRecentTrades',
      passed: recent && recent.status === 'success',
      result: `Found ${recent.count} recent trades`
    });
  } catch (error) {
    results.push({
      test: 'getRecentTrades',
      passed: false,
      error: error.toString()
    });
  }
  
  return {
    category: 'Trading Functions',
    results: results
  };
}

/**
 * Test POST functionality (addTrade)
 */
function testDoPost() {
  const results = [];
  
  // Get test data
  let testAccountId = null;
  let testAssetId = null;
  
  try {
    const accounts = getAccounts();
    if (accounts.status === 'success' && accounts.accounts.length > 0) {
      testAccountId = accounts.accounts[0]['Account ID'];
    }
    
    const assets = getAssets();
    if (assets.status === 'success' && assets.assets.length > 0) {
      testAssetId = assets.assets[0]['Asset ID'];
    }
  } catch (error) {
    console.log('Could not get test data for POST test');
  }
  
  if (testAccountId && testAssetId) {
    // Test addTrade
    try {
      const tradeResult = addTrade(
        testAccountId,
        testAssetId,
        1000.00,
        25.50,
        0.05,
        'Test trade from automated testing'
      );
      
      results.push({
        test: 'addTrade',
        passed: tradeResult && tradeResult.status === 'success',
        result: `Added test trade: ${tradeResult.id || 'unknown'}`
      });
    } catch (error) {
      results.push({
        test: 'addTrade',
        passed: false,
        error: error.toString()
      });
    }
  } else {
    results.push({
      test: 'addTrade',
      passed: false,
      error: 'No test data available (accounts or assets)'
    });
  }
  
  return {
    category: 'POST Functions',
    results: results
  };
}

/**
 * Quick connectivity test
 */
function quickTest() {
  console.log('🔧 Running quick connectivity test...');
  
  try {
    const spreadsheet = getSpreadsheet();
    const accounts = getAccounts();
    const assets = getAssets();
    
    return {
      status: 'success',
      message: 'Quick test completed successfully',
      results: {
        spreadsheet: !!spreadsheet,
        accounts: accounts.status === 'success',
        accountCount: accounts.count || 0,
        assets: assets.status === 'success',
        assetCount: assets.count || 0
      }
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Quick test failed',
      error: error.toString()
    };
  }
}

/**
 * Debug sheet data structure
 */
function debugSheetData() {
  console.log('🔍 Debugging sheet data structure...');
  
  const debug = {
    timestamp: getCurrentTimestamp(),
    sheets: {}
  };
  
  Object.values(CONFIG.SHEETS).forEach(sheetName => {
    try {
      const sheet = getSheet(sheetName);
      const values = sheet.getDataRange().getValues();
      
      debug.sheets[sheetName] = {
        exists: true,
        rows: values.length,
        columns: values.length > 0 ? values[0].length : 0,
        headers: values.length > 0 ? values[0] : [],
        sampleData: values.length > 1 ? values[1] : []
      };
    } catch (error) {
      debug.sheets[sheetName] = {
        exists: false,
        error: error.toString()
      };
    }
  });
  
  return debug;
}

/**
 * ตรวจสอบว่า Google Sheets มี sheet ที่จำเป็นครบหรือไม่
 * @returns {Object} ผลการตรวจสอบ sheet structure
 */
// validateSheetsStructure() moved to Services_System.js

// createMissingSheets() moved to Services_System.js

// validateSheetHeaders() moved to Services_System.js

// validateSheetDataTypes() moved to Services_System.js

// validateSheetsComprehensive() moved to Services_System.js

// validateAndFixSheets() moved to Services_System.js