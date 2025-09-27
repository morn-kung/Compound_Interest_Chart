/**
 * ฟังก์ชันสร้างรหัสผ่านใหม่ (ปรับปรุงด้วย Error Handling)
 */
function renew_password() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const userSheet = spreadsheet.getSheetByName("user");

    if (!userSheet) {
      SpreadsheetApp.getUi().alert('ไม่พบชีตชื่อ "user"');
      return;
    }

    // ตรวจสอบสิทธิ์ในการเขียนข้อมูล
    const protection = userSheet.getProtections(SpreadsheetApp.ProtectionType.SHEET)[0];
    if (protection && !protection.canEdit()) {
      SpreadsheetApp.getUi().alert('ไม่มีสิทธิ์ในการแก้ไขชีตนี้');
      return;
    }

    // Get all data from the "user" sheet, including headers.
    const dataRange = userSheet.getDataRange();
    const data = dataRange.getValues();
    const headers = data[0]; // First row is headers

    // Map header names to their column indices for easy access.
    const headerMap = {};
    headers.forEach((header, index) => {
      headerMap[header] = index;
    });

    // ตรวจสอบว่ามี columns ที่จำเป็น
    if (headerMap['EmpId'] === undefined || 
        headerMap['Email'] === undefined || 
        headerMap['password'] === undefined) {
      SpreadsheetApp.getUi().alert('ไม่พบ columns ที่จำเป็น: EmpId, Email, หรือ password');
      return;
    }

    // Get the indices of the columns we need.
    const empIdIndex = headerMap['EmpId'];
    const emailIndex = headerMap['Email'];
    const passwordIndex = headerMap['password'];

    let updatedCount = 0;

    // Loop through each row of data (starting from the second row to skip headers)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const empId = row[empIdIndex];
      const email = row[emailIndex];

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!empId || !email) {
        Logger.log(`ข้อมูลไม่ครบในแถวที่ ${i + 1}: EmpId=${empId}, Email=${email}`);
        continue;
      }

      // Extract the part of the email before the "@" symbol.
      const emailPrefix = email.split('@')[0];
      
      // Combine the email prefix and the employee ID to create the new string for hashing.
      const newPasswordString = emailPrefix + empId;

      // Generate the new password hash using SHA-256.
      const newPasswordHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, newPasswordString)
                                      .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                                      .join('');

      // Update the password value in the current row.
      data[i][passwordIndex] = newPasswordHash;
      updatedCount++;
    }

    // Write the updated data back to the sheet.
    if (updatedCount > 0) {
      dataRange.setValues(data);
      SpreadsheetApp.getUi().alert(`สร้างรหัสผ่านใหม่เรียบร้อยแล้ว (${updatedCount} รายการ)`);
    } else {
      SpreadsheetApp.getUi().alert('ไม่มีข้อมูลที่ต้องอัปเดต');
    }

  } catch (error) {
    Logger.log('Error in renew_password: ' + error.toString());
    SpreadsheetApp.getUi().alert('เกิดข้อผิดพลาด: ' + error.toString());
  }
}

/**
 * ฟังก์ชันทดสอบสิทธิ์การเขียนข้อมูล
 */
function testWritePermission() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const userSheet = spreadsheet.getSheetByName("user");
    
    if (!userSheet) {
      Logger.log('ไม่พบชีต "user"');
      return;
    }

    // ลองเขียนข้อมูลทดสอบ
    const testCell = userSheet.getRange('A1');
    const originalValue = testCell.getValue();
    
    testCell.setValue('TEST');
    testCell.setValue(originalValue); // คืนค่าเดิม
    
    Logger.log('การทดสอบสิทธิ์การเขียนสำเร็จ');
    SpreadsheetApp.getUi().alert('มีสิทธิ์ในการเขียนข้อมูล');
    
  } catch (error) {
    Logger.log('ไม่มีสิทธิ์ในการเขียนข้อมูล: ' + error.toString());
    SpreadsheetApp.getUi().alert('ไม่มีสิทธิ์ในการเขียนข้อมูล: ' + error.toString());
  }
}