Frontend จะส่งคำขอ (HTTP Requests) ไปยัง Google Apps Script (Backend) เพื่อทำการ CRUD ข้อมูลใน Google Sheets โดยที่ Google Apps Script จะต้องอนุญาตให้โดเมน https://username.github.io สามารถเข้าถึงได้ผ่านการตั้งค่า CORS Header ดังนี้:

return ContentService.createTextOutput(JSON.stringify(response))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeader('Access-Control-Allow-Origin', 'https://username.github.io');

ขั้นตอนการทำงาน
1. Deploy Frontend บน GitHub Pages

1.1 Push ไฟล์ index.html, script.js, และ styles.css ไปยัง GitHub Repository
1.2 ไปที่ Settings > Pages ใน GitHub
1.3 เลือก Branch และโฟลเดอร์ที่ต้องการ (เช่น /root)
1.4 GitHub จะสร้าง URL เช่น https://username.github.io
2. ปรับ Backend (Google Apps Script)

2.1 เพิ่ม .setHeader('Access-Control-Allow-Origin', 'https://username.github.io') ในทุกคำตอบของ API
ตัวอย่างใน Code.js:

return ContentService.createTextOutput(JSON.stringify(response))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeader('Access-Control-Allow-Origin', 'https://username.github.io');

3. เชื่อมต่อ Frontend กับ Backend

3.1 ใน script.js ของ Frontend ให้ใช้ URL ของ Google Apps Script Web App (เช่น https://script.google.com/macros/s/.../exec) เพื่อส่งคำขอ CRUD
ตัวอย่าง:

const GAS_URL = 'https://script.google.com/macros/s/.../exec';

fetch(GAS_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'create', data: { /* your data */ } })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

ทดสอบระบบ

1. เปิดหน้าเว็บ https://username.github.io
2. ทดสอบการ Login และ CRUD โดยเชื่อมต่อกับ Google Apps Script Backend
# สรุป
Frontend: Deploy บน GitHub Pages (https://username.github.io)
Backend: Google Apps Script ต้องตั้งค่า CORS Header ให้อนุญาต https://username.github.io
การเชื่อมต่อ: ใช้ Fetch API ใน Frontend เพื่อส่งคำขอไปยัง Google Apps Script