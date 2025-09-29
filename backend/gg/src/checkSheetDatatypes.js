/**
 * ฟังก์ชันหลักสำหรับเรียกใช้และแสดงผลลัพธ์ในรูปแบบ JSON Object String
 */
function getcheckSheetDatatypes() {
  const results = checkSheetDatatypes();
  
  // แปลง JavaScript Object Array ให้เป็น JSON string
  // 'null, 2' ใช้สำหรับจัดรูปแบบ JSON ให้อ่านง่าย (Pretty-print)
  const jsonString = JSON.stringify(results, null, 2); 
  
  // บันทึก JSON string ลงใน Log
  Logger.log('JSON Data Structure:');
  Logger.log(jsonString);
  
  return jsonString; // คืนค่า JSON string ด้วย (ถ้าต้องการ)
}

/**
 * ตรวจสอบ Header (แถวที่ 1) และ Datatype ของแถวที่ 2 ในแต่ละชีต 
 * และคืนค่าเป็น Array ของ Object
 * @returns {Array<Object>} List ของ Object ที่มี sheetName, headers และ dataTypes
 */
function checkSheetDatatypes() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets();
  const results = [];

  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    const sheetName = sheet.getName();
    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();

    let headers = [];
    let dataTypes = [];
    let status = "OK"; 

    if (lastCol > 0) {
      // 1. ดึงข้อมูล Header (แถวที่ 1)
      const headerRange = sheet.getRange(1, 1, 1, lastCol);
      headers = headerRange.getValues()[0].map(h => String(h).trim()); 

      // 2. ตรวจสอบ Datatype ในแถวที่ 2
      if (lastRow >= 2) {
        const dataRange = sheet.getRange(2, 1, 1, lastCol);
        const dataValues = dataRange.getValues()[0];
        
        dataTypes = dataValues.map(value => {
            let type = typeof value;
            if (type === 'object' && value instanceof Date) {
                return 'object (Date)'; 
            } else if (type === 'object' && value !== null) {
                return 'object';
            }
            return type;
        });
        
      } else {
        status = "No data in row 2, only headers available.";
        // ถ้าไม่มีข้อมูลในแถวที่ 2 ให้ระบุประเภทข้อมูลเป็น null ตามจำนวน Header
        dataTypes = headers.map(() => null); 
      }
    } else {
      status = "Sheet is empty (No columns or rows).";
    }

    // สร้าง object สำหรับผลลัพธ์
    const sheetData = {
      sheetName: sheetName,
      status: status,
      headers: headers,
      dataTypes: dataTypes
    };

    results.push(sheetData);
  }

  return results;
}
