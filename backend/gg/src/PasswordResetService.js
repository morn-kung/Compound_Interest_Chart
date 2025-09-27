/**
 * Password Reset Service - Handle forgot password functionality
 * Integrates with existing project structure and sends emails
 * @created 2025-09-27
 */

/**
 * Request password reset - ขอรีเซ็ตรหัสผ่านโดยใช้ email
 * @param {string} email - Email address to reset password
 * @returns {Object} Reset request result
 */
function requestPasswordReset(email) {
  try {
    console.log(`🔄 Processing password reset request for: ${email}`);
    
    if (!email || !email.includes('@')) {
      return createJSONResponse('error', 'กรุณาระบุ email ที่ถูกต้อง');
    }
    
    // ค้นหา user จาก email
    const userInfo = findUserByEmail(email);
    if (!userInfo.found) {
      // ไม่เปิดเผยว่าไม่มี email นี้ในระบบ (security)
      return createJSONResponse('success', 'หากมี email นี้ในระบบ เราจะส่งรหัสผ่านใหม่ไปให้', {
        email: email,
        message: 'Email sent if exists'
      });
    }
    
    // สร้างรหัสผ่านใหม่สำหรับ user นี้
    const resetResult = resetUserPassword(userInfo.empId, userInfo.email);
    
    if (resetResult.status === 'success') {
      // ส่ง email แจ้งรหัสผ่านใหม่
      const emailResult = sendPasswordResetEmail(userInfo, resetResult);
      
      if (emailResult.status === 'success') {
        return createJSONResponse('success', 'ส่งรหัสผ่านใหม่ไปยัง email ของคุณแล้ว', {
          email: email,
          empId: userInfo.empId,
          sentAt: new Date().toISOString()
        });
      } else {
        // Password reset สำเร็จแต่ส่ง email ไม่ได้
        return createJSONResponse('warning', 'รีเซ็ตรหัสผ่านสำเร็จ แต่ไม่สามารถส่ง email ได้', {
          email: email,
          empId: userInfo.empId,
          emailError: emailResult.message
        });
      }
    } else {
      return createJSONResponse('error', 'ไม่สามารถรีเซ็ตรหัสผ่านได้: ' + resetResult.message);
    }
    
  } catch (error) {
    logError('requestPasswordReset', error, { email });
    return createJSONResponse('error', 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
  }
}

/**
 * Find user by email address
 * @param {string} email - Email to search for
 * @returns {Object} User information if found
 */
function findUserByEmail(email) {
  try {
    const spreadsheet = getSpreadsheetSafely();
    const userSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.USER);
    
    if (!userSheet) {
      throw new Error(`ไม่พบชีต "${CONFIG.SHEETS.USER}"`);
    }
    
    const data = userSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Map headers
    const headerMap = {};
    headers.forEach((header, index) => {
      headerMap[header] = index;
    });
    
    const empIdIndex = headerMap['EmpId'];
    const emailIndex = headerMap['Email'];
    const fullNameIndex = headerMap['FullNameTH'];
    const roleIndex = headerMap['Role'];
    const statusIndex = headerMap['Userstatus'];
    
    // Search for user
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[emailIndex] && row[emailIndex].toLowerCase() === email.toLowerCase()) {
        return {
          found: true,
          empId: row[empIdIndex],
          email: row[emailIndex],
          fullName: row[fullNameIndex],
          role: row[roleIndex],
          status: row[statusIndex],
          rowIndex: i
        };
      }
    }
    
    return { found: false };
    
  } catch (error) {
    console.error('Error finding user by email:', error);
    return { found: false, error: error.toString() };
  }
}

/**
 * Reset password for a specific user (adapted from renew_password_safe.js)
 * @param {string} empId - Employee ID
 * @param {string} email - User's email
 * @returns {Object} Reset result with new password details
 */
function resetUserPassword(empId, email) {
  try {
    console.log(`🔑 Resetting password for user: ${empId}`);
    
    if (!empId || !email) {
      throw new Error('EmpId และ Email จำเป็นต้องระบุ');
    }
    
    const spreadsheet = getSpreadsheetSafely();
    const userSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.USER);
    
    if (!userSheet) {
      throw new Error(`ไม่พบชีต "${CONFIG.SHEETS.USER}"`);
    }
    
    // Extract email prefix (part before @)
    if (!email.includes('@')) {
      throw new Error('รูปแบบ email ไม่ถูกต้อง');
    }
    
    const emailPrefix = email.split('@')[0];
    
    // Create password string (same logic as renew_password_safe.js)
    const passwordString = emailPrefix + empId;
    
    // Generate SHA-256 hash
    const passwordHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, passwordString)
                                  .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                                  .join('');
    
    // Update password in sheet
    const data = userSheet.getDataRange().getValues();
    const headers = data[0];
    
    const headerMap = {};
    headers.forEach((header, index) => {
      headerMap[header] = index;
    });
    
    const empIdIndex = headerMap['EmpId'];
    const passwordIndex = headerMap['password'];
    
    // Find and update user row
    let updated = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][empIdIndex] === empId) {
        data[i][passwordIndex] = passwordHash;
        updated = true;
        break;
      }
    }
    
    if (!updated) {
      throw new Error(`ไม่พบผู้ใช้ EmpId: ${empId}`);
    }
    
    // Write back to sheet
    userSheet.getDataRange().setValues(data);
    
    console.log(`✅ Password reset successful for user ${empId}`);
    
    return createJSONResponse('success', 'รีเซ็ตรหัสผ่านสำเร็จ', {
      empId: empId,
      email: email,
      emailPrefix: emailPrefix,
      passwordString: passwordString, // For email notification
      passwordHash: passwordHash,
      resetAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error resetting user password:', error);
    return createJSONResponse('error', `เกิดข้อผิดพลาด: ${error.toString()}`);
  }
}

/**
 * Send password reset email to user
 * @param {Object} userInfo - User information
 * @param {Object} resetResult - Password reset result
 * @returns {Object} Email sending result
 */
function sendPasswordResetEmail(userInfo, resetResult) {
  try {
    console.log(`📧 Sending password reset email to: ${userInfo.email}`);
    
    const subject = 'รหัสผ่านใหม่สำหรับระบบ Trading Journal';
    
    // สร้างเนื้อหา email
    const emailBody = `
เรียน คุณ${userInfo.fullName},

คุณได้ขอรีเซ็ตรหัสผ่านสำหรับระบบ Trading Journal

รายละเอียดการเข้าสู่ระบบใหม่:
- รหัสผู้ใช้: ${userInfo.empId}
- Email: ${userInfo.email}
- รหัสผ่านใหม่: ${resetResult.data.passwordString}

กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่นี้

หมายเหตุ: รหัสผ่านนี้ถูกสร้างจาก "${resetResult.data.emailPrefix}" + "${userInfo.empId}"

---
ส่งอัตโนมัติจากระบบ Trading Journal
เวลา: ${new Date().toLocaleString('th-TH')}
    `.trim();
    
    // ส่ง email
    MailApp.sendEmail({
      to: userInfo.email,
      subject: subject,
      body: emailBody
    });
    
    console.log(`✅ Password reset email sent successfully to ${userInfo.email}`);
    
    return createJSONResponse('success', 'ส่ง email สำเร็จ', {
      to: userInfo.email,
      subject: subject,
      sentAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return createJSONResponse('error', `ไม่สามารถส่ง email ได้: ${error.toString()}`);
  }
}

/**
 * Bulk password reset - รีเซ็ตรหัสผ่านทุกคนและส่ง email แจ้ง
 * @returns {Object} Bulk reset result
 */
function bulkPasswordReset() {
  try {
    console.log('🔄 Starting bulk password reset...');
    
    const spreadsheet = getSpreadsheetSafely();
    const userSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.USER);
    
    if (!userSheet) {
      throw new Error(`ไม่พบชีต "${CONFIG.SHEETS.USER}"`);
    }
    
    const data = userSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createJSONResponse('warning', 'ไม่พบข้อมูลผู้ใช้');
    }
    
    const headers = data[0];
    const headerMap = {};
    headers.forEach((header, index) => {
      headerMap[header] = index;
    });
    
    const empIdIndex = headerMap['EmpId'];
    const emailIndex = headerMap['Email'];
    const fullNameIndex = headerMap['FullNameTH'];
    const passwordIndex = headerMap['password'];
    const statusIndex = headerMap['Userstatus'];
    
    const results = {
      processed: 0,
      emailsSent: 0,
      errors: 0,
      users: []
    };
    
    // Process each user
    for (let i = 1; i < data.length; i++) {
      try {
        const row = data[i];
        const empId = row[empIdIndex];
        const email = row[emailIndex];
        const fullName = row[fullNameIndex];
        const status = row[statusIndex];
        
        // Skip inactive users
        if (status !== 1) {
          console.log(`Skipping inactive user: ${empId}`);
          continue;
        }
        
        if (!empId || !email) {
          console.warn(`Missing data for row ${i + 1}: EmpId=${empId}, Email=${email}`);
          results.errors++;
          continue;
        }
        
        // Generate new password
        const emailPrefix = email.split('@')[0];
        const passwordString = emailPrefix + empId;
        const passwordHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, passwordString)
                                      .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                                      .join('');
        
        // Update password in data array
        data[i][passwordIndex] = passwordHash;
        results.processed++;
        
        // Send email notification
        try {
          const userInfo = { empId, email, fullName };
          const resetData = { data: { passwordString, emailPrefix } };
          
          const emailResult = sendPasswordResetEmail(userInfo, resetData);
          if (emailResult.status === 'success') {
            results.emailsSent++;
          }
        } catch (emailError) {
          console.warn(`Failed to send email to ${email}:`, emailError);
        }
        
        results.users.push({
          empId: empId,
          email: email,
          fullName: fullName,
          passwordString: passwordString
        });
        
      } catch (userError) {
        console.error(`Error processing user at row ${i + 1}:`, userError);
        results.errors++;
      }
    }
    
    // Write updated passwords back to sheet
    if (results.processed > 0) {
      userSheet.getDataRange().setValues(data);
    }
    
    console.log(`✅ Bulk password reset completed: ${results.processed} users processed, ${results.emailsSent} emails sent`);
    
    return createJSONResponse('success', `รีเซ็ตรหัสผ่านสำเร็จ ${results.processed} คน, ส่ง email แจ้ง ${results.emailsSent} คน`, results);
    
  } catch (error) {
    logError('bulkPasswordReset', error);
    return createJSONResponse('error', `เกิดข้อผิดพลาด: ${error.toString()}`);
  }
}

/**
 * Test password reset functionality
 * @returns {Object} Test results
 */
function testPasswordReset() {
  try {
    console.log('🧪 Testing password reset functionality...');
    
    // Test with existing user data from info.md
    const testEmails = [
      'likit@example.com', // Should exist if test users were created
      'nonexistent@example.com' // Should not exist
    ];
    
    const testResults = [];
    
    testEmails.forEach((email, index) => {
      console.log(`\n--- Test ${index + 1}: ${email} ---`);
      
      const result = requestPasswordReset(email);
      
      console.log(`Status: ${result.status}`);
      console.log(`Message: ${result.message}`);
      
      testResults.push({
        testCase: index + 1,
        email: email,
        result: result,
        success: result.status === 'success'
      });
    });
    
    const summary = {
      totalTests: testResults.length,
      successful: testResults.filter(r => r.success).length,
      failed: testResults.filter(r => !r.success).length
    };
    
    console.log('\n=== PASSWORD RESET TEST SUMMARY ===');
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Successful: ${summary.successful}`);
    console.log(`Failed: ${summary.failed}`);
    
    return createJSONResponse('success', 'Password reset tests completed', {
      summary: summary,
      testResults: testResults
    });
    
  } catch (error) {
    console.error('Error testing password reset:', error);
    return createJSONResponse('error', `เกิดข้อผิดพลาดในการทดสอบ: ${error.toString()}`);
  }
}