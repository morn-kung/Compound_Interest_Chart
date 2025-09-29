# Authentication & Password Reset System - Complete Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Login System](#login-system)
3. [SAP-Style Password Reset](#sap-style-password-reset)
4. [API Reference](#api-reference)
5. [Frontend Integration](#frontend-integration)
6. [Security Features](#security-features)
7. [Error Handling](#error-handling)
8. [Troubleshooting](#troubleshooting)

---

## 🔐 System Overview

The authentication system implements **SAP-style password reset** functionality with temporary passwords and forced password changes. The system supports both email and employee ID login methods with comprehensive security features.

### 🎯 Key Features:
- **Multi-format Login**: Email or Employee ID
- **SAP-style Password Reset**: Temporary password "Init4321"
- **Forced Password Change**: After temporary password usage
- **Token-based Authentication**: JWT-like tokens with 1-hour expiration
- **Comprehensive Validation**: User status, password requirements
- **Email Notifications**: Password reset notifications

---

## 🔑 Login System

### Frontend → Backend Flow

#### 1. **Login Request (Frontend)**
```javascript
// Frontend sends login data
const loginData = {
  action: 'login',
  username: 'user@example.com',  // Email OR Employee ID
  password: 'userPassword123'
};

// HTTP Request
fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams(loginData)
})
```

#### 2. **Backend Processing (Code.js)**
```javascript
case 'login':
  const username = params.username;
  const password = params.password;
  
  // Step 1: Authenticate user
  const authResult = authenticateUser(username, password);
  
  if (authResult.status === 'success') {
    // Step 2: Check if password change required
    const requirePasswordChange = userRow[CONFIG.COLUMNS.USER.REQUIRE_PASSWORD_CHANGE];
    
    if (requirePasswordChange === true || requirePasswordChange === 'true') {
      // Return special response for password change
      return {
        status: 'success',
        message: 'เข้าสู่ระบบสำเร็จ แต่ต้องเปลี่ยนรหัสผ่าน',
        requirePasswordChange: true,
        user: {
          empId: userRow[CONFIG.COLUMNS.USER.EMP_ID],
          fullName: userRow[CONFIG.COLUMNS.USER.FULL_NAME_TH],
          email: userRow[CONFIG.COLUMNS.USER.EMAIL],
          role: userRow[CONFIG.COLUMNS.USER.ROLE]
        }
      };
    } else {
      // Normal login success
      return {
        status: 'success',
        message: 'เข้าสู่ระบบสำเร็จ',
        token: authResult.token,
        user: authResult.user
      };
    }
  } else {
    // Login failed
    return {
      status: 'error',
      message: authResult.message
    };
  }
```

#### 3. **Backend Response Types**

**Success (Normal Login)**:
```json
{
  "status": "success",
  "message": "เข้าสู่ระบบสำเร็จ",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "empId": "EMP001",
    "fullName": "ทดสอบ ระบบ",
    "email": "test@example.com",
    "role": "user",
    "status": 1
  }
}
```

**Success (Password Change Required)**:
```json
{
  "status": "success",
  "message": "เข้าสู่ระบบสำเร็จ แต่ต้องเปลี่ยนรหัสผ่าน",
  "requirePasswordChange": true,
  "user": {
    "empId": "EMP001",
    "fullName": "ทดสอบ ระบบ",
    "email": "test@example.com",
    "role": "user"
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
}
```

#### 4. **Frontend Response Handling**
```javascript
const response = await fetch(API_URL, { /* login request */ });
const result = await response.json();

if (result.status === 'success') {
  if (result.requirePasswordChange) {
    // Show password change form
    showPasswordChangeForm(result.user);
  } else {
    // Normal login success
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('userData', JSON.stringify(result.user));
    redirectToMainApp();
  }
} else {
  // Show error message
  showErrorMessage(result.message);
}
```

---

## 🔄 SAP-Style Password Reset

### Complete Password Reset Workflow

#### Step 1: **Request Password Reset (Frontend)**
```javascript
// Frontend sends reset request
const resetData = {
  action: 'resetPassword',
  email: 'user@example.com'
};

fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams(resetData)
})
```

#### Step 2: **Backend Processing (PasswordResetService.js)**
```javascript
function resetUserPassword(empId, email) {
  // 1. Find user by email
  const userInfo = findUserByEmail(email);
  
  if (!userInfo) {
    return {
      status: 'error',
      message: 'ไม่พบข้อมูลผู้ใช้ที่มี email นี้'
    };
  }
  
  // 2. Generate temporary password hash
  const tempPassword = "Init4321";  // SAP-style temporary password
  const passwordHash = hashPassword(email, empId);
  
  // 3. Update user in Google Sheets
  data[userRowIndex][CONFIG.COLUMNS.USER.PASSWORD] = passwordHash;
  data[userRowIndex][CONFIG.COLUMNS.USER.REQUIRE_PASSWORD_CHANGE] = true;
  data[userRowIndex][CONFIG.COLUMNS.USER.TEMP_PASSWORD] = true;
  
  // 4. Send email notification
  sendPasswordResetEmail(email, userInfo.fullName, tempPassword);
  
  return {
    status: 'success',
    message: 'รีเซ็ตรหัสผ่านเรียบร้อย ตรวจสอบอีเมลเพื่อรับรหัสผ่านชั่วคราว',
    tempPassword: tempPassword  // For development/testing only
  };
}
```

#### Step 3: **Backend Response**
```json
{
  "status": "success",
  "message": "รีเซ็ตรหัสผ่านเรียบร้อย ตรวจสอบอีเมลเพื่อรับรหัสผ่านชั่วคราว",
  "empId": "EMP001",
  "email": "user@example.com"
}
```

#### Step 4: **Login with Temporary Password**
```javascript
// User logs in with temporary password
const tempLoginData = {
  action: 'login',
  username: 'user@example.com',
  password: 'Init4321'  // Temporary password
};

// Backend response will include requirePasswordChange: true
```

#### Step 5: **Change Password (Frontend)**
```javascript
// Frontend sends password change request
const changePasswordData = {
  action: 'changePassword',
  empId: 'EMP001',
  currentPassword: 'Init4321',
  newPassword: 'MyNewSecurePassword123'
};

fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams(changePasswordData)
})
```

#### Step 6: **Backend Password Change Processing**
```javascript
function changeUserPassword(empId, currentPassword, newPassword) {
  // 1. Find user by empId
  const userRowIndex = findUserRowIndex(empId);
  
  // 2. Verify current password
  const currentPasswordHash = hashPassword(userEmail, empId);
  if (userRow[CONFIG.COLUMNS.USER.PASSWORD] !== currentPasswordHash) {
    return {
      status: 'error',
      message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
    };
  }
  
  // 3. Generate new password hash
  const newPasswordHash = generateNewPasswordHash(newPassword, userEmail, empId);
  
  // 4. Update user record
  data[userRowIndex][CONFIG.COLUMNS.USER.PASSWORD] = newPasswordHash;
  data[userRowIndex][CONFIG.COLUMNS.USER.REQUIRE_PASSWORD_CHANGE] = false;
  data[userRowIndex][CONFIG.COLUMNS.USER.TEMP_PASSWORD] = false;
  
  return {
    status: 'success',
    message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว'
  };
}
```

#### Step 7: **Final Login (Normal)**
```javascript
// User can now login normally with new password
const finalLoginData = {
  action: 'login',
  username: 'user@example.com',
  password: 'MyNewSecurePassword123'  // New password
};

// Backend response will be normal login success (no requirePasswordChange)
```

---

## 🌐 API Reference

### Authentication Endpoints

#### **POST /exec?action=login**
**Purpose**: User authentication

**Request Parameters**:
```javascript
{
  action: 'login',
  username: string,  // Email or Employee ID
  password: string
}
```

**Response Types**:
1. **Normal Success**:
   ```json
   {
     "status": "success",
     "message": "เข้าสู่ระบบสำเร็จ",
     "token": "auth_token_here",
     "user": { /* user object */ }
   }
   ```

2. **Password Change Required**:
   ```json
   {
     "status": "success", 
     "message": "เข้าสู่ระบบสำเร็จ แต่ต้องเปลี่ยนรหัสผ่าน",
     "requirePasswordChange": true,
     "user": { /* user object without sensitive data */ }
   }
   ```

3. **Error**:
   ```json
   {
     "status": "error",
     "message": "error_message_here"
   }
   ```

---

#### **POST /exec?action=resetPassword**
**Purpose**: Reset user password (generates temporary password)

**Request Parameters**:
```javascript
{
  action: 'resetPassword',
  email: string
}
```

**Response**:
```json
{
  "status": "success",
  "message": "รีเซ็ตรหัสผ่านเรียบร้อย ตรวจสอบอีเมลเพื่อรับรหัสผ่านชั่วคราว",
  "empId": "EMP001",
  "email": "user@example.com"
}
```

---

#### **POST /exec?action=changePassword**
**Purpose**: Change user password (from temporary to permanent)

**Request Parameters**:
```javascript
{
  action: 'changePassword',
  empId: string,
  currentPassword: string,
  newPassword: string
}
```

**Response**:
```json
{
  "status": "success",
  "message": "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว"
}
```

---

## 💻 Frontend Integration

### Complete Login Form Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Login System</title>
</head>
<body>
    <div id="loginForm">
        <h2>เข้าสู่ระบบ</h2>
        <input type="text" id="username" placeholder="Email หรือ รหัสพนักงาน">
        <input type="password" id="password" placeholder="รหัสผ่าน">
        <button onclick="login()">เข้าสู่ระบบ</button>
        <button onclick="showResetForm()">ลืมรหัสผ่าน?</button>
    </div>

    <div id="resetForm" style="display:none">
        <h2>รีเซ็ตรหัสผ่าน</h2>
        <input type="email" id="resetEmail" placeholder="Email">
        <button onclick="resetPassword()">รีเซ็ตรหัสผ่าน</button>
        <button onclick="showLoginForm()">กลับไปหน้าเข้าสู่ระบบ</button>
    </div>

    <div id="changePasswordForm" style="display:none">
        <h2>เปลี่ยนรหัสผ่าน</h2>
        <input type="password" id="currentPassword" placeholder="รหัสผ่านปัจจุบัน">
        <input type="password" id="newPassword" placeholder="รหัสผ่านใหม่">
        <input type="password" id="confirmPassword" placeholder="ยืนยันรหัสผ่านใหม่">
        <button onclick="changePassword()">เปลี่ยนรหัสผ่าน</button>
    </div>

    <div id="message"></div>

    <script>
        const API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
        let currentUser = null;

        async function login() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (!username || !password) {
                showMessage('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน', 'error');
                return;
            }

            try {
                showMessage('กำลังเข้าสู่ระบบ...', 'info');

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'login',
                        username: username,
                        password: password
                    })
                });

                const result = await response.json();

                if (result.status === 'success') {
                    if (result.requirePasswordChange) {
                        // Show password change form
                        currentUser = result.user;
                        showPasswordChangeForm();
                        showMessage('เข้าสู่ระบบสำเร็จ กรุณาเปลี่ยนรหัสผ่าน', 'warning');
                    } else {
                        // Normal login success
                        localStorage.setItem('authToken', result.token);
                        localStorage.setItem('userData', JSON.stringify(result.user));
                        showMessage('เข้าสู่ระบบสำเร็จ!', 'success');
                        // Redirect to main application
                        setTimeout(() => {
                            window.location.href = '/main.html';
                        }, 1500);
                    }
                } else {
                    showMessage(result.message, 'error');
                }
            } catch (error) {
                showMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
                console.error('Login error:', error);
            }
        }

        async function resetPassword() {
            const email = document.getElementById('resetEmail').value;

            if (!email) {
                showMessage('กรุณากรอกอีเมล', 'error');
                return;
            }

            try {
                showMessage('กำลังรีเซ็ตรหัสผ่าน...', 'info');

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'resetPassword',
                        email: email
                    })
                });

                const result = await response.json();

                if (result.status === 'success') {
                    showMessage('รีเซ็ตรหัสผ่านเรียบร้อย ตรวจสอบอีเมลเพื่อรับรหัสผ่านชั่วคราว "Init4321"', 'success');
                    showLoginForm();
                    // Auto-fill username for convenience
                    document.getElementById('username').value = email;
                    document.getElementById('password').value = 'Init4321';
                } else {
                    showMessage(result.message, 'error');
                }
            } catch (error) {
                showMessage('เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน', 'error');
                console.error('Reset error:', error);
            }
        }

        async function changePassword() {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (!currentPassword || !newPassword || !confirmPassword) {
                showMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง', 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                showMessage('รหัสผ่านใหม่ไม่ตรงกัน', 'error');
                return;
            }

            if (newPassword.length < 6) {
                showMessage('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร', 'error');
                return;
            }

            try {
                showMessage('กำลังเปลี่ยนรหัสผ่าน...', 'info');

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'changePassword',
                        empId: currentUser.empId,
                        currentPassword: currentPassword,
                        newPassword: newPassword
                    })
                });

                const result = await response.json();

                if (result.status === 'success') {
                    showMessage('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว กรุณาเข้าสู่ระบบใหม่', 'success');
                    
                    // Auto-fill login form with new password
                    showLoginForm();
                    document.getElementById('username').value = currentUser.email;
                    document.getElementById('password').value = newPassword;
                    
                    currentUser = null;
                } else {
                    showMessage(result.message, 'error');
                }
            } catch (error) {
                showMessage('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', 'error');
                console.error('Change password error:', error);
            }
        }

        function showLoginForm() {
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('resetForm').style.display = 'none';
            document.getElementById('changePasswordForm').style.display = 'none';
        }

        function showResetForm() {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('resetForm').style.display = 'block';
            document.getElementById('changePasswordForm').style.display = 'none';
        }

        function showPasswordChangeForm() {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('resetForm').style.display = 'none';
            document.getElementById('changePasswordForm').style.display = 'block';
            
            // Pre-fill current password if it's temporary
            if (currentUser) {
                document.getElementById('currentPassword').value = 'Init4321';
            }
        }

        function showMessage(message, type) {
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = message;
            messageDiv.className = type;

            // Auto-hide success/info messages
            if (type === 'success' || type === 'info') {
                setTimeout(() => {
                    messageDiv.textContent = '';
                    messageDiv.className = '';
                }, 5000);
            }
        }
    </script>

    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 400px;
            margin: 50px auto;
            padding: 20px;
        }

        div[id$="Form"] {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }

        input {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 3px;
            box-sizing: border-box;
        }

        button {
            width: 100%;
            padding: 10px;
            margin: 5px 0;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }

        button:hover {
            background-color: #0056b3;
        }

        #message {
            padding: 10px;
            margin: 10px 0;
            border-radius: 3px;
            text-align: center;
        }

        .success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .warning {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeeba;
        }

        .info {
            background-color: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
    </style>
</body>
</html>
```

---

## 🔒 Security Features

### 1. **Password Hashing**
```javascript
// Custom hashing function combining email and empId
function hashPassword(email, empId) {
  const passwordString = email.split('@')[0] + empId;
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, passwordString)
                  .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
                  .join('');
}
```

### 2. **Token Management**
```javascript
// Token creation with expiration
function createUserToken(user) {
  const tokenData = {
    empId: user.empId,
    email: user.email,
    role: user.role,
    timestamp: new Date().getTime(),
    expires: new Date().getTime() + (60 * 60 * 1000) // 1 hour
  };
  
  return base64Encode(JSON.stringify(tokenData));
}
```

### 3. **User Status Validation**
```javascript
// Check user status before authentication
const userStatus = row[CONFIG.COLUMNS.USER.USER_STATUS];
if (userStatus !== 1) {
  return {
    status: 'error',
    message: 'บัญชีผู้ใช้ถูกระงับหรือไม่ได้ใช้งาน'
  };
}
```

---

## 📧 Email Notifications

### Password Reset Email Template
```javascript
function sendPasswordResetEmail(email, fullName, tempPassword) {
  const subject = '🔐 รีเซ็ตรหัสผ่าน - Trading Journal System';
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">รีเซ็ตรหัสผ่านเรียบร้อยแล้ว</h2>
      
      <p>สวัสดี คุณ${fullName},</p>
      
      <p>ระบบได้ทำการรีเซ็ตรหัสผ่านของคุณเรียบร้อยแล้ว</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #007bff; margin-top: 0;">ข้อมูลการเข้าสู่ระบบ</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>รหัสผ่านชั่วคราว:</strong> <code style="background: #e9ecef; padding: 5px; border-radius: 3px;">${tempPassword}</code></p>
      </div>
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
        <h4 style="color: #856404; margin-top: 0;">⚠️ สำคัญ</h4>
        <ul style="color: #856404;">
          <li>รหัสผ่านชั่วคราวนี้ใช้ได้เพียง 1 ครั้งเท่านั้น</li>
          <li>ระบบจะบังคับให้เปลี่ยนรหัสผ่านในการเข้าสู่ระบบครั้งแรก</li>
          <li>กรุณาเปลี่ยนเป็นรหัสผ่านที่มีความปลอดภัยสูง</li>
        </ul>
      </div>
      
      <p style="margin-top: 30px;">
        <a href="#" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">เข้าสู่ระบบ</a>
      </p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      
      <p style="color: #666; font-size: 12px;">
        หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบทันที<br>
        อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ
      </p>
    </div>
  `;
  
  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody
  });
}
```

---

## 🚨 Error Handling

### Common Error Scenarios & Responses

#### 1. **Invalid Credentials**
```json
{
  "status": "error",
  "message": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
}
```

#### 2. **User Not Found**
```json
{
  "status": "error", 
  "message": "ไม่พบข้อมูลผู้ใช้ที่มี email นี้"
}
```

#### 3. **Account Disabled**
```json
{
  "status": "error",
  "message": "บัญชีผู้ใช้ถูกระงับหรือไม่ได้ใช้งาน"
}
```

#### 4. **Password Change Required**
```json
{
  "status": "success",
  "message": "เข้าสู่ระบบสำเร็จ แต่ต้องเปลี่ยนรหัสผ่าน",
  "requirePasswordChange": true,
  "user": { /* user data */ }
}
```

#### 5. **Current Password Incorrect**
```json
{
  "status": "error",
  "message": "รหัสผ่านปัจจุบันไม่ถูกต้อง"
}
```

### Frontend Error Handling
```javascript
function handleApiResponse(result) {
  switch (result.status) {
    case 'success':
      if (result.requirePasswordChange) {
        showPasswordChangeForm(result.user);
      } else {
        handleLoginSuccess(result);
      }
      break;
      
    case 'error':
      showErrorMessage(result.message);
      
      // Handle specific error cases
      if (result.message.includes('ระงับ')) {
        disableLoginForm();
        showContactAdminMessage();
      }
      break;
      
    default:
      showErrorMessage('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
  }
}
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. **Login Always Fails**
```javascript
// Check: User status in Google Sheets
// Solution: Ensure Userstatus column = 1

// Debug function
function debugUserStatus(email) {
  const userInfo = findUserByEmail(email);
  console.log('User found:', userInfo);
  console.log('User status:', userInfo ? userInfo.status : 'N/A');
}
```

#### 2. **Password Reset Email Not Sent**
```javascript
// Check: Email permissions and MailApp quota
// Solution: Verify Google Apps Script email limits

// Debug function  
function testEmailSending(email) {
  try {
    MailApp.sendEmail({
      to: email,
      subject: 'Test Email',
      body: 'This is a test email from your system.'
    });
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }
}
```

#### 3. **Password Change Always Required**
```javascript
// Check: requirePasswordChange column value
// Solution: Ensure proper boolean handling

// Debug function
function checkPasswordChangeFlag(empId) {
  const userRow = findUserRowByEmpId(empId);
  const flag = userRow[CONFIG.COLUMNS.USER.REQUIRE_PASSWORD_CHANGE];
  console.log('Password change required flag:', flag, typeof flag);
}
```

#### 4. **Token Validation Issues**
```javascript
// Check: Token expiration and format
// Solution: Verify token creation and validation logic

// Debug function
function validateTokenDebug(token) {
  try {
    const tokenData = JSON.parse(base64Decode(token));
    const now = new Date().getTime();
    const isExpired = now > tokenData.expires;
    
    console.log('Token data:', tokenData);
    console.log('Is expired:', isExpired);
    console.log('Time left:', (tokenData.expires - now) / 1000 / 60, 'minutes');
  } catch (error) {
    console.error('Invalid token format:', error);
  }
}
```

### System Health Check

```javascript
function performAuthSystemHealthCheck() {
  console.log('🔍 Authentication System Health Check');
  
  const health = {
    timestamp: new Date().toISOString(),
    tests: []
  };
  
  // Test 1: Config availability
  health.tests.push({
    test: 'CONFIG availability',
    status: typeof CONFIG !== 'undefined' ? 'PASS' : 'FAIL'
  });
  
  // Test 2: User sheet access
  try {
    const userSheet = getSheet(CONFIG.SHEETS.USER);
    health.tests.push({
      test: 'User sheet access',
      status: userSheet ? 'PASS' : 'FAIL'
    });
  } catch (error) {
    health.tests.push({
      test: 'User sheet access',
      status: 'FAIL',
      error: error.toString()
    });
  }
  
  // Test 3: Password hashing
  try {
    const hash = hashPassword('test@example.com', 'EMP001');
    health.tests.push({
      test: 'Password hashing',
      status: hash && hash.length > 0 ? 'PASS' : 'FAIL'
    });
  } catch (error) {
    health.tests.push({
      test: 'Password hashing',
      status: 'FAIL',
      error: error.toString()
    });
  }
  
  // Test 4: Email functionality
  try {
    const quotaRemaining = MailApp.getRemainingDailyQuota();
    health.tests.push({
      test: 'Email quota',
      status: quotaRemaining > 0 ? 'PASS' : 'FAIL',
      details: `${quotaRemaining} emails remaining`
    });
  } catch (error) {
    health.tests.push({
      test: 'Email quota',
      status: 'FAIL',
      error: error.toString()
    });
  }
  
  console.log('Health Check Results:', health);
  return health;
}
```

---

## 📊 System Flow Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  Google Sheets  │
│                 │    │                 │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│                 │    │                 │    │                 │
│ 1. Login Form   │───▶│ authenticateUser│───▶│ Find user       │
│   - username    │    │                 │    │ Verify password │
│   - password    │    │                 │    │ Check status    │
│                 │    │                 │    │                 │
│                 │◀───│ Return result   │◀───│                 │
│                 │    │ + token/user    │    │                 │
│                 │    │ OR              │    │                 │
│                 │    │ + requirePwdChg │    │                 │
│                 │    │                 │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│                 │    │                 │    │                 │
│ 2. Reset Form   │───▶│ resetPassword   │───▶│ Find user       │
│   - email       │    │                 │    │ Update password │
│                 │    │                 │    │ Set flags       │
│                 │    │                 │    │                 │
│                 │◀───│ Send email      │    │                 │
│                 │    │ "Init4321"      │    │                 │
│                 │    │                 │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│                 │    │                 │    │                 │
│ 3. Change Form  │───▶│ changePassword  │───▶│ Verify current  │
│   - current     │    │                 │    │ Update new      │
│   - new         │    │                 │    │ Clear flags     │
│   - confirm     │    │                 │    │                 │
│                 │◀───│ Success         │◀───│                 │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🎯 Best Practices

### 1. **Frontend Security**
- Always validate inputs before sending
- Use HTTPS for all authentication requests
- Store tokens securely (consider httpOnly cookies)
- Implement client-side session timeout
- Clear sensitive data from memory

### 2. **Backend Security**
- Hash passwords with salt (user-specific)
- Implement rate limiting for login attempts
- Log authentication events
- Validate all input parameters
- Use prepared statements equivalent

### 3. **User Experience**
- Provide clear error messages
- Show loading states during requests
- Auto-fill forms when appropriate
- Guide users through password reset process
- Implement session management

### 4. **Production Deployment**
- Monitor authentication logs
- Set up alerting for failed login attempts
- Regular security audits
- Backup user data
- Test recovery procedures

---

*Generated on: September 30, 2025*  
*Authentication System Version: SAP-Style v2.0*