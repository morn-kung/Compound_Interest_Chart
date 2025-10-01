# การทำงานของ `doOptions(e)` ใน Google Apps Script

## วัตถุประสงค์
เอกสารนี้อธิบายการทำงานของฟังก์ชัน `doOptions(e)` ใน Google Apps Script ซึ่งใช้สำหรับจัดการ HTTP OPTIONS requests ที่เบราว์เซอร์ส่งมาในขั้นตอน CORS preflight checks.

---

## การทำงานของ `doOptions(e)`

### 1. HTTP OPTIONS Requests
- เมื่อ Frontend (เช่น JavaScript) ส่งคำขอไปยัง Backend (Google Apps Script) ที่อยู่ในโดเมนต่างกัน (Cross-Origin Request) เบราว์เซอร์จะส่งคำขอ OPTIONS ก่อน.
- คำขอ OPTIONS มีวัตถุประสงค์เพื่อสอบถามว่าเซิร์ฟเวอร์อนุญาตให้ทำงานข้ามโดเมนหรือไม่.

### 2. การตอบสนองของ `doOptions(e)`
- ฟังก์ชัน `doOptions(e)` จะตอบกลับคำขอ OPTIONS ด้วยข้อมูลที่เบราว์เซอร์ต้องการ.
- ตัวอย่างโค้ด:
```javascript
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

### 3. การทำงานร่วมกับเบราว์เซอร์
- เบราว์เซอร์ตรวจสอบการตอบกลับจาก `doOptions(e)`.
- หากการตอบกลับถูกต้อง เบราว์เซอร์จะส่งคำขอจริง (GET, POST, PUT, DELETE ฯลฯ) ไปยังเซิร์ฟเวอร์.

---

## หมายเหตุ
1. **CORS Preflight Checks**:
   - ฟังก์ชัน `doOptions(e)` มีบทบาทสำคัญในการอนุญาตให้ API ทำงานข้ามโดเมนได้.

2. **ContentService**:
   - ใช้ `ContentService.createTextOutput()` เพื่อสร้างการตอบกลับที่เรียบง่าย.

3. **การตั้งค่า Web App**:
   - ตรวจสอบว่า Web App ถูกเผยแพร่ในรูปแบบ "Anyone, even anonymous" เพื่อให้รองรับ CORS.

---

## สรุป
- ฟังก์ชัน `doOptions(e)` เป็นส่วนสำคัญในการจัดการ CORS preflight requests.
- การตอบสนองที่ถูกต้องช่วยให้เบราว์เซอร์สามารถส่งคำขอจริงไปยัง API ได้.

หากมีคำถามเพิ่มเติมเกี่ยวกับการทำงานของ `doOptions(e)` สามารถติดต่อได้ครับ! 😊