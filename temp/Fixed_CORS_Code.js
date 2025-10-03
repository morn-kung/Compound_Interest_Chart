// ✅ CORS Fixed Version - Code.js
// แก้ไขปัญหา CORS สำหรับ Google Apps Script

/**
 * Handle CORS preflight requests (OPTIONS)
 * ⚠️ ต้องมี function นี้เท่านั้น! ห้ามซ้ำ
 */
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': 'false',
      'Vary': 'Origin'  // 🔥 สำคัญมาก!
    });
}

/**
 * ✅ Unified Response Helper with Complete CORS
 */
function createCORSResponse(data, statusCode = 200) {
  const response = {
    status: statusCode >= 400 ? 'error' : 'success',
    data: data,
    timestamp: new Date().toISOString()
  };

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': 'false',
      'Vary': 'Origin',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
}

/**
 * ✅ Enhanced GET Handler
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    let result;
    
    switch (action) {
      case 'getOEEData':
        result = getOEEDailyData();
        break;
        
      case 'getOEEDataV3':
        result = getOEEDailyDataV3();
        break;
        
      case 'getRecentDashboards':
        result = getRecentDashboardsService();
        break;
      
      case 'testConnection':
        result = {
          message: 'Connection successful',
          server: 'Google Apps Script',
          cors: 'enabled'
        };
        break;
        
      default:
        return createCORSResponse({
          error: 'Invalid action parameter',
          availableActions: ['getOEEData', 'getOEEDataV3', 'getRecentDashboards', 'testConnection']
        }, 400);
    }
    
    return createCORSResponse(result);
    
  } catch (error) {
    console.error('doGet Error:', error);
    return createCORSResponse({
      error: 'Internal server error',
      message: error.message
    }, 500);
  }
}

/**
 * ✅ Enhanced POST Handler
 */
function doPost(e) {
  try {
    // Parse request data
    let data = null;
    
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        return createCORSResponse({
          error: 'Invalid JSON format',
          message: parseError.message
        }, 400);
      }
    } else {
      return createCORSResponse({
        error: 'No data provided in POST request'
      }, 400);
    }
    
    const action = data.action;
    let result;
    
    switch (action) {
      case 'createDashboard':
        result = createDashboardService(data);
        break;
        
      case 'updateDashboard':
        result = updateDashboardService(data);
        break;
        
      case 'testLogin':
        result = testLogin(data.empId, data.password);
        break;
        
      default:
        return createCORSResponse({
          error: 'Invalid action parameter',
          availableActions: ['createDashboard', 'updateDashboard', 'testLogin']
        }, 400);
    }
    
    return createCORSResponse(result);
    
  } catch (error) {
    console.error('doPost Error:', error);
    return createCORSResponse({
      error: 'Internal server error',
      message: error.message
    }, 500);
  }
}

/**
 * ✅ Test Login Function (Fixed)
 */
function testLogin(empId, password) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('user');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Find column indices
    const empIdIndex = headers.indexOf('EmpId');
    const passwordIndex = headers.indexOf('password');
    const fullNameIndex = headers.indexOf('FullNameTH');
    const emailIndex = headers.indexOf('Email');

    if (empIdIndex === -1 || passwordIndex === -1) {
      return {
        status: 'error',
        message: 'Required columns not found in user sheet'
      };
    }

    // Find user
    const userRow = data.find(row => String(row[empIdIndex]) === String(empId));
    if (!userRow) {
      return {
        status: 'error',
        message: 'User not found'
      };
    }

    // Verify password
    const passwordHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
      .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
      .join('');

    if (String(userRow[passwordIndex]) !== String(passwordHash)) {
      return {
        status: 'error',
        message: 'Invalid password'
      };
    }

    // Success
    return {
      status: 'success',
      message: 'Login successful',
      user: {
        empId: userRow[empIdIndex],
        fullName: userRow[fullNameIndex] || '',
        email: userRow[emailIndex] || ''
      }
    };
    
  } catch (error) {
    console.error('testLogin Error:', error);
    return {
      status: 'error',
      message: 'Login function failed: ' + error.message
    };
  }
}