[
  {
    "EmpId": "4497",
    "FullNameTH": "นาย สุพจน์ ศิริเหรียญทอง",
    "Email": "supoths@gmail.com",
    "Role": "user",
    "Userstatus": "1",
    "password": "#ERROR!"
  },
  {
    "EmpId": "4498",
    "FullNameTH": "นาย ลิขิต สีพาฮาด",
    "Email": "likit.se@irpc.co.th",
    "Role": "admin",
    "Userstatus": "1",
    "password": "0f34ff62ae49b390d17fae50c11e821b592af11419973524e4ee437b1486f52a"
  }
]

function renew_password() { // function นี้จะเพื่อสร้างรหัสผ่านใหม่ (hash) โดยใช้ส่วนหนึ่งของ Email (weerachai.in) และ EmpId (1102) มาต่อกัน
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = spreadsheet.getSheetByName("user");

  if (!userSheet) {
    SpreadsheetApp.getUi().alert('ไม่พบชีตชื่อ "user"');
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

  // Get the indices of the columns we need.
  const empIdIndex = headerMap['EmpId'];
  const emailIndex = headerMap['Email'];
  const passwordIndex = headerMap['password'];

  // Loop through each row of data (starting from the second row to skip headers)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const empId = row[empIdIndex];
    const email = row[emailIndex];

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
  }

  // Write the updated data back to the sheet.
  dataRange.setValues(data);
  
  SpreadsheetApp.getUi().alert('สร้างรหัสผ่านใหม่เรียบร้อยแล้ว');
}