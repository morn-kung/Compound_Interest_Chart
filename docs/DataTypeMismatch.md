# ข้อควรระวังเกี่ยวกับ Data Type Mismatch ใน Google Sheet

Google Sheet เป็นเครื่องมือที่มีความยืดหยุ่นสูง แต่ในบางครั้งการจัดการกับข้อมูลที่มีหลายประเภท (Data Type) อาจทำให้เกิดปัญหา Data Type Mismatch ได้ โดยเฉพาะเมื่อใช้ Google Apps Script ในการดึงข้อมูลหรือเปรียบเทียบข้อมูลจาก Google Sheet

## ข้อควรระวัง

1. **String กับ Number**
   - Google Sheet อาจแสดงตัวเลขในรูปแบบ String ได้ เช่น `"123"` แทนที่จะเป็น `123`
   - ควรตรวจสอบและแปลงค่าที่ดึงมาจาก Google Sheet ให้เป็นประเภทข้อมูลที่เหมาะสมก่อนใช้งาน เช่น ใช้ `Number()` หรือ `parseInt()` เพื่อแปลง String เป็น Number

2. **Boolean กับ String**
   - ค่า Boolean เช่น `TRUE` หรือ `FALSE` ใน Google Sheet อาจถูกดึงมาเป็น String (`"TRUE"`, `"FALSE"`)
   - ควรตรวจสอบและแปลงค่า Boolean ให้ถูกต้อง เช่น ใช้ `value === "TRUE"` เพื่อเปรียบเทียบ

3. **Case Sensitivity**
   - การเปรียบเทียบ String ใน Google Apps Script เป็น Case Sensitive เช่น `"Admin"` ไม่เท่ากับ `"admin"`
   - ควรใช้ฟังก์ชัน `toLowerCase()` หรือ `toUpperCase()` เพื่อทำให้การเปรียบเทียบไม่สนใจตัวพิมพ์ใหญ่-เล็ก

4. **Empty Cell**
   - ช่องว่างใน Google Sheet อาจถูกดึงมาเป็น `undefined`, `null`, หรือ `""`
   - ควรตรวจสอบค่าที่ดึงมาเสมอ เช่น ใช้ `if (!value)` เพื่อตรวจสอบช่องว่าง

5. **Date Format**
   - วันที่ใน Google Sheet อาจถูกดึงมาในรูปแบบ Timestamp หรือ String
   - ควรใช้ `new Date(value)` เพื่อแปลงค่าให้เป็น Date Object ก่อนใช้งาน

## ตัวอย่างโค้ด

```javascript
function findUserByUsername(username) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const storedUsername = row[0]; // สมมติว่า Column A คือ Username

    // แปลงค่า String ให้เป็นตัวพิมพ์เล็กเพื่อเปรียบเทียบ
    if (storedUsername && storedUsername.toLowerCase() === username.toLowerCase()) {
      return row;
    }
  }

  return null;
}

function verifyPassword(inputPassword, storedPassword) {
  // ตรวจสอบและแปลงค่า String
  if (String(inputPassword) === String(storedPassword)) {
    return true;
  }
  return false;
}
```

## การจัดการ Login ในโปรเจคนี้

ในโปรเจคนี้ ระบบ Login ถูกออกแบบให้ทำงานร่วมกับ Google Sheet โดยใช้ Google Apps Script เพื่อจัดการข้อมูลผู้ใช้งาน เช่น Username และ Password โดยมีการจัดการ Data Type Mismatch เพื่อให้ระบบทำงานได้อย่างถูกต้องและมีประสิทธิภาพ

### การจัดการ Data Type Mismatch ใน Login

1. **การเปรียบเทียบ Username**
   - Username ที่ดึงมาจาก Google Sheet อาจมีปัญหาเรื่องตัวพิมพ์ใหญ่-เล็ก (Case Sensitivity)
   - ใช้ฟังก์ชัน `toLowerCase()` เพื่อแปลง Username ทั้งจาก Input และจาก Google Sheet ให้เป็นตัวพิมพ์เล็กก่อนเปรียบเทียบ

2. **การตรวจสอบ Password**
   - Password ที่ดึงมาจาก Google Sheet อาจอยู่ในรูปแบบ String หรืออาจมีช่องว่างที่ไม่จำเป็น
   - ใช้ฟังก์ชัน `String()` เพื่อแปลงค่า Password ให้เป็น String และใช้ `trim()` เพื่อลบช่องว่างที่ไม่จำเป็น

3. **การจัดการช่องว่าง (Empty Cell)**
   - ตรวจสอบค่าที่ดึงมาจาก Google Sheet เสมอ เช่น ใช้ `if (!value)` เพื่อตรวจสอบว่าค่าเป็น `undefined`, `null`, หรือช่องว่าง (`""`)

### ตัวอย่างโค้ด Login

```javascript
function login(username, password) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const storedUsername = row[0]; // Column A: Username
    const storedPassword = row[1]; // Column B: Password

    // จัดการ Data Type Mismatch
    if (
      storedUsername &&
      storedUsername.toLowerCase() === username.toLowerCase() &&
      String(storedPassword).trim() === String(password).trim()
    ) {
      return {
        success: true,
        message: "Login successful",
        user: {
          username: storedUsername,
          role: row[2], // Column C: Role
        },
      };
    }
  }

  return {
    success: false,
    message: "Invalid username or password",
  };
}
```

### การ Return JSON จากระบบ Login

ระบบ Login ในโปรเจคนี้มีการ Return JSON เพื่อแจ้งสถานะการทำงานให้กับผู้ใช้งาน โดยมีรายละเอียดดังนี้:

#### กรณี Login สำเร็จ
- ระบบจะสร้าง Token ใหม่และส่งข้อมูลผู้ใช้งานกลับไปใน JSON
- ตัวอย่าง JSON:
```json
{
  "status": "success",
  "message": "เข้าสู่ระบบสำเร็จ",
  "user": {
    "id": "12345",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "role": "admin",
    "status": 1
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "timestamp": "2025-09-30T12:00:00.000Z"
}
```

#### กรณี Login ไม่สำเร็จ
- หาก Username หรือ Password ไม่ถูกต้อง ระบบจะส่ง JSON พร้อมข้อความแจ้งเตือน
- ตัวอย่าง JSON:
```json
{
  "status": "error",
  "message": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
  "timestamp": "2025-09-30T12:00:00.000Z"
}
```

#### กรณีต้องเปลี่ยนรหัสผ่านก่อนเข้าใช้งาน (SAP Style)
- หากผู้ใช้งานต้องเปลี่ยนรหัสผ่านก่อนเข้าใช้งาน ระบบจะส่งสถานะ `password_change_required` พร้อมข้อมูลผู้ใช้งาน
- ตัวอย่าง JSON:
```json
{
  "status": "password_change_required",
  "message": "กรุณาเปลี่ยนรหัสผ่านก่อนเข้าใช้งาน",
  "user": {
    "id": "12345",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "role": "admin"
  },
  "action": "change_password",
  "timestamp": "2025-09-30T12:00:00.000Z"
}
```

### สรุป
- ระบบ Login ในโปรเจคนี้ใช้ Google Apps Script และ Google Sheet ในการจัดการข้อมูล
- มีการจัดการ Data Type Mismatch เช่น การแปลง String, การจัดการ Case Sensitivity และการตรวจสอบช่องว่าง
- ผลลัพธ์ของการ Login จะถูกส่งกลับในรูปแบบ JSON เพื่อให้ User ทราบสถานะการทำงานของระบบ

## สรุป
- ตรวจสอบประเภทข้อมูล (Data Type) เสมอเมื่อดึงข้อมูลจาก Google Sheet
- ใช้ฟังก์ชันแปลงข้อมูล เช่น `String()`, `Number()`, `toLowerCase()` เพื่อป้องกันปัญหา Data Type Mismatch
- เพิ่มการตรวจสอบค่าที่เป็นไปได้ เช่น ช่องว่าง (`undefined`, `null`, `""`)

การปฏิบัติตามข้อควรระวังเหล่านี้จะช่วยลดข้อผิดพลาดที่อาจเกิดขึ้นจาก Data Type Mismatch และทำให้โค้ดของคุณมีความเสถียรมากขึ้น