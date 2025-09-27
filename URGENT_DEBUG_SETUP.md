# 🚨 URGENT: Add Debug Endpoints to Code.js

## 📍 Current Status:
- ✅ Deploy is working (3/3 public endpoints responding)
- ❌ POST login still fails: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
- 🎯 Need debug endpoints to find root cause

## 🔧 Required Changes to Code.js:

### 1. Add to handleGetRequest (in switch statement, before default case):

```javascript
case 'testLoginWithFullDebug':
  const debugUsername = params.username || '4498';
  const debugPassword = params.password || 'likit.se4498';
  const fullDebugResult = testLoginWithFullDebug(debugUsername, debugPassword);
  return ContentService.createTextOutput(JSON.stringify(fullDebugResult))
                      .setMimeType(ContentService.MimeType.JSON);

case 'testDirectAuthentication':
  const directUsername = params.username || '4498';
  const directPassword = params.password || 'likit.se4498';
  const directResult = testDirectAuthentication(directUsername, directPassword);
  return ContentService.createTextOutput(JSON.stringify(directResult))
                      .setMimeType(ContentService.MimeType.JSON);
```

### 2. Add to handlePostRequest (before login handling):

```javascript
// Handle debug POST request
if (action === 'debugPOST') {
  const debugResult = debugPOSTRequest(e);
  return ContentService.createTextOutput(JSON.stringify(debugResult))
                      .setMimeType(ContentService.MimeType.JSON);
}
```

### 3. Add DebugLogin.js file with these functions:

```javascript
function debugPOSTRequest(e) {
  const result = {
    status: 'debug',
    message: 'POST Request Debug Information',
    timestamp: new Date().toISOString(),
    debug: {
      hasParameter: !!e.parameter,
      hasParameters: !!e.parameters,
      hasPostData: !!e.postData,
      parameterKeys: e.parameter ? Object.keys(e.parameter) : [],
      parametersKeys: e.parameters ? Object.keys(e.parameters) : [],
      parameter: e.parameter || {},
      parameters: e.parameters || {},
      extractionTest: {}
    }
  };
  
  const getParam = (name) => {
    if (e.parameters && e.parameters[name]) {
      return e.parameters[name][0];
    }
    if (e.parameter && e.parameter[name]) {
      return e.parameter[name];
    }
    return null;
  };
  
  result.debug.extractionTest = {
    action: getParam('action'),
    username: getParam('username'),
    password: getParam('password') ? '[HIDDEN]' : null
  };
  
  return result;
}

function testLoginWithFullDebug(username, password) {
  // Implementation from previous DebugLogin.js file
  return { status: 'debug', message: 'Full debug implementation needed' };
}

function testDirectAuthentication(username, password) {
  try {
    const result = authenticateUser(username, password);
    return result;
  } catch (error) {
    return {
      status: 'error',
      message: `Direct authentication error: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}
```

## 🚀 Deploy Steps:
1. Add above code to Code.js
2. Add DebugLogin.js file  
3. Update deploy (not new deploy)
4. Test with test-final-post-debug.html

## 🎯 Expected Results:
- testDirectAuthentication should work (auth logic is correct)
- debugPOST should show parameter extraction issues
- testLoginWithFullDebug should show step-by-step process

## 📱 Quick Test URLs:
```
GET: ?action=testDirectAuthentication&username=4498&password=likit.se4498
POST: action=debugPOST&username=4498&password=likit.se4498
```