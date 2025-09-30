หากคุณต้องการพัฒนา (dev) ด้วย VS Code + Live Server และทำการ CRUD โดยไม่ให้ติดปัญหา CORS ขณะพัฒนา คุณสามารถทำตามขั้นตอนดังนี้
1. อนุญาต Live Server ใน CORS Header
ใน Google Apps Script (GAS) คุณสามารถเพิ่ม http://127.0.0.1:5500 (หรือ URL ของ Live Server) ใน CORS Header เพื่ออนุญาตให้ Frontend ที่รันจาก Live Server เข้าถึง Backend ได้:
return ContentService.createTextOutput(JSON.stringify(response))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500'); // อนุญาต Live Server

หากต้องการอนุญาตทั้ง Live Server และ GitHub Pages พร้อมกัน คุณสามารถใช้เงื่อนไขเพื่อตรวจสอบ Origin ของคำขอ:
function doPost(e) {
  const origin = e.parameter.origin || e.headers['Origin']; // ตรวจสอบ Origin
  const allowedOrigins = ['http://127.0.0.1:5500', 'https://username.github.io']; // รายการ Origin ที่อนุญาต

  const response = handlePostRequest(e); // ฟังก์ชันที่จัดการคำขอ POST

  const corsHeader = allowedOrigins.includes(origin) ? origin : 'null'; // ตรวจสอบว่า Origin อยู่ในรายการที่อนุญาตหรือไม่

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', corsHeader); // ตั้งค่า CORS Header
}

2. ใช้ Proxy Server (สำหรับ Dev)
อีกวิธีหนึ่งคือการใช้ Proxy Server เพื่อหลีกเลี่ยงปัญหา CORS ขณะพัฒนา:

ติดตั้ง http-proxy-middleware:
npm install http-proxy-middleware
ตั้งค่า Proxy ใน Dev Server:

สร้างไฟล์ proxy.js:
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const app = express();

app.use(
  '/api',
  createProxyMiddleware({
    target: 'https://script.google.com/macros/s/.../exec', // URL ของ Google Apps Script
    changeOrigin: true,
    pathRewrite: { '^/api': '' }, // ลบ '/api' ออกจาก URL
  })
);

app.listen(3000, () => {
  console.log('Proxy server is running on http://localhost:3000');
});
รัน Proxy Server:
ใน script.js ของคุณ เปลี่ยน URL ของ Backend เป็น Proxy:
const GAS_URL = 'http://localhost:3000/api';

3. ใช้ Access-Control-Allow-Origin: * (เฉพาะ Dev)
หากคุณต้องการหลีกเลี่ยงปัญหา CORS ชั่วคราวในระหว่างการพัฒนา คุณสามารถตั้งค่าให้อนุญาตทุก Origin ได้:
return ContentService.createTextOutput(JSON.stringify(response))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeader('Access-Control-Allow-Origin', '*'); // อนุญาตทุก Origin
  ข้อควรระวัง: วิธีนี้ไม่ปลอดภัยและควรใช้เฉพาะในระหว่างการพัฒนาเท่านั้น ห้ามใช้ใน Production.
  4. ทดสอบระบบ
รัน Live Server ใน VS Code (เช่น http://127.0.0.1:5500).
ทดสอบ CRUD โดยเชื่อมต่อกับ Google Apps Script Backend.
หากใช้ Proxy Server ให้ตรวจสอบว่า Proxy ทำงานอยู่ (http://localhost:3000).
สรุป
สำหรับ Dev: ใช้ http://127.0.0.1:5500 ใน CORS Header หรือใช้ Proxy Server.
สำหรับ Production: ใช้ https://username.github.io ใน CORS Header.
หลีกเลี่ยงปัญหา CORS: ตรวจสอบให้แน่ใจว่า Origin ของคำขออยู่ในรายการที่อนุญาต.

# ใน project นี้ขอเลือกวิธี ที่ 3 

หากคุณเลือกวิธีที่ 3 ซึ่งใช้ Access-Control-Allow-Origin: * เพื่ออนุญาตทุก Origin ในระหว่างการพัฒนา (Dev) และใช้งานเพียงคนเดียว ทั้ง Frontend และ Backend (GAS) คุณสามารถทำได้ดังนี้:

แก้ไขใน Google Apps Script (GAS)
เปิดไฟล์ Code.js ใน Google Apps Script Editor.
เพิ่ม .setHeader('Access-Control-Allow-Origin', '*') ในทุกคำตอบของ API (ทั้ง doPost และ doGet).

function doPost(e) {
  try {
    const response = handlePostRequest(e); // ฟังก์ชันที่จัดการคำขอ POST
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*'); // อนุญาตทุก Origin
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*'); // อนุญาตทุก Origin ในกรณีเกิดข้อผิดพลาด
  }
}

function doGet(e) {
  try {
    const response = handleGetRequest(e); // ฟังก์ชันที่จัดการคำขอ GET
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*'); // อนุญาตทุก Origin
  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*'); // อนุญาตทุก Origin ในกรณีเกิดข้อผิดพลาด
  }
}

ข้อควรระวัง
การใช้ Access-Control-Allow-Origin: * จะอนุญาตให้ทุก Origin สามารถเข้าถึง API ของคุณได้ ซึ่งอาจไม่ปลอดภัยในกรณีที่มีผู้ใช้งานหลายคนหรือระบบที่ต้องการความปลอดภัยสูง.
หากคุณมั่นใจว่าใช้งานเพียงคนเดียว และระบบไม่ได้เปิดให้บุคคลภายนอกใช้งาน วิธีนี้ถือว่าเหมาะสมสำหรับการพัฒนา.
ขั้นตอนการ Deploy
Deploy Web App:

ไปที่ Deploy > New Deployment หรือ Manage Deployments.
เลือก Web App.
ตั้งค่า:
Execute as: Me.
Who has access: Anyone.
ทดสอบระบบ:

เปิด Live Server ใน VS Code (เช่น http://127.0.0.1:5500).
ใช้ fetch หรือ Postman เพื่อส่งคำขอไปยัง Google Apps Script Web App.
ตรวจสอบว่าไม่มีปัญหา CORS Policy Error.
สรุป
ใช้ Access-Control-Allow-Origin: * เพื่ออนุญาตทุก Origin.
เหมาะสำหรับการพัฒนาและใช้งานส่วนตัว.
อย่าลืม Deploy Web App ใหม่ทุกครั้งที่มีการแก้ไขโค้ด.