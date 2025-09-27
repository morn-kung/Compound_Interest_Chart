# 🚀 Google Apps Script Deployment Guide

## 📋 การ Deploy แบบ Update (แนะนำ)

### ✅ ข้อดีของการ Update Deploy:
- **URL เดิมยังใช้ได้**: ไม่ต้องเปลี่ยน config.js ทุกครั้ง
- **เวลาประหยัด**: ไม่ต้องรอ propagation ของ URL ใหม่
- **ลด Config Management**: ไม่ต้องอัปเดต frontend หลายไฟล์

### 🔄 ขั้นตอนการ Update Deploy:

#### 1. เปิด Google Apps Script Editor
- ไปที่ script.google.com
- เปิด project: **Compound_Interest**

#### 2. อัปเดตไฟล์ที่เปลี่ยนแปลง:

**📄 ไฟล์ที่ต้องอัปเดต:**
- ✅ `Code.js` - เพิ่ม debug endpoints ใหม่
- ✅ `DebugLogin.js` - สร้างไฟล์ใหม่ (ถ้ายังไม่มี)
- ✅ `TestLogin.js` - อัปเดตถ้ามีการเปลี่ยนแปลง

#### 3. การ Update Deploy (ไม่ใช่ New Deploy):

**📍 ขั้นตอน:**
1. คลิค **"Deploy"** (ปุ่มสีน้ำเงิน)
2. เลือก **"Manage deployments"**
3. หา deployment ที่มี URL: `AKfycbzl0_MJ047GyERwOy3dJ-yEUPFmNIUVwkWdxva6Z0Fttgjj_VI73HqzzJueGjb2V4Bt`
4. คลิค **Edit** (ไอคอน ✏️)
5. เปลี่ยน **Version** จาก "Head" เป็น **"New"**
6. คลิค **"Deploy"**

#### 4. ตรวจสอบการ Update:
- URL จะยังคงเดิม: `AKfycbzl0_MJ047GyERwOy3dJ-yEUPFmNIUVwkWdxva6Z0Fttgjj_VI73HqzzJueGjb2V4Bt`
- เปิด browser ใหม่แล้วทดสอบ

---

## 🧪 ไฟล์ที่ต้องเพิ่ม/อัปเดตใน GAS:

### 📄 DebugLogin.js (ไฟล์ใหม่)
```javascript
// Copy จากไฟล์ backend/gg/src/DebugLogin.js
```

### 📄 Code.js (อัปเดต)
เพิ่ม endpoints ใหม่:
- `case 'testLoginWithFullDebug':`
- `case 'testDirectAuthentication':`
- `if (action === 'debugPOST')`

---

## 🎯 ทดสอบหลัง Update:

### 1. ทดสอบ Endpoints ใหม่
```javascript
// GET Test
https://script.google.com/macros/s/AKfycbzl0_MJ047GyERwOy3dJ-yEUPFmNIUVwkWdxva6Z0Fttgjj_VI73HqzzJueGjb2V4Bt/exec?action=testLoginWithFullDebug&username=4498&password=likit.se4498
```

### 2. ทดสอบ POST Debug
```javascript
// POST Test via frontend
เปิดไฟล์ test-deep-debug-post.html
คลิก "POST Debug"
```

---

## 🔧 Tips สำหรับการ Deploy:

### ✅ Best Practices:
1. **Always Update**: ใช้ "Update" แทน "New" ยกเว้นครั้งแรก
2. **Test First**: ทดสอบใน Script Editor ก่อน deploy
3. **Check Logs**: ดู Execution Log ถ้ามี error
4. **Cache Clear**: รอ 1-2 นาทีหรือ hard refresh browser

### 🚨 หาก Update ไม่ได้:
1. ลอง **New Deployment** แทน
2. อัปเดต URL ใน `config.js`
3. อัปเดต URL ในไฟล์ test ทั้งหมด

---

## 📱 Quick Test Commands:

### ทดสอบว่า Deploy สำเร็จ:
```javascript
fetch('https://script.google.com/macros/s/AKfycbzl0_MJ047GyERwOy3dJ-yEUPFmNIUVwkWdxva6Z0Fttgjj_VI73HqzzJueGjb2V4Fttgjj_VI73HqzzJueGjb2V4Bt/exec?action=testConfiguration')
.then(r => r.json())
.then(console.log)
```

### ทดสอบ Debug Endpoint:
```javascript
fetch('https://script.google.com/macros/s/AKfycbzl0_MJ047GyERwOy3dJ-yEUPFmNIUVwkWdxva6Z0Fttgjj_VI73HqzzJueGjb2V4Bt/exec?action=testLoginWithFullDebug&username=4498&password=likit.se4498')
.then(r => r.json())
.then(console.log)
```