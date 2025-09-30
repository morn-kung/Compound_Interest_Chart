Access-Control-Allow-Origin: * เพื่ออนุญาตทุก Origin ในระหว่างการพัฒนา (Dev) และใช้งานเพียงคนเดียว ทั้ง Frontend และ Backend (GAS) คุณสามารถทำได้ดังนี้:

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