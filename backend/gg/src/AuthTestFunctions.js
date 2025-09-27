/**
 * Authentication Test Functions
 * Functions to test login, authentication, and user management
 * @created 2025-09-27
 */

/**
 * ตรวจสอบข้อมูล User ใน user sheet
 * @returns {Object} User data information
 */
function checkUserData() {
  try {
    console.log('🔍 Checking user data in sheet...');
    
    const sheet = getSheet(CONFIG.SHEETS.USER);
    const values = sheet.getDataRange().getValues();
    
    console.log('=== USER SHEET DATA ===');
    console.log('Headers:', values[0]);
    
    const users = [];
    for (let i = 1; i < values.length; i++) {
      const userData = {
        empId: values[i][0],
        fullName: values[i][1], 
        email: values[i][2],
        role: values[i][3],
        status: values[i][4],
        password: values[i][5] ? '[SET]' : '[EMPTY]'
      };
      users.push(userData);
      console.log(`User ${i}:`, userData);
    }
    
    return createJSONResponse('success', `พบ ${users.length} users ในระบบ`, {
      totalUsers: users.length,
      users: users,
      headers: values[0]
    });
    
  } catch (error) {
    console.error('Error checking user data:', error);
    return createJSONResponse('error', `เกิดข้อผิดพลาด: ${error.toString()}`);
  }
}

/**
 * สร้าง Test User สำหรับทดสอบ
 * @returns {Object} Creation result
 */
function createTestUser() {
  try {
    console.log('👤 Creating test user...');
    
    const sheet = getSheet(CONFIG.SHEETS.USER);
    
    // ตรวจสอบว่ามี test user อยู่แล้วหรือไม่
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === 'likit001') {
        return createJSONResponse('info', 'Test user already exists', {
          username: 'likit001',
          email: 'likit@example.com'
        });
      }
    }
    
    // เพิ่ม test user ใหม่ (กับ hashed password)
    const hashedPassword = hashPassword('likit@example.com', 'likit001');
    const testUser = [
      'likit001',                    // EmpId
      'Likit Test User',             // FullNameTH
      'likit@example.com',           // Email  
      'admin',                       // Role
      1,                             // Userstatus (1 = active)
      hashedPassword                 // password (hashed)
    ];
    
    sheet.appendRow(testUser);
    console.log('✅ Test user created successfully');
    
    return createJSONResponse('success', 'Test user created successfully', {
      username: 'likit001',
      email: 'likit@example.com', 
      password: 'password123',
      role: 'admin'
    });
    
  } catch (error) {
    console.error('Error creating test user:', error);
    return createJSONResponse('error', `เกิดข้อผิดพลาด: ${error.toString()}`);
  }
}

/**
 * เพิ่ม test users หลายคนพร้อมกัน
 * @returns {Object} Creation result
 */
function createMultipleTestUsers() {
  try {
    console.log('👥 Creating multiple test users...');
    
    const sheet = getSheet(CONFIG.SHEETS.USER);
    
    const testUsers = [
      ['likit001', 'Likit Admin', 'likit@example.com', 'admin', 1, hashPassword('likit@example.com', 'likit001')],
      ['user001', 'Test User 1', 'user1@example.com', 'user', 1, hashPassword('user1@example.com', 'user001')], 
      ['manager001', 'Test Manager', 'manager@example.com', 'manager', 1, hashPassword('manager@example.com', 'manager001')]
    ];
    
    const created = [];
    const skipped = [];
    
    // ตรวจสอบ existing users
    const existingValues = sheet.getDataRange().getValues();
    const existingIds = existingValues.slice(1).map(row => row[0]);
    
    testUsers.forEach(user => {
      if (existingIds.includes(user[0])) {
        skipped.push(user[0]);
      } else {
        sheet.appendRow(user);
        created.push({
          empId: user[0],
          email: user[2],
          role: user[3],
          password: user[5]
        });
      }
    });
    
    console.log(`✅ Created ${created.length} users, skipped ${skipped.length} existing users`);
    
    return createJSONResponse('success', `สร้าง ${created.length} users สำเร็จ`, {
      created: created,
      skipped: skipped,
      totalCreated: created.length
    });
    
  } catch (error) {
    console.error('Error creating multiple test users:', error);
    return createJSONResponse('error', `เกิดข้อผิดพลาด: ${error.toString()}`);
  }
}

/**
 * ทดสอบ Login Function ด้วยข้อมูลต่างๆ
 * @returns {Object} Test results
 */
function testLogin() {
  try {
    console.log('🔐 Testing authentication system...');
    
    // Test cases สำหรับทดสอบ login
    const testCases = [
      { 
        name: 'Valid login with EmpId',
        username: 'likit001', 
        password: 'password123', 
        expected: 'success' 
      },
      { 
        name: 'Valid login with Email',
        username: 'likit@example.com', 
        password: 'password123', 
        expected: 'success' 
      },
      { 
        name: 'Invalid password',
        username: 'likit001', 
        password: 'wrongpassword', 
        expected: 'error' 
      },
      { 
        name: 'Non-existent user',
        username: 'nonexistuser', 
        password: 'password123', 
        expected: 'error' 
      },
      {
        name: 'Empty username',
        username: '',
        password: 'password123',
        expected: 'error'
      },
      {
        name: 'Empty password', 
        username: 'likit001',
        password: '',
        expected: 'error'
      }
    ];
    
    const results = [];
    let passedTests = 0;
    
    testCases.forEach((testCase, index) => {
      console.log(`\n--- Test Case ${index + 1}: ${testCase.name} ---`);
      console.log(`Username: "${testCase.username}"`);
      console.log(`Password: "${testCase.password}"`);
      
      const result = authenticateUser(testCase.username, testCase.password);
      const passed = result.status === testCase.expected;
      
      if (passed) passedTests++;
      
      console.log(`Expected: ${testCase.expected}, Got: ${result.status}`);
      console.log(`Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
      
      if (result.status === 'success' && result.data) {
        console.log('User info:', result.data.user);
        console.log('Token generated:', result.data.token ? 'YES' : 'NO');
      }
      
      results.push({
        testCase: index + 1,
        name: testCase.name,
        input: {
          username: testCase.username,
          password: testCase.password
        },
        expected: testCase.expected,
        actual: result.status,
        passed: passed,
        result: result,
        message: result.message
      });
    });
    
    const summary = {
      totalTests: testCases.length,
      passed: passedTests,
      failed: testCases.length - passedTests,
      successRate: Math.round((passedTests / testCases.length) * 100)
    };
    
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Success Rate: ${summary.successRate}%`);
    
    return createJSONResponse('success', `Authentication tests completed`, {
      summary: summary,
      testResults: results
    });
    
  } catch (error) {
    console.error('Error running login tests:', error);
    return createJSONResponse('error', `เกิดข้อผิดพลาดในการทดสอบ: ${error.toString()}`);
  }
}

/**
 * ทดสอบ Token generation และ verification
 * @returns {Object} Token test results
 */
function testTokenSystem() {
  try {
    console.log('🔑 Testing token system...');
    
    // ทดสอบ login เพื่อรับ token
    const loginResult = authenticateUser('likit001', 'password123');
    
    if (loginResult.status !== 'success') {
      return createJSONResponse('error', 'Cannot test tokens - login failed', loginResult);
    }
    
    const token = loginResult.data.token;
    const user = loginResult.data.user;
    
    console.log('Generated token:', token);
    console.log('User info:', user);
    
    // ทดสอบการตรวจสอบ token
    const tokenTests = [
      {
        name: 'Valid token verification',
        token: token,
        expected: true
      },
      {
        name: 'Invalid token verification', 
        token: 'invalid-token-12345',
        expected: false
      },
      {
        name: 'Empty token verification',
        token: '',
        expected: false
      }
    ];
    
    const tokenResults = [];
    
    tokenTests.forEach((test, index) => {
      console.log(`\n--- Token Test ${index + 1}: ${test.name} ---`);
      
      // ใช้ verifyToken function ถ้ามี
      let isValid = false;
      try {
        if (typeof verifyToken === 'function') {
          isValid = verifyToken(test.token);
        } else {
          // Basic token validation if verifyToken doesn't exist
          isValid = test.token && test.token.length > 10 && test.token.includes('-');
        }
      } catch (error) {
        console.error('Token verification error:', error);
        isValid = false;
      }
      
      const passed = isValid === test.expected;
      console.log(`Expected: ${test.expected}, Got: ${isValid}`);
      console.log(`Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
      
      tokenResults.push({
        testCase: index + 1,
        name: test.name,
        token: test.token,
        expected: test.expected,
        actual: isValid,
        passed: passed
      });
    });
    
    const tokenSummary = {
      totalTests: tokenTests.length,
      passed: tokenResults.filter(r => r.passed).length,
      originalToken: token,
      userId: user.id
    };
    
    return createJSONResponse('success', 'Token system tests completed', {
      loginResult: loginResult,
      tokenTests: tokenResults,
      summary: tokenSummary
    });
    
  } catch (error) {
    console.error('Error testing token system:', error);
    return createJSONResponse('error', `เกิดข้อผิดพลาดในการทดสอบ token: ${error.toString()}`);
  }
}

/**
 * รัน Authentication tests ทั้งหมด
 * @returns {Object} Complete test results
 */
function runAuthenticationTests() {
  try {
    console.log('🚀 Running complete authentication test suite...');
    
    const testSuite = {
      timestamp: new Date().toISOString(),
      tests: []
    };
    
    // 1. ตรวจสอบ user data
    console.log('\n1️⃣ Checking existing user data...');
    const userData = checkUserData();
    testSuite.tests.push({ name: 'Check User Data', result: userData });
    
    // 2. สร้าง test user ถ้าจำเป็น
    console.log('\n2️⃣ Creating test users...');
    const userCreation = createMultipleTestUsers();
    testSuite.tests.push({ name: 'Create Test Users', result: userCreation });
    
    // 3. ทดสอบ login
    console.log('\n3️⃣ Testing login functionality...');
    const loginTests = testLogin();
    testSuite.tests.push({ name: 'Login Tests', result: loginTests });
    
    // 4. ทดสอบ token system
    console.log('\n4️⃣ Testing token system...');
    const tokenTests = testTokenSystem();
    testSuite.tests.push({ name: 'Token Tests', result: tokenTests });
    
    // สรุปผลรวม
    const overallSummary = {
      totalTestSuites: testSuite.tests.length,
      completedSuites: testSuite.tests.filter(t => t.result.status === 'success').length,
      timestamp: testSuite.timestamp
    };
    
    console.log('\n🎯 === OVERALL TEST SUMMARY ===');
    console.log(`Test Suites Run: ${overallSummary.totalTestSuites}`);
    console.log(`Successful Suites: ${overallSummary.completedSuites}`);
    console.log(`Completion Time: ${overallSummary.timestamp}`);
    
    return createJSONResponse('success', 'Authentication test suite completed', {
      summary: overallSummary,
      testSuite: testSuite
    });
    
  } catch (error) {
    console.error('Error running authentication tests:', error);
    return createJSONResponse('error', `เกิดข้อผิดพลาดในการรัน test suite: ${error.toString()}`);
  }
}