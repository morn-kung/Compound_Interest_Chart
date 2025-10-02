/**
 * Password Hashing and Management Functions
 * Functions for secure password handling with SHA-256 hashing
 * @created 2025-09-27
 */

/**
 * Generate password hash from email and employee ID
 * @param {string} email - User's email address
 * @param {string} empId - Emp  } catch (error) {
    console.error('Error generating password for user:', error);
    return createJSONResponse('error', `เกิดข้อผิดพลาด: ${error.toString()}`);
  }
}

/**
 * Test temporary password login flow
 * @param {string} empId - Employee ID to test
 * @returns {Object} Test result
 */
function testTemporaryPasswordLogin(empId) {
  try {
    console.log(`🧪 Testing temporary password login for empId: ${empId}`);
    
    const result = {
      status: 'test',
      message: 'Temporary Password Login Test',
      empId: empId,
      tests: [],
      timestamp: new Date().toISOString()
    };
    
    // Test 1: Check current password status
    result.tests.push('📋 Test 1: Check current password status');
    const passwordStatus = checkTemporaryPasswordStatus(empId);
    result.passwordStatus = passwordStatus;
    result.tests.push(`✅ Password status: ${passwordStatus.passwordStatus || 'unknown'}`);
    
    // Test 2: Get user data
    result.tests.push('📋 Test 2: Get user data from sheet');
    const userSheet = getSheet(CONFIG.SHEETS.USER);
    const userData = userSheet.getDataRange().getValues();
    
    let userRow = null;
    for (let i = 1; i < userData.length; i++) {
      if (String(userData[i][CONFIG.COLUMNS.USER.EMP_ID]) === String(empId)) {
        userRow = userData[i];
        break;
      }
    }
    
    if (!userRow) {
      result.status = 'error';
      result.message = `User not found: ${empId}`;
      return result;
    }
    
    const email = userRow[CONFIG.COLUMNS.USER.EMAIL];
    const storedHash = userRow[CONFIG.COLUMNS.USER.PASSWORD];
    
    result.userInfo = {
      empId: empId,
      email: email,
      storedHash: storedHash ? storedHash.substring(0, 10) + '...' : '[EMPTY]'
    };
    result.tests.push(`✅ User found: ${email}`);
    
    // Test 3: Generate expected hashes
    result.tests.push('📋 Test 3: Generate expected hashes');
    
    // Regular password hash
    const regularPassword = email.split('@')[0] + empId;
    const regularHash = hashPassword(email, empId);
    
    // Temporary password hash
    const tempPasswordHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'Init4321')
                                     .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                                     .join('');
    
    result.hashes = {
      regularPassword: regularPassword,
      regularHash: regularHash,
      tempPasswordHash: tempPasswordHash,
      storedHash: storedHash,
      usingTempPassword: storedHash === tempPasswordHash,
      usingRegularPassword: storedHash === regularHash
    };
    
    result.tests.push(`🔍 Regular password would be: ${regularPassword}`);
    result.tests.push(`🔍 Stored hash matches temp password: ${storedHash === tempPasswordHash}`);
    result.tests.push(`🔍 Stored hash matches regular password: ${storedHash === regularHash}`);
    
    // Test 4: Test verifyPassword function
    result.tests.push('📋 Test 4: Test verifyPassword function');
    
    const tempPasswordTest = verifyPassword('Init4321', email, empId, true);
    const regularPasswordTest = verifyPassword(regularPassword, email, empId, true);
    
    result.verificationTests = {
      tempPasswordVerifies: tempPasswordTest,
      regularPasswordVerifies: regularPasswordTest
    };
    
    result.tests.push(`🔐 Init4321 verifies: ${tempPasswordTest}`);
    result.tests.push(`🔐 Regular password (${regularPassword}) verifies: ${regularPasswordTest}`);
    
    // Test 5: Test authentication
    result.tests.push('📋 Test 5: Test authentication');
    
    const authTestTemp = authenticateUser(String(empId), 'Init4321');
    const authTestRegular = authenticateUser(String(empId), regularPassword);
    
    result.authenticationTests = {
      tempPasswordAuth: {
        status: authTestTemp.status,
        message: authTestTemp.message
      },
      regularPasswordAuth: {
        status: authTestRegular.status,
        message: authTestRegular.message
      }
    };
    
    result.tests.push(`🚀 Auth with Init4321: ${authTestTemp.status}`);
    result.tests.push(`🚀 Auth with regular password: ${authTestRegular.status}`);
    
    // Summary
    result.summary = {
      userFound: !!userRow,
      usingTempPassword: storedHash === tempPasswordHash,
      tempPasswordWorks: tempPasswordTest && authTestTemp.status === 'success',
      regularPasswordWorks: regularPasswordTest && authTestRegular.status === 'success'
    };
    
    return result;
    
  } catch (error) {
    console.error('Error testing temporary password login:', error);
    return createJSONResponse('error', `Test failed: ${error.toString()}`);
  }
}

/**
 * Generate password hash from email and employee ID
 * @param {string} email - User's email address
 * @param {string} empId - Employee ID
 * @returns {string} SHA-256 hash of emailPrefix + empId
 */
function hashPassword(email, empId) {
  try {
    // Extract the part of the email before the "@" symbol
    const emailPrefix = email.split('@')[0];
    
    // Combine the email prefix and the employee ID
    const passwordString = emailPrefix + empId;
    
    // Generate SHA-256 hash
    const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, passwordString)
                          .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                          .join('');
    
    console.log(`Generated hash for ${email} (${empId}): ${hash.substring(0, 10)}...`);
    return hash;
    
  } catch (error) {
    console.error('Error generating password hash:', error);
    throw new Error('ไม่สามารถสร้าง password hash ได้');
  }
}

/**
 * Verify if a plain password matches the expected hash
 * Supports both regular passwords and temporary password (Init4321)
 * @param {string} plainPassword - Plain text password to verify
 * @param {string} email - User's email address  
 * @param {string} empId - Employee ID
 * @param {boolean} checkTempPassword - Optional: check temporary password first
 * @returns {boolean} True if password matches
 */
function verifyPassword(plainPassword, email, empId, checkTempPassword = true) {
  try {
    // DEBUG: Log incoming parameters
    console.log('🔐 verifyPassword DEBUG:', {
      plainPassword: plainPassword ? `[${plainPassword.length} chars]` : 'null',
      email: email,
      empId: empId,
      checkTempPassword: checkTempPassword,
      timestamp: new Date().toISOString()
    });
    
    // *** STEP 1: Check temporary password first (SAP Style) ***
    if (checkTempPassword && plainPassword === 'Init4321') {
      const tempPasswordHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'Init4321')
                                         .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                                         .join('');
      console.log('🔑 Checking temporary password Init4321');
      console.log('🔍 Temp password hash:', tempPasswordHash);
      
      // Check if user is using temporary password by checking stored hash
      try {
        const userSheet = getSheet(CONFIG.SHEETS.USER);
        const userData = userSheet.getDataRange().getValues();
        
        for (let i = 1; i < userData.length; i++) {
          if (String(userData[i][CONFIG.COLUMNS.USER.EMP_ID]) === String(empId)) {
            const storedHash = userData[i][CONFIG.COLUMNS.USER.PASSWORD];
            const tempPasswordFlag = userData[i][CONFIG.COLUMNS.USER.TEMP_PASSWORD];
            
            console.log('🔍 Found user row:', {
              empId: empId,
              storedHash: storedHash ? storedHash.substring(0, 10) + '...' : '[EMPTY]',
              tempPasswordFlag: tempPasswordFlag,
              tempHashMatch: storedHash === tempPasswordHash
            });
            
            if (storedHash === tempPasswordHash) {
              console.log('✅ Temporary password Init4321 matched!');
              return true;
            }
            break;
          }
        }
      } catch (tempError) {
        console.warn('⚠️ Error checking temporary password:', tempError);
      }
    }
    
    // *** STEP 2: Regular password verification ***
    console.log('🔍 Checking regular password...');
    
    // Generate expected hash from email and empId (regular password)
    const expectedHash = hashPassword(email, empId);
    console.log('🔍 Expected regular hash:', expectedHash);
    
    // Check if provided password is already a hash (64 characters)
    if (plainPassword && plainPassword.length === 64) {
      // Compare hashes directly
      console.log('📝 Comparing hash directly');
      const result = plainPassword === expectedHash;
      console.log('✅ Hash comparison result:', result);
      return result;
    } else {
      // Assume it's plain text, hash it and compare
      console.log('📝 Hashing plain text password');
      const plainHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, plainPassword)
                                 .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                                 .join('');
      console.log('🔍 Plain text hash:', plainHash);
      const result = plainHash === expectedHash;
      console.log('✅ Plain text comparison result:', result);
      return result;
    }
    
  } catch (error) {
    console.error('❌ Error verifying password:', error);
    return false;
  }
}

/**
 * Renew all passwords in the user sheet with secure hashing
 * Similar to the original renew_password function but with improved error handling
 * @returns {Object} Operation result
 */
function renewAllPasswords() {
  try {
    console.log('🔐 Starting password renewal process...');
    
    const spreadsheet = getSpreadsheetSafely();
    const userSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.USER);
    
    if (!userSheet) {
      throw new Error(`ไม่พบชีต "${CONFIG.SHEETS.USER}"`);
    }
    
    // Get all data from the user sheet
    const dataRange = userSheet.getDataRange();
    const data = dataRange.getValues();
    
    if (data.length <= 1) {
      return createJSONResponse('warning', 'ไม่พบข้อมูลผู้ใช้ในชีต');
    }
    
    const headers = data[0]; // First row is headers
    
    // No need for headerMap anymore - using CONFIG constants
    
    let processedCount = 0;
    let errorCount = 0;
    const processedUsers = [];
    
    // Process each user row (skip header row)
    for (let i = 1; i < data.length; i++) {
      try {
        const row = data[i];
        const empId = row[CONFIG.COLUMNS.USER.EMP_ID];
        const email = row[CONFIG.COLUMNS.USER.EMAIL];
        
        if (!empId || !email) {
          console.warn(`Row ${i + 1}: Missing EmpId or Email, skipping...`);
          errorCount++;
          continue;
        }
        
        // Generate new password hash
        const newPasswordHash = hashPassword(email, empId);
        
        // Update password in the data array
        data[i][CONFIG.COLUMNS.USER.PASSWORD] = newPasswordHash;
        
        processedUsers.push({
          row: i + 1,
          empId: empId,
          email: email,
          hashGenerated: true
        });
        
        processedCount++;
        
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        errorCount++;
      }
    }
    
    // Write updated data back to sheet
    if (processedCount > 0) {
      dataRange.setValues(data);
      console.log(`✅ Updated ${processedCount} passwords successfully`);
    }
    
    const result = {
      totalRows: data.length - 1, // Exclude header
      processed: processedCount,
      errors: errorCount,
      processedUsers: processedUsers
    };
    
    let status = 'success';
    let message = `สร้างรหัสผ่านใหม่เรียบร้อยแล้ว (${processedCount} users)`;
    
    if (errorCount > 0) {
      status = processedCount > 0 ? 'warning' : 'error';
      message += ` พบข้อผิดพลาด ${errorCount} รายการ`;
    }
    
    return createJSONResponse(status, message, result);
    
  } catch (error) {
    logError('renewAllPasswords', error);
    return createJSONResponse('error', `เกิดข้อผิดพลาด: ${error.toString()}`);
  }
}

/**
 * Check if user is currently using temporary password
 * @param {string} empId - Employee ID
 * @returns {Object} Temporary password status
 */
function checkTemporaryPasswordStatus(empId) {
  try {
    console.log(`🔍 Checking temporary password status for user: ${empId}`);
    
    const userSheet = getSheet(CONFIG.SHEETS.USER);
    const userData = userSheet.getDataRange().getValues();
    
    for (let i = 1; i < userData.length; i++) {
      if (String(userData[i][CONFIG.COLUMNS.USER.EMP_ID]) === String(empId)) {
        const tempPasswordFlag = userData[i][CONFIG.COLUMNS.USER.TEMP_PASSWORD];
        const requirePasswordChange = userData[i][CONFIG.COLUMNS.USER.REQUIRE_PASSWORD_CHANGE];
        const storedHash = userData[i][CONFIG.COLUMNS.USER.PASSWORD];
        
        // Generate temporary password hash for comparison
        const tempPasswordHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'Init4321')
                                           .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                                           .join('');
        
        return {
          found: true,
          empId: empId,
          tempPasswordFlag: tempPasswordFlag,
          requirePasswordChange: requirePasswordChange,
          usingTempPassword: storedHash === tempPasswordHash,
          passwordStatus: storedHash === tempPasswordHash ? 'temporary' : 'regular'
        };
      }
    }
    
    return { found: false, empId: empId };
    
  } catch (error) {
    console.error('Error checking temporary password status:', error);
    return { found: false, empId: empId, error: error.toString() };
  }
}

/**
 * Generate password for a specific user
 * @param {string} empId - Employee ID
 * @param {string} email - User's email
 * @returns {Object} Generated password result
 */
function generateUserPassword(empId, email) {
  try {
    console.log(`🔑 Generating password for user: ${empId}`);
    
    if (!empId || !email) {
      throw new Error('EmpId และ Email จำเป็นต้องระบุ');
    }
    
    const hash = hashPassword(email, empId);
    
    return createJSONResponse('success', 'สร้าง password hash สำเร็จ', {
      empId: empId,
      email: email,
      emailPrefix: email.split('@')[0],
      passwordHash: hash,
      hashLength: hash.length
    });
    
  } catch (error) {
    console.error('Error generating user password:', error);
    return createJSONResponse('error', `เกิดข้อผิดพลาด: ${error.toString()}`);
  }
}

/**
 * Test password hashing functions
 * @returns {Object} Test results
 */
function testPasswordHashing() {
  try {
    console.log('🧪 Testing password hashing functions...');
    
    const testCases = [
      { empId: '1102', email: 'weerachai.in@example.com' },
      { empId: 'likit001', email: 'likit@example.com' },
      { empId: 'user001', email: 'user1@example.com' }
    ];
    
    const results = [];
    
    testCases.forEach((testCase, index) => {
      console.log(`\n--- Test Case ${index + 1} ---`);
      console.log(`EmpId: ${testCase.empId}, Email: ${testCase.email}`);
      
      try {
        // Generate hash
        const hash = hashPassword(testCase.email, testCase.empId);
        
        // Test verification with the generated hash
        const verification1 = verifyPassword(hash, testCase.email, testCase.empId);
        
        // Test verification with wrong hash
        const verification2 = verifyPassword('wronghash', testCase.email, testCase.empId);
        
        console.log(`Generated hash: ${hash.substring(0, 16)}...`);
        console.log(`Hash verification: ${verification1 ? '✅' : '❌'}`);
        console.log(`Wrong hash rejection: ${!verification2 ? '✅' : '❌'}`);
        
        results.push({
          testCase: index + 1,
          empId: testCase.empId,
          email: testCase.email,
          emailPrefix: testCase.email.split('@')[0],
          hash: hash,
          hashVerification: verification1,
          wrongHashRejection: !verification2,
          passed: verification1 && !verification2
        });
        
      } catch (error) {
        console.error(`Test case ${index + 1} failed:`, error);
        results.push({
          testCase: index + 1,
          empId: testCase.empId,
          email: testCase.email,
          error: error.toString(),
          passed: false
        });
      }
    });
    
    const summary = {
      totalTests: testCases.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length
    };
    
    console.log('\n=== HASHING TEST SUMMARY ===');
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    
    return createJSONResponse('success', 'Password hashing tests completed', {
      summary: summary,
      testResults: results
    });
    
  } catch (error) {
    console.error('Error running password hashing tests:', error);
    return createJSONResponse('error', `เกิดข้อผิดพลาดในการทดสอบ: ${error.toString()}`);
  }
}

/**
 * Update a specific user's password
 * @param {string} empId - Employee ID to update
 * @returns {Object} Update result
 */
function updateUserPassword(empId) {
  try {
    console.log(`🔄 Updating password for user: ${empId}`);
    
    if (!empId) {
      throw new Error('EmpId จำเป็นต้องระบุ');
    }
    
    const spreadsheet = getSpreadsheetSafely();
    const userSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.USER);
    
    if (!userSheet) {
      throw new Error(`ไม่พบชีต "${CONFIG.SHEETS.USER}"`);
    }
    
    const data = userSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Using CONFIG constants instead of headerMap
    
    // Find user row
    let userRowIndex = -1;
    let userEmail = '';
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][CONFIG.COLUMNS.USER.EMP_ID] === empId) {
        userRowIndex = i;
        userEmail = data[i][CONFIG.COLUMNS.USER.EMAIL];
        break;
      }
    }
    
    if (userRowIndex === -1) {
      throw new Error(`ไม่พบผู้ใช้ EmpId: ${empId}`);
    }
    
    // Generate new password hash
    const newHash = hashPassword(userEmail, empId);
    
    // Update in sheet
    userSheet.getRange(userRowIndex + 1, CONFIG.COLUMNS.USER.PASSWORD + 1).setValue(newHash);
    
    console.log(`✅ Updated password for user ${empId}`);
    
    return createJSONResponse('success', `อัพเดตรหัสผ่านสำหรับ ${empId} เรียบร้อยแล้ว`, {
      empId: empId,
      email: userEmail,
      rowUpdated: userRowIndex + 1,
      newHashLength: newHash.length
    });
    
  } catch (error) {
    logError('updateUserPassword', error, { empId });
    return createJSONResponse('error', `เกิดข้อผิดพลาด: ${error.toString()}`);
  }
}

/**
 * Enhanced debug function for Test Mode - Deep analysis of password issues
 * @param {string} empId - Employee ID to analyze
 * @param {string} password - Password to test
 * @returns {Object} Comprehensive debug information
 */
function debugPasswordIssues(empId, password) {
  try {
    console.log(`🧪 TEST MODE - Deep Password Analysis for empId: ${empId}`);
    
    const result = {
      status: 'debug',
      message: 'Deep Password Analysis (Test Mode)',
      empId: empId,
      providedPassword: password,
      analysis: {},
      recommendations: [],
      timestamp: new Date().toISOString()
    };
    
    // Step 1: Get user data from sheet
    const userSheet = getSheet(CONFIG.SHEETS.USER);
    const userData = userSheet.getDataRange().getValues();
    
    let userRow = null;
    let userRowIndex = -1;
    
    for (let i = 1; i < userData.length; i++) {
      if (String(userData[i][CONFIG.COLUMNS.USER.EMP_ID]) === String(empId)) {
        userRow = userData[i];
        userRowIndex = i;
        break;
      }
    }
    
    if (!userRow) {
      result.analysis.userFound = false;
      result.recommendations.push(`User with empId "${empId}" not found in sheet`);
      return result;
    }
    
    const email = userRow[CONFIG.COLUMNS.USER.EMAIL];
    const storedHash = userRow[CONFIG.COLUMNS.USER.PASSWORD];
    const tempPasswordFlag = userRow[CONFIG.COLUMNS.USER.TEMP_PASSWORD];
    const requirePasswordChange = userRow[CONFIG.COLUMNS.USER.REQUIRE_PASSWORD_CHANGE];
    
    result.analysis.userFound = true;
    result.analysis.userInfo = {
      empId: empId,
      email: email,
      tempPasswordFlag: tempPasswordFlag,
      requirePasswordChange: requirePasswordChange,
      storedHashPreview: storedHash ? storedHash.substring(0, 10) + '...' : '[EMPTY]'
    };
    
    // Step 2: Generate all possible password hashes
    const emailPrefix = email.split('@')[0];
    const regularPasswordString = emailPrefix + empId;
    
    const hashes = {
      providedPasswordHash: Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
                                     .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                                     .join(''),
      regularPasswordHash: hashPassword(email, empId),
      tempPasswordHash: Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'Init4321')
                                 .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                                 .join(''),
      storedHash: storedHash
    };
    
    result.analysis.passwordStrings = {
      provided: password,
      expectedRegular: regularPasswordString,
      expectedTemp: 'Init4321'
    };
    
    result.analysis.hashes = hashes;
    
    // Step 3: Compare hashes
    const matches = {
      providedMatchesStored: hashes.providedPasswordHash === hashes.storedHash,
      regularMatchesStored: hashes.regularPasswordHash === hashes.storedHash,
      tempMatchesStored: hashes.tempPasswordHash === hashes.storedHash,
      providedMatchesRegular: hashes.providedPasswordHash === hashes.regularPasswordHash,
      providedMatchesTemp: hashes.providedPasswordHash === hashes.tempPasswordHash
    };
    
    result.analysis.matches = matches;
    
    // Step 4: Provide recommendations
    if (!matches.providedMatchesStored) {
      result.recommendations.push('❌ Provided password does not match stored hash');
      
      if (matches.tempMatchesStored) {
        if (password !== 'Init4321') {
          result.recommendations.push('🔑 User has temp password. Try password: Init4321');
        } else {
          result.recommendations.push('🔄 User should be using Init4321 but verification failed');
        }
      } else if (matches.regularMatchesStored) {
        result.recommendations.push(`🔐 User has regular password. Try password: ${regularPasswordString}`);
      } else {
        result.recommendations.push('⚠️ Stored hash does not match any expected password');
        result.recommendations.push(`📝 To fix: Update stored hash to one of the following:`);
        result.recommendations.push(`   - For temp password: ${hashes.tempPasswordHash}`);
        result.recommendations.push(`   - For regular password: ${hashes.regularPasswordHash}`);
      }
    } else {
      result.recommendations.push('✅ Password verification should succeed');
    }
    
    // Step 5: Test actual verification
    const verificationTest = verifyPassword(password, email, empId, true);
    result.analysis.actualVerification = verificationTest;
    
    if (verificationTest !== matches.providedMatchesStored) {
      result.recommendations.push('⚠️ Verification logic inconsistency detected');
    }
    
    return result;
    
  } catch (error) {
    console.error('Error in debugPasswordIssues:', error);
    return createJSONResponse('error', `Debug analysis failed: ${error.toString()}`);
  }
}