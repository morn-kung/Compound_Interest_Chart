/**
 * ฟังก์ชันวินิจฉัยปัญหา - รันก่อนเพื่อดูข้อมูล
 */
function debugSheetData() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log("✅ Spreadsheet opened: " + spreadsheet.getName());
    
    const userSheet = spreadsheet.getSheetByName("user");
    if (!userSheet) {
      Logger.log("❌ Sheet 'user' not found");
      Logger.log("Available sheets: " + spreadsheet.getSheets().map(s => s.getName()).join(", "));
      return;
    }
    
    Logger.log("✅ Sheet 'user' found");
    
    // ตรวจสอบขนาดข้อมูล
    const lastRow = userSheet.getLastRow();
    const lastCol = userSheet.getLastColumn();
    Logger.log(`📊 Sheet size: ${lastRow} rows x ${lastCol} columns`);
    
    if (lastRow === 0) {
      Logger.log("❌ Sheet is empty");
      return;
    }
    
    // ดูข้อมูล 3 แถวแรก
    const sampleRange = userSheet.getRange(1, 1, Math.min(3, lastRow), lastCol);
    const sampleData = sampleRange.getValues();
    
    Logger.log("📋 Sample data:");
    sampleData.forEach((row, index) => {
      Logger.log(`Row ${index + 1}: [${row.join(", ")}]`);
    });
    
    // ตรวจสอบ Headers
    const headers = sampleData[0];
    Logger.log("🏷️ Headers: " + headers.join(", "));
    
    // ตรวจสอบว่ามี required columns หรือไม่
    const requiredCols = ['EmpId', 'Email', 'password'];
    requiredCols.forEach(col => {
      const index = headers.indexOf(col);
      if (index >= 0) {
        Logger.log(`✅ Found '${col}' at column ${index + 1}`);
      } else {
        Logger.log(`❌ Missing '${col}' column`);
      }
    });
    
    Logger.log("🎯 Debug completed - Check execution transcript");
    
  } catch (error) {
    Logger.log("💥 Error in debugSheetData: " + error.toString());
  }
}

/**
 * ฟังก์ชันทดสอบการสร้าง Hash สำหรับ 1 แถว
 */
function testHashGeneration() {
  try {
    // ทดสอบด้วยข้อมูลจาก user.md
    const testData = [
      { empId: "4497", email: "supoths@gmail.com" },
      { empId: "4498", email: "likit.se@irpc.co.th" }
    ];
    
    testData.forEach((data, index) => {
      const emailPrefix = data.email.split('@')[0];
      const passwordString = emailPrefix + data.empId;
      
      Logger.log(`Test ${index + 1}:`);
      Logger.log(`  EmpId: ${data.empId}`);
      Logger.log(`  Email: ${data.email}`);
      Logger.log(`  EmailPrefix: ${emailPrefix}`);
      Logger.log(`  PasswordString: ${passwordString}`);
      
      // สร้าง Hash
      const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, passwordString)
                           .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                           .join('');
      
      Logger.log(`  Generated Hash: ${hash}`);
      Logger.log("---");
    });
    
  } catch (error) {
    Logger.log("💥 Error in testHashGeneration: " + error.toString());
  }
}

/**
 * ฟังก์ชันสร้างรหัสผ่านใหม่ - Version ปลอดภัย
 */
function renew_password_safe() {
  try {
    Logger.log("🚀 Starting password renewal...");
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const userSheet = spreadsheet.getSheetByName("user");

    if (!userSheet) {
      Logger.log("❌ Sheet 'user' not found");
      SpreadsheetApp.getUi().alert('ไม่พบชีตชื่อ "user"');
      return;
    }

    const lastRow = userSheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log("❌ No data rows found");
      SpreadsheetApp.getUi().alert('ไม่มีข้อมูลในชีต');
      return;
    }

    Logger.log(`📊 Processing ${lastRow - 1} data rows...`);

    // ใช้ getRange แทน getDataRange เพื่อความปลอดภัย
    const dataRange = userSheet.getRange(1, 1, lastRow, userSheet.getLastColumn());
    const data = dataRange.getValues();
    const headers = data[0];

    Logger.log("🏷️ Headers found: " + headers.join(", "));

    // สร้าง header map
    const headerMap = {};
    headers.forEach((header, index) => {
      headerMap[header] = index;
    });

    // ตรวจสอบ required columns
    const empIdIndex = headerMap['EmpId'];
    const emailIndex = headerMap['Email'];
    const passwordIndex = headerMap['password'];

    if (empIdIndex === undefined || emailIndex === undefined || passwordIndex === undefined) {
      Logger.log("❌ Missing required columns");
      Logger.log(`EmpId index: ${empIdIndex}, Email index: ${emailIndex}, password index: ${passwordIndex}`);
      SpreadsheetApp.getUi().alert('ไม่พบคอลัมน์ที่จำเป็น: EmpId, Email, หรือ password');
      return;
    }

    let updatedCount = 0;
    const maxRows = 100; // จำกัดจำนวนแถวเพื่อป้องกัน infinite loop

    // Loop ที่ปลอดภัย
    for (let i = 1; i < Math.min(data.length, maxRows + 1); i++) {
      Logger.log(`🔄 Processing row ${i}...`);
      
      const row = data[i];
      const empId = row[empIdIndex];
      const email = row[emailIndex];

      // ตรวจสอบข้อมูล
      if (!empId || !email) {
        Logger.log(`⚠️ Skipping row ${i}: EmpId='${empId}', Email='${email}'`);
        continue;
      }

      // สร้าง password
      const emailPrefix = email.split('@')[0];
      const newPasswordString = emailPrefix + empId;
      
      Logger.log(`🔐 Generating hash for: ${newPasswordString}`);

      const newPasswordHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, newPasswordString)
                                      .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                                      .join('');

      // อัปเดตข้อมูล
      data[i][passwordIndex] = newPasswordHash;
      updatedCount++;
      
      Logger.log(`✅ Updated row ${i}: ${newPasswordHash.substring(0, 10)}...`);
    }

    // เขียนข้อมูลกลับ
    if (updatedCount > 0) {
      Logger.log(`💾 Writing ${updatedCount} updates to sheet...`);
      dataRange.setValues(data);
      Logger.log("✅ Password renewal completed successfully");
      SpreadsheetApp.getUi().alert(`สร้างรหัสผ่านใหม่เรียบร้อยแล้ว (${updatedCount} รายการ)`);
    } else {
      Logger.log("⚠️ No rows were updated");
      SpreadsheetApp.getUi().alert('ไม่มีข้อมูลที่ต้องอัปเดต');
    }

  } catch (error) {
    Logger.log('💥 Error in renew_password_safe: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    SpreadsheetApp.getUi().alert('เกิดข้อผิดพลาด: ' + error.toString());
  }
}