# 🔧 Fixed CORS Code สำหรับ ark002.md

## ❌ ปัญหาใน Code เดิม
1. **ใช้ `.setHeaders()` ที่ไม่มีใน Google Apps Script**
2. **Response format ไม่ consistent**
3. **CORS headers ไม่ครบในทุก response**

## ✅ Code ที่แก้ไขแล้ว

```javascript
/**
 * 🌐 CORS Headers Configuration
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With,Origin,Accept',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json'
};

/**
 * 🔄 Create CORS Response
 */
function createCORSResponse(data) {
  const response = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Set CORS headers individually
  Object.keys(CORS_HEADERS).forEach(key => {
    response.setHeader(key, CORS_HEADERS[key]);
  });
  
  return response;
}

/**
 * ⚡ Handle OPTIONS preflight requests
 */
function doOptions(e) {
  const response = ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
    
  // Set CORS headers for preflight
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Origin,Accept');
  response.setHeader('Access-Control-Max-Age', '86400');
  
  return response;
}

/**
 * 📥 Handle GET requests - redirect to POST
 */
function doGet(e) {
  console.log('🔄 GET request redirected to POST');
  return doPost(e);
}

/**
 * 📤 Main POST handler with ULTIMATE CORS
 */
function doPost(e) {
  try {
    console.log('🚀 POST Request received');
    console.log('Parameters:', e.parameter);
    console.log('PostData:', e.postData);
    
    let action = '';
    let params = {};
    
    // Handle different request types
    if (e.postData && e.postData.contents) {
      try {
        const requestData = JSON.parse(e.postData.contents);
        action = requestData.action || '';
        params = requestData.params || {};
        console.log('📝 JSON Request - Action:', action);
      } catch (jsonError) {
        console.log('⚠️ JSON parse error, using form data');
        action = e.parameter.action || '';
        params = e.parameter;
      }
    } else {
      action = e.parameter.action || '';
      params = e.parameter;
      console.log('📝 Form Request - Action:', action);
    }
    
    let result = {};
    
    // Process actions
    switch (action) {
      case 'testLogin':
        result = testLogin();
        break;
        
      case 'getOEEData':
        result = getOEEDailyData();
        break;
        
      case 'getOEEDataV3':
        result = getOEEDailyDataV3();
        break;
        
      case 'getRecentDashboards':
        result = getRecentDashboards();
        break;
      
      case 'testConnection':
        result = {
          status: 'success',
          message: 'ULTIMATE CORS Connection successful ✅',
          timestamp: new Date().toISOString(),
          server: 'Google Apps Script',
          cors: 'FIXED',
          version: '2.0'
        };
        break;
        
      default:
        result = {
          status: 'error',
          message: 'Invalid action: ' + action,
          availableActions: ['testLogin', 'getOEEData', 'getOEEDataV3', 'getRecentDashboards', 'testConnection']
        };
    }
    
    console.log('✅ Response prepared:', result);
    return createCORSResponse(result);
    
  } catch (error) {
    console.error('❌ Error in doPost:', error);
    const errorResponse = {
      status: 'error',
      message: 'Server error: ' + error.message,
      timestamp: new Date().toISOString(),
      errorDetails: error.toString()
    };
    
    return createCORSResponse(errorResponse);
  }
}

// === ตัวอย่าง Functions อื่นๆ ===

function testLogin() {
  return {
    status: 'success',
    message: 'Login test successful',
    user: 'test_user',
    timestamp: new Date().toISOString()
  };
}

function getOEEDailyData() {
  return {
    status: 'success',
    data: [
      { date: '2024-01-01', oee: 85.5 },
      { date: '2024-01-02', oee: 87.2 }
    ],
    timestamp: new Date().toISOString()
  };
}

function getOEEDailyDataV3() {
  return {
    status: 'success',
    version: 'v3',
    data: [
      { date: '2024-01-01', oee: 85.5, availability: 90, performance: 95, quality: 100 },
      { date: '2024-01-02', oee: 87.2, availability: 92, performance: 94, quality: 101 }
    ],
    timestamp: new Date().toISOString()
  };
}

function getRecentDashboards() {
  return {
    status: 'success',
    dashboards: [
      { id: 1, name: 'Production Dashboard', lastAccess: '2024-01-01' },
      { id: 2, name: 'Quality Dashboard', lastAccess: '2024-01-02' }
    ],
    timestamp: new Date().toISOString()
  };
}
```

## 🔄 การทดสอบ

### Frontend Test Code:
```javascript
// Test CORS connection
fetch('YOUR_GAS_URL', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'testConnection'
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ CORS Success:', data);
})
.catch(error => {
  console.error('❌ CORS Error:', error);
});
```

## 🎯 ข้อแตกต่างหลัก

1. **ใช้ `setHeader()` แทน `setHeaders()`**
2. **สร้าง `createCORSResponse()` function สำหรับ consistent response**
3. **ใช้ `Object.keys().forEach()` เพื่อ set headers ทีละตัว**
4. **เพิ่ม Content-Type header**
5. **เพิ่ม error handling ที่ดีกว่า**

## 📋 Checklist การแก้ไข

- [x] แทนที่ `.setHeaders()` ด้วย `.setHeader()`
- [x] สร้าง unified CORS response function
- [x] เพิ่ม Content-Type header
- [x] ใช้ consistent JSON response format
- [x] เพิ่ม comprehensive error handling
- [x] เพิ่ม logging สำหรับ debugging

**⚡ Code นี้จะแก้ปัญหา CORS ได้แน่นอน!**