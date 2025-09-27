/**
 * Authentication Service - Handle user authentication and authorization
 * Provides functions for login, logout, token management, and access control
 * @requires Types.js - For type definitions
 * @requires Config.js - For configuration constants
 * @requires PasswordService.js - For password verification
 * @created 2025-09-27 (refactored)
 */

/**
 * Authenticate user with username/email and password
 * @param {string} username - Username or email address
 * @param {string} password - Plain text password or password hash
 * @returns {AuthResult} Authentication result with user data and token
 */
function authenticateUser(username, password) {
  try {
    // ดึงข้อมูล user จาก USER sheet
    const sheet = getSheet(CONFIG.SHEETS.USER);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) {
      return createJSONResponse('error', 'ไม่พบข้อมูลผู้ใช้ในระบบ');
    }
    
    // หา user ที่ตรงกับ username หรือ email
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const empId = row[0];
      const fullName = row[1];
      const email = row[2];
      const role = row[3];
      const userStatus = row[4];
      const storedPassword = row[5];
      
      // ตรวจสอบ username (EmpId หรือ Email)
      if ((empId === username || email === username) && userStatus === 1) {
        // ตรวจสอบ password ด้วย secure hashing
        const isPasswordValid = verifyPassword(password, email, empId);
        if (isPasswordValid) {
          // สร้าง user object
          const user = {
            id: empId,
            fullName: fullName,
            email: email,
            role: role,
            status: userStatus
          };
          
          // สร้าง token
          const token = generateToken(user);
          
          return createJSONResponse('success', 'เข้าสู่ระบบสำเร็จ', {
            user: user,
            token: token
          });
        }
      }
    }
    
    return createJSONResponse('error', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    
  } catch (error) {
    logError('authenticateUser', error, { username });
    return createJSONResponse('error', 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
  }
}

/**
 * Generate authentication token for user after successful login
 * Uses UUID-based token generation for security
 * @param {User} user - User object containing user information
 * @returns {string} Generated authentication token
 * @throws {Error} When token generation fails
 */
function generateToken(user) {
  try {
    // ตรวจสอบว่า user มี token อยู่แล้วหรือไม่
    var existingToken = getTokenByUserId(user.id);
    if (existingToken) {
      // หาก user มี token อยู่แล้ว ให้ลบ token เก่าก่อน
      removeTokenByUserId(user.id);
    }
    
    // สร้าง token ใหม่
    var token = Utilities.getUuid() + '-' + user.id;
    
    // บันทึก token ใหม่
    saveTokenForUser(user.id, token);
    
    console.log(`Generated new token for user: ${user.id}`);
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
}

/**
 * Verify if authentication token is valid and active
 * @param {string} token - Authentication token to verify
 * @returns {boolean} True if token is valid and active
 */
function verifyToken(token) {
  // ตัวอย่าง: ดึง token จาก sheet หรือ cache แล้วตรวจสอบ
  var tokenInfo = getTokenInfo(token);
  if (!tokenInfo) return false;
  // ตรวจสอบวันหมดอายุ, user status ฯลฯ
  return true;
}

/**
 * ลบ/ยกเลิก token (logout) โดยใช้ token
 */
function revokeToken(token) {
  try {
    var result = removeToken(token);
    if (result) {
      console.log(`Token revoked successfully: ${token}`);
    }
    return result;
  } catch (error) {
    console.error('Error revoking token:', error);
    return false;
  }
}

/**
 * ลบ/ยกเลิก token (logout) โดยใช้ user ID
 */
function revokeTokenByUserId(userId) {
  try {
    var result = removeTokenByUserId(userId);
    if (result) {
      console.log(`Token revoked for user: ${userId}`);
    }
    return result;
  } catch (error) {
    console.error('Error revoking token by user ID:', error);
    return false;
  }
}

/**
 * ตรวจสอบสิทธิ์การเข้าถึง (authorization)
 */
function checkPermission(user, action) {
  // ตัวอย่าง: ตรวจสอบ role หรือสิทธิ์ใน user object
  if (user.role === 'admin') return true;
  if (action === 'CRUD' && user.permissions === 'CRUD') return true;
  return false;
}

/**
 * ฟังก์ชันช่วยเหลือสำหรับการจัดการ token (ตัวอย่าง)
 */
function saveTokenForUser(userId, token) {
  try {
    var sheet = getSheet(CONFIG.SHEETS.USER_TOKENS);
    sheet.appendRow([userId, token, new Date()]);
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
}

function getTokenInfo(token) {
  try {
    var sheet = getSheet(CONFIG.SHEETS.USER_TOKENS);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === token) {
        return { userId: data[i][0], token: data[i][1], createdAt: data[i][2] };
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting token info:', error);
    return null;
  }
}

function removeToken(token) {
  try {
    var sheet = getSheet(CONFIG.SHEETS.USER_TOKENS);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === token) {
        sheet.deleteRow(i + 1);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
}

/**
 * Authenticate request using token
 * @param {Object} params - Request parameters containing token
 * @returns {Object} Authentication result
 */
function authenticateRequest(params) {
  try {
    const token = params.token;
    
    if (!token) {
      return createJSONResponse('error', 'Token is required for this endpoint');
    }
    
    const isValid = verifyToken(token);
    if (!isValid) {
      return createJSONResponse('error', 'Invalid or expired token');
    }
    
    return createJSONResponse('success', 'Authentication successful');
  } catch (error) {
    logError('authenticateRequest', error, { params });
    return createJSONResponse('error', 'Authentication failed');
  }
}

/**
 * Verify if user has access to specific account
 * @param {string} token - User token
 * @param {string} accountId - Account ID to check
 * @returns {Object} Access verification result
 */
function verifyAccountAccess(token, accountId) {
  try {
    if (!token || !accountId) {
      return createJSONResponse('error', 'Token and Account ID are required');
    }
    
    // Get user info from token
    const tokenInfo = getTokenInfo(token);
    if (!tokenInfo) {
      return createJSONResponse('error', 'Invalid token');
    }
    
    // Get user details from USER sheet
    const userSheet = getSheet(CONFIG.SHEETS.USER);
    const userData = userSheet.getDataRange().getValues();
    
    let userAccount = null;
    for (let i = 1; i < userData.length; i++) {
      if (userData[i][0] === tokenInfo.userId) { // EmpId matches
        userAccount = userData[i];
        break;
      }
    }
    
    if (!userAccount) {
      return createJSONResponse('error', 'User not found');
    }
    
    const userRole = userAccount[3]; // Role column
    
    // Admin can access all accounts
    if (userRole === 'admin') {
      return createJSONResponse('success', 'Admin access granted');
    }
    
    // Regular user can only access their own account
    if (tokenInfo.userId === accountId) {
      return createJSONResponse('success', 'User access granted');
    }
    
    return createJSONResponse('error', 'Access denied to this account');
    
  } catch (error) {
    logError('verifyAccountAccess', error, { token, accountId });
    return createJSONResponse('error', 'Access verification failed');
  }
}

/**
 * Get user information from token
 * @param {string} token - User token
 * @returns {Object} User information or error
 */
function getUserInfoFromToken(token) {
  try {
    if (!token) {
      return createJSONResponse('error', 'Token is required');
    }
    
    const tokenInfo = getTokenInfo(token);
    if (!tokenInfo) {
      return createJSONResponse('error', 'Invalid token');
    }
    
    // Get user details from USER sheet
    const userSheet = getSheet(CONFIG.SHEETS.USER);
    const userData = userSheet.getDataRange().getValues();
    
    for (let i = 1; i < userData.length; i++) {
      if (userData[i][0] === tokenInfo.userId) {
        const user = {
          id: userData[i][0],
          fullName: userData[i][1],
          email: userData[i][2],
          role: userData[i][3],
          status: userData[i][4]
        };
        
        return createJSONResponse('success', 'User information retrieved', { user });
      }
    }
    
    return createJSONResponse('error', 'User not found');
    
  } catch (error) {
    logError('getUserInfoFromToken', error, { token });
    return createJSONResponse('error', 'Failed to get user information');
  }
}



/**
 * ดึง token ของ user โดยใช้ user ID
 * @param {string} userId - User ID
 * @returns {string|null} Token หรือ null ถ้าไม่พบ
 */
function getTokenByUserId(userId) {
  try {
    var sheet = getSheet(CONFIG.SHEETS.USER_TOKENS);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        return data[i][1]; // return token
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting token by user ID:', error);
    return null;
  }
}

/**
 * ลบ token ของ user โดยใช้ user ID
 * @param {string} userId - User ID
 * @returns {boolean} สำเร็จหรือไม่
 */
function removeTokenByUserId(userId) {
  try {
    var sheet = getSheet(CONFIG.SHEETS.USER_TOKENS);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        sheet.deleteRow(i + 1);
        console.log(`Removed existing token for user: ${userId}`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error removing token by user ID:', error);
    return false;
  }
}
