/**
 * Enhanced Debug Functions for POST Login Issues
 * Add these functions to your TestLogin.js file
 */

/**
 * Debug POST Request Parameters
 * Shows exactly what parameters are received in POST requests
 */
function debugPOSTRequest(e) {
  console.log('🔍 DEBUG POST REQUEST');
  
  const result = {
    status: 'debug',
    message: 'POST Request Debug Information',
    timestamp: new Date().toISOString(),
    debug: {
      // Raw event object info
      hasParameter: !!e.parameter,
      hasParameters: !!e.parameters,
      hasPostData: !!e.postData,
      
      // Parameter keys and values
      parameterKeys: e.parameter ? Object.keys(e.parameter) : [],
      parametersKeys: e.parameters ? Object.keys(e.parameters) : [],
      
      // Actual parameter values (sanitized)
      parameter: e.parameter || {},
      parameters: e.parameters || {},
      
      // POST data info
      postData: e.postData ? {
        type: e.postData.type,
        length: e.postData.length,
        contents: e.postData.contents || '[No contents]'
      } : null,
      
      // Parameter extraction test
      extractionTest: {}
    }
  };
  
  // Test parameter extraction
  const getParam = (name) => {
    if (e.parameters && e.parameters[name]) {
      return e.parameters[name][0];
    }
    if (e.parameter && e.parameter[name]) {
      return e.parameter[name];
    }
    return null;
  };
  
  result.debug.extractionTest = {
    action: getParam('action'),
    username: getParam('username'),
    password: getParam('password') ? '[HIDDEN]' : null
  };
  
  // Sanitize sensitive data
  if (result.debug.parameter && result.debug.parameter.password) {
    result.debug.parameter.password = '[HIDDEN]';
  }
  if (result.debug.parameters && result.debug.parameters.password) {
    result.debug.parameters.password = ['[HIDDEN]'];
  }
  
  console.log('POST Debug Result:', result);
  return result;
}

/**
 * Enhanced Login Test with Full Debug
 * Tests the entire login process with detailed logging
 */
function testLoginWithFullDebug(username, password) {
  console.log('🚀 Testing Login with Full Debug');
  console.log(`Username: ${username}, Password: ${password ? '[PROVIDED]' : '[MISSING]'}`);
  
  const result = {
    status: 'debug',
    message: 'Full Login Debug Process',
    timestamp: new Date().toISOString(),
    steps: [],
    debug: {}
  };
  
  try {
    // Step 1: Test spreadsheet connection
    result.steps.push('1. Testing spreadsheet connection...');
    const spreadsheet = getSpreadsheet();
    if (!spreadsheet) {
      result.status = 'error';
      result.message = 'Cannot connect to spreadsheet';
      return result;
    }
    result.steps.push('✅ Spreadsheet connected');
    
    // Step 2: Test user sheet access
    result.steps.push('2. Testing user sheet access...');
    const userSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.USER);
    if (!userSheet) {
      result.status = 'error';
      result.message = 'Cannot access user sheet';
      return result;
    }
    result.steps.push('✅ User sheet accessible');
    
    // Step 3: Get all user data
    result.steps.push('3. Getting user data...');
    const userData = userSheet.getDataRange().getValues();
    result.debug.totalUsers = userData.length - 1; // Subtract header
    result.steps.push(`✅ Found ${userData.length - 1} users`);
    
    // Step 4: Find specific user
    result.steps.push(`4. Looking for username: ${username}...`);
    let userFound = null;
    for (let i = 1; i < userData.length; i++) {
      const row = userData[i];
      const rowUsername = String(row[1] || '').trim(); // Column B (empId)
      
      if (rowUsername === String(username).trim()) {
        userFound = {
          row: i + 1,
          name: row[0],
          empId: row[1],
          email: row[2],
          password: row[3] ? '[HIDDEN]' : '[EMPTY]',
          role: row[4],
          status: row[5]
        };
        break;
      }
    }
    
    if (!userFound) {
      result.status = 'error';
      result.message = `User not found: ${username}`;
      result.debug.searchedUsername = username;
      result.debug.availableUsernames = userData.slice(1).map(row => String(row[1] || '').trim());
      return result;
    }
    
    result.steps.push('✅ User found');
    result.debug.user = userFound;
    
    // Step 5: Test password hashing
    result.steps.push('5. Testing password hashing...');
    const emailPrefix = userFound.email.split('@')[0];
    const expectedPasswordString = `${emailPrefix}${userFound.empId}`;
    const providedHash = generateSHA256(password);
    const expectedHash = generateSHA256(expectedPasswordString);
    
    result.debug.passwordTest = {
      providedPassword: password,
      expectedPasswordString: expectedPasswordString,
      providedHash: providedHash.substring(0, 10) + '...',
      expectedHash: expectedHash.substring(0, 10) + '...',
      hashMatch: providedHash === expectedHash,
      directPasswordMatch: password === expectedPasswordString
    };
    
    result.steps.push(`✅ Password hashing completed`);
    
    // Step 6: Verify stored password
    result.steps.push('6. Checking stored password format...');
    const storedPassword = userData[userFound.row - 1][3]; // Column D
    result.debug.storedPasswordInfo = {
      hasStoredPassword: !!storedPassword,
      storedPasswordLength: storedPassword ? String(storedPassword).length : 0,
      storedPasswordPreview: storedPassword ? String(storedPassword).substring(0, 10) + '...' : '[EMPTY]',
      matchesProvidedHash: storedPassword === providedHash,
      matchesExpectedHash: storedPassword === expectedHash
    };
    
    // Step 7: Final authentication decision
    result.steps.push('7. Making authentication decision...');
    const isAuthenticated = storedPassword === providedHash || storedPassword === expectedHash;
    
    if (isAuthenticated) {
      result.status = 'success';
      result.message = 'Authentication successful!';
      result.steps.push('✅ Authentication PASSED');
      
      // Generate token for successful authentication
      const token = generateToken();
      result.token = token;
      result.user = {
        empId: userFound.empId,
        name: userFound.name,
        email: userFound.email,
        role: userFound.role
      };
      
    } else {
      result.status = 'error';
      result.message = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      result.steps.push('❌ Authentication FAILED');
    }
    
  } catch (error) {
    result.status = 'error';
    result.message = `Debug error: ${error.message}`;
    result.steps.push(`💥 Error: ${error.message}`);
    console.error('Login debug error:', error);
  }
  
  console.log('Full Debug Result:', result);
  return result;
}

/**
 * Test Direct Authentication Function
 * Bypasses the POST parameter extraction and tests authenticateUser directly
 */
function testDirectAuthentication(username, password) {
  console.log('🎯 Testing Direct Authentication');
  
  try {
    const result = authenticateUser(username, password);
    console.log('Direct Authentication Result:', result);
    return result;
  } catch (error) {
    console.error('Direct Authentication Error:', error);
    return {
      status: 'error',
      message: `Direct authentication error: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}