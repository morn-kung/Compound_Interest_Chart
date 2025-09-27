# 📋 Google Apps Script + Clasp Setup Guide

## 🎯 ไฟล์ที่จำเป็นสำหรับ Clasp Project

### 1. 📁 **Root Directory Files**
```
d:\CompoundInterateAppsheet\gg\
├── .clasp.json              # ⚠️ จำเป็น - การเชื่อมต่อกับ Google Apps Script
└── src/                     # โฟลเดอร์เก็บ source code
```

### 2. 📁 **Source Directory (src/) Files**
```
src/
├── appsscript.json          # ⚠️ จำเป็น - Manifest file สำหรับ Google Apps Script
├── Code.js                  # Main entry points (doGet, doPost)
├── Config.js                # Configuration settings
├── Utils.js                 # Utility functions
├── AccountService.js        # Account operations
├── AssetService.js          # Asset operations
├── TradingService.js        # Trading operations
└── TestFunctions.js         # Testing functions
```

---

## ⚠️ **ไฟล์บังคับ (Required Files)**

### **1. `.clasp.json` - Project Configuration**
```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE",
  "rootDir": "./src",
  "scriptExtensions": [".js", ".gs"],
  "htmlExtensions": [".html"],
  "jsonExtensions": [".json"],
  "filePushOrder": [],
  "skipSubdirectories": false
}
```

**สิ่งที่ต้องระวัง:**
- ⚠️ **scriptId** ต้องตรงกับ Google Apps Script project
- ⚠️ **rootDir** ต้องชี้ไปที่โฟลเดอร์ที่เก็บ source code
- ⚠️ หากไม่มีไฟล์นี้ clasp จะไม่รู้ว่าต้อง push ไปไหน

### **2. `appsscript.json` - Google Apps Script Manifest**
```json
{
  "timeZone": "Asia/Bangkok",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER", 
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

**สิ่งที่ต้องระวัง:**
- ⚠️ **จำเป็นต้องมี** สำหรับทุก Google Apps Script project
- ⚠️ หากไม่มี webapp config จะ deploy web app ไม่ได้
- ⚠️ timeZone ส่งผลต่อการทำงานของ Date/Time functions

---

## 🔧 **Optional Files (แนะนำ)**

### **3. `.claspignore` - Ignore Files**
```
# Ignore บางไฟล์ไม่ให้ push
node_modules/**
*.md
.git/**
.env
```

### **4. `package.json` - Node.js Dependencies (ถ้าใช้)**
```json
{
  "name": "trading-journal-gas",
  "version": "1.0.0",
  "description": "Trading Journal Google Apps Script",
  "scripts": {
    "push": "clasp push",
    "deploy": "clasp deploy",
    "open": "clasp open"
  },
  "devDependencies": {
    "@google/clasp": "^2.4.2"
  }
}
```

---

## 🚀 **Setup Steps**

### **Step 1: เตรียม Google Apps Script Project**
1. เปิด https://script.google.com
2. สร้าง New Project หรือใช้ project ที่มีอยู่
3. Copy Script ID จาก URL

### **Step 2: Setup Clasp**
```powershell
# ติดตั้ง clasp (ถ้ายังไม่มี)
npm install -g @google/clasp

# Login เข้า Google Account
clasp login

# สร้าง .clasp.json (ในกรณีที่ต้องการเชื่อมต่อ project ที่มีอยู่)
# ไม่ต้องใช้ clasp clone
```

### **Step 3: สร้างไฟล์ที่จำเป็น**
```powershell
# สร้าง .clasp.json
{
  "scriptId": "YOUR_SCRIPT_ID",
  "rootDir": "./src"
}

# สร้าง src/appsscript.json
{
  "timeZone": "Asia/Bangkok",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

### **Step 4: Push Code**
```powershell
cd your-project-directory
clasp push                # Push ไฟล์ทั้งหมด
clasp push --force        # Force overwrite (ถ้ามี conflict)
```

---

## ❌ **ข้อผิดพลาดที่พบบ่อย**

### **1. Missing .clasp.json**
```
Error: Did not find .clasp.json
```
**แก้ไข:** สร้าง .clasp.json ในโฟลเดอร์ root

### **2. Wrong Script ID**
```
Error: Could not read API credentials
```
**แก้ไข:** ตรวจสอบ scriptId ใน .clasp.json

### **3. Missing appsscript.json**
```
Error: manifest file is missing
```
**แก้ไข:** สร้าง appsscript.json ใน src/

### **4. Permission Denied**
```
Error: You do not have permission
```
**แก้ไข:** ตรวจสอบสิทธิ์ใน Google Apps Script project

---

## 📖 **คำสั่ง Clasp ที่ใช้บ่อย**

```powershell
clasp login              # Login เข้า Google Account
clasp logout             # Logout
clasp status             # ตรวจสอบสถานะไฟล์
clasp list               # แสดง project ทั้งหมด
clasp open               # เปิด Google Apps Script editor
clasp push               # Push code ขึ้น Google Apps Script
clasp pull               # Pull code จาก Google Apps Script มา local
clasp deploy             # Deploy web app
clasp deployments        # แสดง deployment ทั้งหมด
clasp logs               # ดู execution logs
clasp run functionName   # รัน function (ต้อง setup OAuth ก่อน)
```

---

## 🎯 **Best Practices**

### **File Organization**
- ✅ แยกไฟล์ตาม function (Service pattern)
- ✅ ใช้ meaningful file names
- ✅ เก็บ config แยกต่างหาก

### **Development Workflow**
- ✅ ใช้ `clasp status` ก่อน push
- ✅ Test functions ใน Google Apps Script editor ก่อน
- ✅ ใช้ `clasp logs` เพื่อ debug

### **Security**
- ✅ ตรวจสอบ webapp access settings
- ✅ ไม่เก็บ sensitive data ใน code
- ✅ ใช้ PropertiesService สำหรับ secrets

---

## 🔍 **Troubleshooting**

### **หากมีปัญหาการ push**
```powershell
# ตรวจสอบสถานะ
clasp status

# ดู log
clasp logs

# Force push (ระวัง! จะ overwrite ทุกอย่าง)
clasp push --force
```

### **หากต้องการ sync กับ remote**
```powershell
# Pull code จาก Google Apps Script มาก่อน
clasp pull

# แล้วค่อย push
clasp push
```

---

**สรุป:** ไฟล์ที่จำเป็นคือ `.clasp.json` และ `appsscript.json` เท่านั้น ส่วนไฟล์อื่นๆ เป็น source code ตามความต้องการของ project