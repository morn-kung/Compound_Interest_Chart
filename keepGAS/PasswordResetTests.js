/**
 * Password Reset Integration Tests
 * Tests the complete password reset flow with existing data
 * @created 2025-09-27
 */

/**
 * Setup test users based on existing account data from info.md
 * @returns {Object} Setup result
 */
function setupPasswordResetTests() {
  try {
    console.log('🔧 Setting up password reset test users...');
    
    // Create test users based on existing account data
    const testUsers = [
      {
        empId: 'likit001',
        fullName: 'Likit (Account Owner)',
        email: 'likit@example.com',
        role: 'admin',
        status: 1
      },
      {
        empId: 'likit002', 
        fullName: 'Likit (Second Account)',
        email: 'likit.second@example.com',
        role: 'user',
        status: 1
      }
    ];
    
    const spreadsheet = getSpreadsheetSafely();
    const userSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.USER);
    
    if (!userSheet) {
      throw new Error(`ไม่พบชีต "${CONFIG.SHEETS.USER}"`);
    }
    
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      users: []
    };
    
    // Get existing data
    const data = userSheet.getDataRange().getValues();
    const headers = data[0];
    
    const headerMap = {};
    headers.forEach((header, index) => {
      headerMap[header] = index;
    });
    
    const empIdIndex = headerMap['EmpId'];
    const existingIds = data.slice(1).map(row => row[empIdIndex]);
    
    // Process each test user
    testUsers.forEach(user => {
      if (existingIds.includes(user.empId)) {
        console.log(`User ${user.empId} already exists, skipping...`);
        results.skipped++;
      } else {
        // Generate initial password hash
        const passwordHash = hashPassword(user.email, user.empId);
        
        const newRow = [
          user.empId,        // EmpId
          user.fullName,     // FullNameTH
          user.email,        // Email
          user.role,         // Role
          user.status,       // Userstatus
          passwordHash       // password
        ];
        
        userSheet.appendRow(newRow);
        results.created++;
        
        results.users.push({
          empId: user.empId,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          passwordString: user.email.split('@')[0] + user.empId
        });
        
        console.log(`✅ Created test user: ${user.empId} (${user.email})`);
      }
    });
    
    console.log(`Test user setup completed: ${results.created} created, ${results.skipped} skipped`);
    
    return createJSONResponse('success', `Setup completed: ${results.created} users created`, results);
    
  } catch (error) {
    console.error('Error setting up password reset tests:', error);
    return createJSONResponse('error', `Setup failed: ${error.toString()}`);
  }
}

/**
 * Test password reset with real account owners from info.md
 * @returns {Object} Test results
 */
function testPasswordResetWithRealData() {
  try {
    console.log('🧪 Testing password reset with real account data...');
    
    // Based on account data from info.md, "likit" is the owner of accounts
    const testCases = [
      {
        name: 'Valid email - existing user',
        email: 'likit@example.com',
        expectedStatus: 'success'
      },
      {
        name: 'Valid email - second account owner',
        email: 'likit.second@example.com', 
        expectedStatus: 'success'
      },
      {
        name: 'Non-existent email',
        email: 'nonexistent@example.com',
        expectedStatus: 'success' // Still success for security (don't reveal non-existence)
      },
      {
        name: 'Invalid email format',
        email: 'invalid-email',
        expectedStatus: 'error'
      },
      {
        name: 'Empty email',
        email: '',
        expectedStatus: 'error'
      }
    ];
    
    const testResults = [];
    let passedTests = 0;
    
    testCases.forEach((testCase, index) => {
      console.log(`\n--- Test ${index + 1}: ${testCase.name} ---`);
      console.log(`Email: "${testCase.email}"`);
      
      const result = requestPasswordReset(testCase.email);
      const passed = result.status === testCase.expectedStatus;
      
      if (passed) passedTests++;
      
      console.log(`Expected: ${testCase.expectedStatus}, Got: ${result.status}`);
      console.log(`Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`Message: ${result.message}`);
      
      testResults.push({
        testCase: index + 1,
        name: testCase.name,
        email: testCase.email,
        expected: testCase.expectedStatus,
        actual: result.status,
        passed: passed,
        message: result.message,
        data: result.data
      });
    });
    
    const summary = {
      totalTests: testCases.length,
      passed: passedTests,
      failed: testCases.length - passedTests,
      successRate: Math.round((passedTests / testCases.length) * 100)
    };
    
    console.log('\n=== PASSWORD RESET TEST SUMMARY ===');
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Success Rate: ${summary.successRate}%`);
    
    return createJSONResponse('success', 'Password reset tests completed', {
      summary: summary,
      testResults: testResults
    });
    
  } catch (error) {
    console.error('Error testing password reset:', error);
    return createJSONResponse('error', `Test failed: ${error.toString()}`);
  }
}

/**
 * Demonstrate password reset flow end-to-end
 * @returns {Object} Demo result
 */
function demonstratePasswordResetFlow() {
  try {
    console.log('🎭 Demonstrating complete password reset flow...');
    
    const demoEmail = 'likit@example.com';
    const demoResults = {
      steps: [],
      overall: 'success'
    };
    
    // Step 1: Check if user exists
    console.log('\n📍 Step 1: Finding user by email...');
    const userInfo = findUserByEmail(demoEmail);
    
    if (userInfo.found) {
      demoResults.steps.push({
        step: 1,
        name: 'User Lookup',
        status: 'success',
        message: `Found user: ${userInfo.empId} (${userInfo.fullName})`,
        data: userInfo
      });
      console.log(`✅ Found user: ${userInfo.empId}`);
    } else {
      demoResults.steps.push({
        step: 1,
        name: 'User Lookup', 
        status: 'failed',
        message: 'User not found',
        data: userInfo
      });
      console.log('❌ User not found');
      demoResults.overall = 'failed';
    }
    
    if (userInfo.found) {
      // Step 2: Generate new password
      console.log('\n📍 Step 2: Generating new password...');
      const resetResult = resetUserPassword(userInfo.empId, userInfo.email);
      
      demoResults.steps.push({
        step: 2,
        name: 'Password Generation',
        status: resetResult.status,
        message: resetResult.message,
        data: resetResult.data
      });
      
      if (resetResult.status === 'success') {
        console.log(`✅ New password generated: ${resetResult.data.passwordString}`);
        
        // Step 3: Send email (simulate)
        console.log('\n📍 Step 3: Sending email notification...');
        
        const emailContent = {
          to: userInfo.email,
          subject: 'รหัสผ่านใหม่สำหรับระบบ Trading Journal',
          body: `
เรียน คุณ${userInfo.fullName},

รหัสผ่านใหม่ของคุณ: ${resetResult.data.passwordString}
รหัสผู้ใช้: ${userInfo.empId}

กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่นี้
          `.trim()
        };
        
        // Simulate email sending (not actually sending in demo)
        demoResults.steps.push({
          step: 3,
          name: 'Email Notification',
          status: 'simulated',
          message: 'Email content prepared (not actually sent in demo)',
          data: emailContent
        });
        
        console.log('✅ Email content prepared (demo mode)');
        console.log('Email preview:', emailContent.body.substring(0, 100) + '...');
        
        // Step 4: Test login with new password
        console.log('\n📍 Step 4: Testing login with new password...');
        const loginTest = authenticateUser(userInfo.empId, resetResult.data.passwordString);
        
        demoResults.steps.push({
          step: 4,
          name: 'Login Verification',
          status: loginTest.status,
          message: loginTest.message,
          data: loginTest.data
        });
        
        if (loginTest.status === 'success') {
          console.log('✅ Login successful with new password');
        } else {
          console.log('❌ Login failed with new password');
          demoResults.overall = 'partial';
        }
        
      } else {
        console.log('❌ Password generation failed');
        demoResults.overall = 'failed';
      }
    }
    
    // Summary
    const successfulSteps = demoResults.steps.filter(s => s.status === 'success' || s.status === 'simulated').length;
    const totalSteps = demoResults.steps.length;
    
    console.log('\n🎯 === DEMO SUMMARY ===');
    console.log(`Overall Status: ${demoResults.overall}`);
    console.log(`Successful Steps: ${successfulSteps}/${totalSteps}`);
    
    demoResults.summary = {
      overall: demoResults.overall,
      successfulSteps: successfulSteps,
      totalSteps: totalSteps,
      demoEmail: demoEmail
    };
    
    return createJSONResponse('success', 'Password reset flow demonstration completed', demoResults);
    
  } catch (error) {
    console.error('Error in password reset demo:', error);
    return createJSONResponse('error', `Demo failed: ${error.toString()}`);
  }
}

/**
 * Complete password reset system test
 * @returns {Object} Complete test results
 */
function runCompletePasswordResetTests() {
  try {
    console.log('🚀 Running complete password reset system tests...');
    
    const testSuite = {
      timestamp: new Date().toISOString(),
      tests: []
    };
    
    // 1. Setup test users
    console.log('\n1️⃣ Setting up test users...');
    const setupResult = setupPasswordResetTests();
    testSuite.tests.push({ name: 'Setup Test Users', result: setupResult });
    
    // 2. Test password reset functionality
    console.log('\n2️⃣ Testing password reset functionality...');
    const resetTests = testPasswordResetWithRealData();
    testSuite.tests.push({ name: 'Password Reset Tests', result: resetTests });
    
    // 3. Demonstrate complete flow
    console.log('\n3️⃣ Demonstrating complete flow...');
    const flowDemo = demonstratePasswordResetFlow();
    testSuite.tests.push({ name: 'Flow Demonstration', result: flowDemo });
    
    // 4. Test password hashing consistency
    console.log('\n4️⃣ Testing password hashing...');
    const hashingTests = testPasswordHashing();
    testSuite.tests.push({ name: 'Password Hashing Tests', result: hashingTests });
    
    // Overall summary
    const successfulTests = testSuite.tests.filter(t => t.result.status === 'success').length;
    const totalTests = testSuite.tests.length;
    
    const overallSummary = {
      totalTestSuites: totalTests,
      successfulSuites: successfulTests,
      failedSuites: totalTests - successfulTests,
      successRate: Math.round((successfulTests / totalTests) * 100),
      timestamp: testSuite.timestamp
    };
    
    console.log('\n🏆 === OVERALL TEST SUMMARY ===');
    console.log(`Test Suites: ${totalTests}`);
    console.log(`Successful: ${successfulTests}`);
    console.log(`Failed: ${totalTests - successfulTests}`);
    console.log(`Success Rate: ${overallSummary.successRate}%`);
    
    return createJSONResponse('success', 'Complete password reset tests finished', {
      summary: overallSummary,
      testSuite: testSuite
    });
    
  } catch (error) {
    console.error('Error running complete password reset tests:', error);
    return createJSONResponse('error', `Test suite failed: ${error.toString()}`);
  }
}