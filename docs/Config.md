# อธิบายไฟล์ `backend/gg/src/Config.js`

ไฟล์ `Config.js` เป็นไฟล์ศูนย์กลางสำหรับการตั้งค่าคอนฟิกของระบบ Trading Journal (Google Apps Script)

## โครงสร้างและหน้าที่หลัก

### 1. ข้อมูล Spreadsheet
- `SPREADSHEET_ID` : กำหนดรหัสของ Google Spreadsheet หลักที่ระบบจะใช้งาน

### 2. ชื่อชีท (Sheet Names)
- `SHEETS` : กำหนดชื่อชีทต่างๆ ที่ใช้ในระบบ เช่น Trading_Journal, Accounts, Assets, user, UserTokens

### 3. ข้อความแจ้งเตือน/ข้อผิดพลาด (Error Messages)
- `MESSAGES` : รวมข้อความที่ใช้แจ้งเตือนหรือแสดงข้อผิดพลาด เช่น ไม่พบชีท, รหัสบัญชีไม่ถูกต้อง, ข้อมูลไม่ครบถ้วน ฯลฯ

### 4. ค่าตั้งต้น (Default Values)
- `DEFAULTS` : กำหนดค่าตั้งต้นที่ใช้ในระบบ เช่น
  - `CURRENCY` : สกุลเงินเริ่มต้น (USD)
  - `TIMEZONE` : เขตเวลาเริ่มต้น (Asia/Bangkok)
  - `DECIMAL_PLACES` : จำนวนทศนิยมเริ่มต้น (2)

### 5. Column Mappings for Sheets
- `COLUMNS` : กำหนด mapping ระหว่างชื่อฟิลด์กับลำดับคอลัมน์ในแต่ละชีท เช่น
  - `TRADING_JOURNAL` :
    - `TRANSACTION_ID: 0` (คอลัมน์แรก)
    - ...
    - `TRADE_DATE: 9` (คอลัมน์ที่สิบ)
  - `ACCOUNTS`, `ASSETS`, `USER` : mapping สำหรับแต่ละชีท

**ข้อดีของการใช้ Column Mapping**
- ทำให้โค้ดอ่านง่ายและลดข้อผิดพลาด
- เวลาจะอ่าน/เขียนข้อมูลในชีท สามารถอ้างอิงด้วยชื่อฟิลด์ ไม่ต้องจำเลขคอลัมน์
- ถ้าโครงสร้างชีทเปลี่ยน แก้ไข mapping ที่เดียวก็พอ

### 6. ฟังก์ชันช่วยเหลือ
- `getSpreadsheet()` : ดึง Spreadsheet หลักโดยใช้ฟังก์ชันจาก Services_System.js
- `getSheet(sheetName)` : ดึงชีทตามชื่อ ถ้าไม่พบจะ throw error

## สรุป
Config.js คือจุดเดียวที่รวมการตั้งค่าหลักของระบบ ทั้งชื่อชีท ข้อความ ค่าตั้งต้น และ mapping คอลัมน์ ช่วยให้โค้ดส่วนอื่นๆ เรียกใช้งานได้ง่ายและบำรุงรักษาสะดวก
