# 🧪 ขั้นตอนการทดสอบระบบหลัง Refactor

## 📋 **สิ่งที่ต้องทดสอบ**

### 1. 🌐 **การเชื่อมต่อ GAS (CORS Test)**
- ✅ เข้าถึง GAS URL ได้หรือไม่
- ✅ CORS headers ทำงานอัตโนมัติหรือไม่
- ✅ GET/POST requests ส่งได้หรือไม่

### 2. 🔐 **ระบบ Login**
- ✅ Login ด้วยข้อมูลถูกต้อง
- ✅ Login ด้วยข้อมูลผิด
- ✅ Token generation
- ✅ Password change requirements

### 3. 📊 **API Endpoints**
- ✅ GET requests (public endpoints)
- ✅ POST requests (authenticated endpoints)
- ✅ Error handling
- ✅ JSON response format

---

## 🚀 **วิธีการทดสอบ**

### **ขั้นตอนที่ 1: เปิดไฟล์ทดสอบ**
```
เปิด: D:\CompoundInterateAppsheet\frontend\refactor\login.html
ใน browser (Chrome, Firefox, Edge)
```

### **ขั้นตอนที่ 2: ตรวจสอบ Connection Status**
- ดูสถานะ connection indicator ข้าง Username field
- 🟢 เขียว = เชื่อมต่อสำเร็จ
- 🔴 แดง = เชื่อมต่อไม่ได้
- 🟡 เหลือง = กำลังเชื่อมต่อ

### **ขั้นตอนที่ 3: ทดสอบ Login**

#### **3.1 ทดสอบ Admin Login**
- คลิก `👨‍💼 Admin` หรือ Alt+1
- ดูผลลัพธ์ในกล่องด้านล่าง

#### **3.2 ทดสอบ User Login**
- คลิก `👤 User` หรือ Alt+2
- ดูผลลัพธ์ในกล่องด้านล่าง

#### **3.3 ทดสอบ Wrong Login**
- คลิก `❌ Wrong`
- ดูผลลัพธ์ในกล่องด้านล่าง

---

## 📊 **ผลลัพธ์ที่คาดหวัง**

### **✅ เมื่อเชื่อมต่อสำเร็จ**
```json
{
  "status": "success",
  "timestamp": "2025-10-03T...",
  "data": {
    "message": "Connection successful",
    "server": "Google Apps Script",
    "version": "V20251003T2233-Refactor",
    "status": "online"
  }
}
```

### **✅ เมื่อ Login สำเร็จ**
```json
{
  "status": "success",
  "timestamp": "2025-10-03T...",
  "data": {
    "message": "เข้าสู่ระบบสำเร็จ",
    "user": {
      "id": "4498",
      "fullName": "...",
      "email": "...",
      "role": "..."
    },
    "token": "eyJ..."
  }
}
```

### **❌ เมื่อ Login ผิด**
```json
{
  "status": "error",
  "timestamp": "2025-10-03T...",
  "message": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
  "code": 401
}
```

### **⚠️ เมื่อต้องเปลี่ยนรหัสผ่าน**
```json
{
  "status": "password_change_required",
  "timestamp": "2025-10-03T...",
  "message": "กรุณาเปลี่ยนรหัสผ่านก่อนเข้าใช้งาน",
  "action": "changePassword"
}
```

---

## 🔍 **การแก้ไขปัญหา CORS**

### **หากยังเจอ CORS Error:**

#### **1. ตรวจสอบ GAS Deployment**
- เข้า Google Apps Script Console
- Deploy as Web App
- Execute as: `Me`
- Who has access: `Anyone`

#### **2. ตรวจสอบ Browser Console**
- กด F12
- ดู Console tab
- หา CORS error messages

#### **3. ลองใช้ Server แทน File**
```bash
# ใช้ Python HTTP Server
cd D:\CompoundInterateAppsheet\frontend\refactor
python -m http.server 8000

# เปิด: http://localhost:8000/login.html
```

#### **4. ตรวจสอบ Network Tab**
- กด F12 > Network tab
- ส่ง request
- ดู response headers

---

## 📋 **Checklist การทดสอบ**

### **🌐 Connection Test**
- [ ] Connection indicator แสดงสถานะถูกต้อง
- [ ] ไม่มี CORS error ใน Console
- [ ] GET testConnection ทำงาน
- [ ] POST testConnection ทำงาน

### **🔐 Login Test**
- [ ] Admin login สำเร็จ
- [ ] User login สำเร็จ (หรือแสดง user not found)
- [ ] Wrong login แสดง error
- [ ] Token generation ทำงาน
- [ ] JSON response format ถูกต้อง

### **📊 API Response**
- [ ] Status codes ถูกต้อง (200, 401, 400, 500)
- [ ] JSON structure ตาม standard
- [ ] Error messages เป็นภาษาไทย
- [ ] Timestamp format ถูกต้อง

### **🎨 UI/UX**
- [ ] Loading states ทำงาน
- [ ] Color coding ถูกต้อง (green/red/yellow)
- [ ] Responsive design
- [ ] Keyboard shortcuts (Alt+1, Alt+2, Alt+C)

---

## 🚨 **หากมีปัญหา**

### **CORS ยังมีปัญหา**
1. ตรวจสอบ GAS deployment settings
2. ลอง redeploy GAS with new version
3. ใช้ local server แทน file://

### **Login ไม่ทำงาน**
1. ตรวจสอบ username/password ใน Google Sheets
2. ดู Console log สำหรับ debug info
3. ตรวจสอบ sheet permissions

### **API Response ผิด**
1. ดู Network tab ใน browser
2. ตรวจสอบ request payload
3. ดู GAS execution log

---

## 💡 **Tips การทดสอบ**

1. **ใช้ Browser Console** - กด F12 เพื่อดู detailed errors
2. **ลองหลาย Browser** - Chrome, Firefox, Edge
3. **ทดสอบบน Local Server** - หลีกเลี่ยง file:// limitations
4. **ดู Network Timing** - ตรวจสอบ response time
5. **Test ทั้ง Success และ Error Cases** - comprehensive testing

---

**📌 หมายเหตุ:** ไฟล์นี้จะอัปเดตตามผลการทดสอบและข้อเสนอแนะจากการใช้งานจริง