const result = testLogin('4498', 'likit.se4498');
console.log(result);
function testLogin(empId, password) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('user');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  console.log('Headers:', headers);

  // Find user by empId
  const userRow = data.find(row => String(row[headers.indexOf('EmpId')]) === String(empId));
  if (!userRow) {
    return {
      status: 'error',
      message: 'User not found',
    };
  }

  // Verify password
  const passwordHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
    .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
    .join('');

  console.log('Input Password Hash:', passwordHash);
  console.log('Stored Password Hash:', String(userRow[headers.indexOf('password')])); // Use 'password' instead of 'Password'

  if (String(userRow[headers.indexOf('password')]) !== String(passwordHash)) { // Use 'password' here as well
    return {
      status: 'error',
      message: 'Invalid password',
    };
  }

  // Return user info on success
  return {
    status: 'success',
    message: 'Login successful',
    user: {
      empId: userRow[headers.indexOf('EmpId')],
      fullName: userRow[headers.indexOf('FullNameTH')], // Use 'FullNameTH' instead of 'FullName'
      email: userRow[headers.indexOf('Email')],
    },
  };
}

/* *
const publicEndpoints = [
  'testlogin',
  'login',
  'changePassword',
  'resetPassword',
  'logout',
  'renewAllPasswords',
  'generateUserPassword',
  'testPasswordHashing',
  'updateUserPassword',
  'testDataTypeMismatch',
  'demoGoogleSheetsDataTypes',
  'getAdminforDashboard',
  'getOEEDailyData',
  'getRecentDashboards',
  'getAdminData',
  'getDailyChartSummary',
  'getRecentDaily'
];

function doOptions(e) {
  console.log('OPTIONS request received:', e);
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setHeader('Access-Control-Max-Age', '86400');
}

function doGet(e) {
  try {
    const params = e.parameter;
    const action = params.action;

    if (!publicEndpoints.includes(action)) {
      throw new Error('Invalid or unauthorized action specified for GET request.');
    }

    let result;
    switch (action) {
      case 'testlogin':
        result = loginController(params.empId, params.password);
        break;
      case 'getAdminforDashboard':
        result = getAdminforDashboardController();
        break;
      case 'getOEEDailyData':
        result = getOEEDailyDataController();
        break;
      case 'getRecentDashboards':
        result = getRecentDashboardsController();
        break;
      case 'getAdminData':
        result = getAdminDataController(params.baggingCode);
        break;
      case 'getDailyChartSummary':
        result = getDailyChartSummaryController(Number(params.days || 3));
        break;
      case 'getRecentDaily':
        result = getRecentDailyController(Number(params.count || 3));
        break;
      default:
        throw new Error('Invalid action specified for GET request.');
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, result }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;

    if (!publicEndpoints.includes(action)) {
      throw new Error('Invalid or unauthorized action specified for POST request.');
    }

    let result;
    switch (action) {
      case 'login':
        result = loginEnhancedController(params.username, params.password);
        break;
      case 'changePassword':
        result = changePasswordController(params.empId, params.currentPassword, params.newPassword, params.confirmPassword);
        break;
      case 'resetPassword':
        result = passwordResetController(params.email);
        break;
      case 'logout':
        result = logoutController(params.token);
        break;
      case 'renewAllPasswords':
        result = renewAllPasswordsController();
        break;
      case 'generateUserPassword':
        result = generateUserPasswordController(params.empId, params.email);
        break;
      case 'testPasswordHashing':
        result = testPasswordHashingController();
        break;
      case 'updateUserPassword':
        result = updateUserPasswordController(params.empId);
        break;
      case 'testDataTypeMismatch':
        result = testDataTypeMismatch();
        break;
      case 'demoGoogleSheetsDataTypes':
        result = demoGoogleSheetsDataTypes();
        break;
      case 'createDashboard':
        result = createDashboardController(params.data, params.userId);
        break;
      case 'updateDashboard':
        result = updateDashboardController(params.data, params.userId);
        break;
      case 'getRecentDashboards':
        result = getRecentDashboardsController();
        break;
      case 'getOEEDailyData':
        result = getOEEDailyDataController();
        break;
      default:
        throw new Error('Invalid action specified for POST request.');
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, result }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}
  */