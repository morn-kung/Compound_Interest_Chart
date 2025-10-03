/**
 * Test Login Functions - Server Side Debugging
 * ไฟล์นี้จะใส่ใน GAS เพื่อทดสอบการทำงานของ Login จากฝั่ง Server
 * @created 2025-09-28
 */

/**
 * ทดสอบการเข้าถึงข้อมูลใน Sheet user
 * @returns {Object} ข้อมูลทั้งหมดจาก Sheet user
 */
function testGetUserData() {
  try {
    console.log('🔍 Testing getUserData...');
    
    const sheet = getSheet(CONFIG.SHEETS.USER);
    if (!sheet) {
      return { error: 'ไม่พบ Sheet user' };
    }
    
    const values = sheet.getDataRange().getValues();
    console.log('📊 Sheet data rows:', values.length);
    
    if (values.length <= 1) {
      return { 
        error: 'ไม่มีข้อมูลใน Sheet user',
        headers: values[0] || [],
        rowCount: values.length 
      };
    }
    
    const headers = values[0];
    const users = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const user = {
        rowIndex: i + 1,
        empId: row[0],
        empIdType: typeof row[0],
        fullName: row[1],
        email: row[2],
        role: row[3],
        status: row[4],
        statusType: typeof row[4],
        passwordHash: row[5] ? row[5].substring(0, 10) + '...' : 'ไม่มี password',
        passwordLength: row[5] ? row[5].length : 0
      };
      users.push(user);
    }
    
    return {
      success: true,
      sheetName: CONFIG.SHEETS.USER,
      headers: headers,
      totalRows: values.length,
      userCount: users.length,
      users: users,
      columnMapping: CONFIG.COLUMNS.USER
    };
    
  } catch (error) {
    console.error('❌ Error in testGetUserData:', error);
    return { 
      error: error.toString(),
      stack: error.stack 
    };
  }
}

/**
 * ทดสอบการค้นหา User ด้วย username
 * @param {string} username - Username ที่ต้องการค้นหา
 * @returns {Object} ผลการค้นหา
 */
function testFindUser(username = '4498') {
  try {
    console.log('🔍 Testing findUser with username:', username);
    
    const sheet = getSheet(CONFIG.SHEETS.USER);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) {
      return { error: 'ไม่มีข้อมูลใน Sheet user' };
    }
    
    const results = [];
    
    // ทดสอบหาผู้ใช้ด้วยวิธีต่าง ๆ
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const empId = row[0];
      const email = row[2];
      const status = row[4];
      
      const matchTests = {
        empIdExact: empId === username,
        empIdString: String(empId) === String(username),
        empIdNumber: Number(empId) === Number(username),
        emailMatch: email === username,
        statusActive: status === 1,
        statusActiveString: String(status) === '1'
      };
      
      if (matchTests.empIdExact || matchTests.empIdString || matchTests.emailMatch) {
        results.push({
          rowIndex: i + 1,
          empId: empId,
          empIdType: typeof empId,
          email: email,
          status: status,
          statusType: typeof status,
          matchTests: matchTests,
          wouldMatch: (matchTests.empIdExact || matchTests.empIdString || matchTests.emailMatch) && matchTests.statusActive
        });
      }
    }
    
    return {
      success: true,
      searchUsername: username,
      searchUsernameType: typeof username,
      matchingUsers: results,
      totalMatches: results.length
    };
    
  } catch (error) {
    console.error('❌ Error in testFindUser:', error);
    return { 
      error: error.toString(),
      stack: error.stack 
    };
  }
}

/**
 * ทดสอบการ verify password
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object} ผลการทดสอบ
 */
function testVerifyPassword(username = '4498', password = 'likit.se4498') {
  try {
    console.log('🔐 Testing verifyPassword...');
    
    // หาข้อมูล user ก่อน
    const sheet = getSheet(CONFIG.SHEETS.USER);
    const values = sheet.getDataRange().getValues();
    
    let targetUser = null;
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const empId = row[0];
      const email = row[2];
      
      if (String(empId) === String(username) || email === username) {
        targetUser = {
          empId: empId,
          email: email,
          storedHash: row[5],
          status: row[4]
        };
        break;
      }
    }
    
    if (!targetUser) {
      return { 
        error: 'ไม่พบ user',
        searchUsername: username,
        searchUsernameType: typeof username
      };
    }
    
    // ทดสอบการสร้าง hash
    const emailPrefix = targetUser.email.split('@')[0];
    const expectedPasswordString = emailPrefix + targetUser.empId;
    
    console.log('📝 Password string should be:', expectedPasswordString);
    
    // สร้าง hash ที่คาดหวัง
    const expectedHash = hashPassword(targetUser.email, targetUser.empId);
    
    // ทดสอบ verifyPassword function
    const verifyResult = verifyPassword(password, targetUser.email, targetUser.empId);
    
    // ทดสอบการ hash password ที่ส่งเข้ามา
    const inputHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
                               .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                               .join('');
    
    return {
      success: true,
      targetUser: {
        empId: targetUser.empId,
        email: targetUser.email,
        status: targetUser.status,
        storedHashPreview: targetUser.storedHash ? targetUser.storedHash.substring(0, 20) + '...' : 'ไม่มี'
      },
      passwordTests: {
        inputPassword: password,
        expectedPasswordString: expectedPasswordString,
        expectedHash: expectedHash,
        storedHash: targetUser.storedHash,
        inputPasswordHash: inputHash,
        hashesMatch: expectedHash === targetUser.storedHash,
        inputHashMatch: inputHash === targetUser.storedHash,
        verifyPasswordResult: verifyResult
      }
    };
    
  } catch (error) {
    console.error('❌ Error in testVerifyPassword:', error);
    return { 
      error: error.toString(),
      stack: error.stack 
    };
  }
}

/**
 * ทดสอบการ Login แบบ step-by-step
 * @param {string} username - Username
 * @param {string} password - Password  
 * @returns {Object} ผลการทดสอบทีละขั้นตอน
 */
function testLoginStepByStep(username = '4498', password = 'likit.se4498') {
  try {
    console.log('🚀 Testing Login Step by Step...');
    
    const steps = [];
    
    // Step 1: ตรวจสอบ Sheet
    steps.push('Step 1: ตรวจสอบ Sheet user');
    const sheet = getSheet(CONFIG.SHEETS.USER);
    if (!sheet) {
      return { error: 'ไม่พบ Sheet user', steps: steps };
    }
    steps.push('✅ Sheet user พบแล้ว');
    
    // Step 2: อ่านข้อมูล
    const values = sheet.getDataRange().getValues();
    steps.push(`Step 2: อ่านข้อมูล - พบ ${values.length} แถว`);
    
    if (values.length <= 1) {
      return { error: 'ไม่มีข้อมูลผู้ใช้', steps: steps };
    }
    
    // Step 3: หาผู้ใช้
    steps.push('Step 3: ค้นหาผู้ใช้');
    let foundUser = null;
    let searchIndex = -1;
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const empId = row[0];
      const email = row[2];
      const userStatus = row[4];
      
      steps.push(`  - ตรวจสอบแถว ${i}: EmpId=${empId} (${typeof empId}), Email=${email}, Status=${userStatus} (${typeof userStatus})`);
      
      if ((String(empId) === String(username) || email === username)) {
        foundUser = {
          empId: empId,
          fullName: row[1],
          email: email,
          role: row[3],
          status: userStatus,
          password: row[5]
        };
        searchIndex = i;
        steps.push(`  ✅ พบผู้ใช้ที่แถว ${i}`);
        break;
      }
    }
    
    if (!foundUser) {
      return { 
        error: 'ไม่พบผู้ใช้',
        searchUsername: username,
        steps: steps 
      };
    }
    
    // Step 4: ตรวจสอบสถานะ
    steps.push('Step 4: ตรวจสอบสถานะผู้ใช้');
    if (foundUser.status !== 1 && String(foundUser.status) !== '1') {
      return { 
        error: 'ผู้ใช้ไม่ได้เปิดใช้งาน',
        userStatus: foundUser.status,
        statusType: typeof foundUser.status,
        steps: steps 
      };
    }
    steps.push('✅ สถานะผู้ใช้เปิดใช้งาน');
    
    // Step 5: ตรวจสอบรหัสผ่าน
    steps.push('Step 5: ตรวจสอบรหัสผ่าน');
    const passwordValid = verifyPassword(password, foundUser.email, foundUser.empId);
    
    if (!passwordValid) {
      return { 
        error: 'รหัสผ่านไม่ถูกต้อง',
        passwordVerifyResult: passwordValid,
        steps: steps 
      };
    }
    steps.push('✅ รหัสผ่านถูกต้อง');
    
    // Step 6: สร้าง token
    steps.push('Step 6: สร้าง token');
    const user = {
      id: foundUser.empId,
      fullName: foundUser.fullName,
      email: foundUser.email,
      role: foundUser.role,
      status: foundUser.status
    };
    
    const token = generateToken(user);
    steps.push('✅ สร้าง token สำเร็จ');
    
    return {
      success: true,
      message: 'Login สำเร็จ',
      user: user,
      token: token ? token.substring(0, 20) + '...' : 'ไม่สามารถสร้าง token',
      steps: steps
    };
    
  } catch (error) {
    console.error('❌ Error in testLoginStepByStep:', error);
    return { 
      error: error.toString(),
      stack: error.stack,
      steps: steps || []
    };
  }
}

/**
 * ทดสอบการทำงานของ authenticateUser function โดยตรง
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object} ผลการทดสอบ
 */
function testAuthenticateUser(username = '4498', password = 'likit.se4498') {
  try {
    console.log('🔐 Testing authenticateUser function directly...');
    
    const result = authenticateUser(username, password);
    
    return {
      testFunction: 'authenticateUser',
      inputUsername: username,
      inputPassword: password.substring(0, 4) + '...',
      result: result
    };
    
  } catch (error) {
    console.error('❌ Error in testAuthenticateUser:', error);
    return { 
      error: error.toString(),
      stack: error.stack 
    };
  }
}

/**
 * ทดสอบ Configuration
 * @returns {Object} ข้อมูล config
 */
function testConfiguration() {
  try {
    return {
      success: true,
      config: {
        SHEETS: CONFIG.SHEETS,
        COLUMNS: CONFIG.COLUMNS,
        spreadsheetId: CONFIG.SPREADSHEET_ID
      },
      spreadsheetAccess: {
        canAccess: !!getSpreadsheetSafely(),
        sheets: getAllSheetNames()
      }
    };
  } catch (error) {
    return { 
      error: error.toString(),
      stack: error.stack 
    };
  }
}

/**
 * รัน test ทั้งหมด
 * @param {string} username - Username สำหรับทดสอบ
 * @param {string} password - Password สำหรับทดสอบ
 * @returns {Object} ผลการทดสอบทั้งหมด
 */
function runAllLoginTests(username = '4498', password = 'likit.se4498') {
  console.log('🧪 Running All Login Tests...');
  
  return {
    timestamp: new Date().toISOString(),
    testInputs: { username, password: password.substring(0, 4) + '...' },
    tests: {
      configuration: testConfiguration(),
      userData: testGetUserData(),
      findUser: testFindUser(username),
      verifyPassword: testVerifyPassword(username, password),
      stepByStep: testLoginStepByStep(username, password),
      authenticateUser: testAuthenticateUser(username, password)
    }
  };
}