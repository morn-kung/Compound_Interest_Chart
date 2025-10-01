# วิธีการเขียน Google Apps Script เพื่อหลีกเลี่ยงปัญหา CORS

## วัตถุประสงค์
เอกสารนี้อธิบายวิธีการเขียนฟังก์ชัน `doGet(e)` และ `doPost(e)` ใน Google Apps Script เพื่อหลีกเลี่ยงปัญหา CORS ในระหว่างการพัฒนา (DEV) และการทำ CRUD ผ่าน Live Server.

---

## ขั้นตอนการทำงาน

### 1. ใช้ `doOptions(e)` เพื่อจัดการ Preflight Requests
ฟังก์ชัน `doOptions(e)` จะตอบสนองต่อ HTTP OPTIONS requests ซึ่งเป็นส่วนหนึ่งของ CORS preflight checks.

#### ตัวอย่างโค้ด:
```javascript
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

---

### 2. เผยแพร่ Web App ในรูปแบบ "Anyone, even anonymous"
- ไปที่ **Deploy > Manage Deployments** ใน Google Apps Script.
- ตั้งค่าการเข้าถึงเป็น "Anyone, even anonymous" เพื่อให้ Web App รองรับ CORS.

---

### 3. เขียนฟังก์ชัน `doGet(e)` และ `doPost(e)`
ใช้ `ContentService` เพื่อส่ง JSON response โดยไม่ต้องใช้ `.setHeader()`.

#### ตัวอย่าง `doGet(e)`:
```javascript
function doGet(e) {
  try {
    const params = e.parameter;
    const action = params.action;

    if (action === 'testlogin') {
      const result = testLogin(params.empId, params.password);
      return ContentService.createTextOutput(JSON.stringify({ success: true, result }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      throw new Error('Invalid action specified for GET request.');
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

#### ตัวอย่าง `doPost(e)`:
```javascript
function doPost(e) {
  try {
    let params;
    if (e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents); // JSON payload
      } catch (jsonError) {
        params = e.parameter; // Form data fallback
      }
    } else {
      params = e.parameter;
    }

    const action = params.action;

    if (action === 'login') {
      const result = testLogin(params.username, params.password);
      return ContentService.createTextOutput(JSON.stringify({ success: true, result }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      throw new Error('Invalid action specified for POST request.');
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## หมายเหตุ
1. **CORS Preflight Requests**:
   - ฟังก์ชัน `doOptions(e)` จะตอบสนองต่อ OPTIONS requests เพื่อให้เบราว์เซอร์สามารถทำ preflight checks ได้สำเร็จ.

2. **ContentService**:
   - ใช้ `ContentService.createTextOutput()` เพื่อส่ง JSON response.

3. **Error Handling**:
   - ใช้ `try...catch` เพื่อจัดการข้อผิดพลาดและส่งข้อความที่เหมาะสมกลับไปยัง client.

4. **เผยแพร่ Web App**:
   - ตรวจสอบว่า Web App ถูกเผยแพร่ในรูปแบบที่อนุญาตให้ทุก Origin เข้าถึงได้.

---

## สรุป
- ใช้ `doOptions(e)` เพื่อจัดการ CORS preflight requests.
- เขียน `doGet(e)` และ `doPost(e)` โดยใช้ `ContentService` สำหรับการตอบกลับ JSON.
- ตรวจสอบการตั้งค่าการเผยแพร่ Web App เพื่อให้รองรับ CORS.

หากมีคำถามเพิ่มเติม สามารถติดต่อได้ครับ! 😊