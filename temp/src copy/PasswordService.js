/**
 * Password Hashing and Management Functions
 * Functions for secure password handling with SHA-256 hashing
 * @created 2025-09-27
 */

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
 * @param {string} plainPassword - Plain text password to verify
 * @param {string} email - User's email address  
 * @param {string} empId - Employee ID
 * @returns {boolean} True if password matches
 */
function verifyPassword(plainPassword, email, empId) {
  try {
    // Generate expected hash from email and empId
    const expectedHash = hashPassword(email, empId);
    
    // Check if provided password is already a hash (64 characters)
    if (plainPassword && plainPassword.length === 64) {
      // Compare hashes directly
      return plainPassword === expectedHash;
    } else {
      // Assume it's plain text, hash it and compare
      const plainHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, plainPassword)
                                 .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                                 .join('');
      return plainHash === expectedHash;
    }
    
  } catch (error) {
    console.error('Error verifying password:', error);
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
    
    // Map header names to column indices
    const headerMap = {};
    headers.forEach((header, index) => {
      headerMap[header] = index;
    });
    
    // Get column indices
    const empIdIndex = headerMap['EmpId'];
    const emailIndex = headerMap['Email'];
    const passwordIndex = headerMap['password'];
    
    // Validate required columns exist
    if (empIdIndex === undefined || emailIndex === undefined || passwordIndex === undefined) {
      throw new Error('ไม่พบคอลัมน์ที่จำเป็น (EmpId, Email, password) ในชีต');
    }
    
    let processedCount = 0;
    let errorCount = 0;
    const processedUsers = [];
    
    // Process each user row (skip header row)
    for (let i = 1; i < data.length; i++) {
      try {
        const row = data[i];
        const empId = row[empIdIndex];
        const email = row[emailIndex];
        
        if (!empId || !email) {
          console.warn(`Row ${i + 1}: Missing EmpId or Email, skipping...`);
          errorCount++;
          continue;
        }
        
        // Generate new password hash
        const newPasswordHash = hashPassword(email, empId);
        
        // Update password in the data array
        data[i][passwordIndex] = newPasswordHash;
        
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
    
    // Map headers to indices
    const headerMap = {};
    headers.forEach((header, index) => {
      headerMap[header] = index;
    });
    
    const empIdIndex = headerMap['EmpId'];
    const emailIndex = headerMap['Email'];
    const passwordIndex = headerMap['password'];
    
    // Find user row
    let userRowIndex = -1;
    let userEmail = '';
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][empIdIndex] === empId) {
        userRowIndex = i;
        userEmail = data[i][emailIndex];
        break;
      }
    }
    
    if (userRowIndex === -1) {
      throw new Error(`ไม่พบผู้ใช้ EmpId: ${empId}`);
    }
    
    // Generate new password hash
    const newHash = hashPassword(userEmail, empId);
    
    // Update in sheet
    userSheet.getRange(userRowIndex + 1, passwordIndex + 1).setValue(newHash);
    
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