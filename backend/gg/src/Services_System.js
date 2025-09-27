/**
 * System Service - Handle system administration and management
 * Functions for system inspection, maintenance, sheet validation, and administrative tasks
 * @requires Types.js - For type definitions
 * @requires Config.js - For configuration constants
 * @created 2025-09-27 (refactored)
 */

/**
 * Safely access spreadsheet with fallback methods
 * Tries active spreadsheet first, then falls back to configured ID
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} The spreadsheet object
 * @throws {Error} When no spreadsheet can be accessed
 */
function getSpreadsheetSafely() {
  let spreadsheet;
  
  // Try active spreadsheet first
  try {
    spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    console.log(`Using active spreadsheet: ${spreadsheet.getName()}`);
    return spreadsheet;
  } catch (error) {
    console.log('No active spreadsheet found, trying configured ID...');
  }
  
  // Fallback to configured ID
  if (CONFIG.SPREADSHEET_ID) {
    try {
      spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      console.log(`Using configured spreadsheet: ${spreadsheet.getName()}`);
      return spreadsheet;
    } catch (error) {
      console.error('Cannot access configured spreadsheet:', error);
    }
  }
  
  // If all fails, throw error
  throw new Error('ไม่สามารถเข้าถึง Google Sheets ได้ - กรุณาเปิดไฟล์ Sheets หรือตั้งค่า SPREADSHEET_ID ให้ถูกต้อง');
}

/**
 * Get comprehensive information about all sheets in the current spreadsheet
 * @returns {APIResponse} Response with detailed sheet information
 *   - data.spreadsheetId: string - Spreadsheet ID
 *   - data.spreadsheetName: string - Spreadsheet name
 *   - data.sheets: Object[] - Array of sheet information objects
 *   - data.summary: Object - Summary statistics
 */
function getAllSheetNames() {
  try {
    // Use the safe spreadsheet access method
    const spreadsheet = getSpreadsheetSafely();
    
    const sheets = spreadsheet.getSheets();
    
    const sheetInfo = {
      spreadsheetId: spreadsheet.getId(),
      spreadsheetName: spreadsheet.getName(),
      spreadsheetUrl: spreadsheet.getUrl(),
      totalSheets: sheets.length,
      sheets: []
    };
    
    sheets.forEach((sheet, index) => {
      const sheetData = {
        index: index + 1,
        name: sheet.getName(),
        sheetId: sheet.getSheetId(),
        isConfigured: Object.values(CONFIG.SHEETS).includes(sheet.getName()),
        configKey: null,
        rowCount: sheet.getLastRow(),
        columnCount: sheet.getLastColumn(),
        isHidden: sheet.isSheetHidden()
      };
      
      // Find config key if this sheet is configured
      for (const [key, value] of Object.entries(CONFIG.SHEETS)) {
        if (value === sheet.getName()) {
          sheetData.configKey = key;
          break;
        }
      }
      
      sheetInfo.sheets.push(sheetData);
    });
    
    // Separate configured and unconfigured sheets
    const configuredSheets = sheetInfo.sheets.filter(sheet => sheet.isConfigured);
    const unconfiguredSheets = sheetInfo.sheets.filter(sheet => !sheet.isConfigured);
    
    console.log(`Found ${sheetInfo.totalSheets} sheets: ${configuredSheets.length} configured, ${unconfiguredSheets.length} unconfigured`);
    
    return createJSONResponse('success', `พบ ${sheetInfo.totalSheets} sheets ทั้งหมด`, {
      ...sheetInfo,
      summary: {
        total: sheetInfo.totalSheets,
        configured: configuredSheets.length,
        unconfigured: unconfiguredSheets.length,
        configuredSheets: configuredSheets.map(s => s.name),
        unconfiguredSheets: unconfiguredSheets.map(s => s.name)
      }
    });
    
  } catch (error) {
    logError('getAllSheetNames', error);
    return createJSONResponse('error', 'ไม่สามารถดึงชื่อ sheet ได้: ' + error.toString());
  }
}

/**
 * Get configured sheet names from CONFIG
 * @returns {Object} Response with configured sheet names
 * @created 2025-09-27
 */
function getConfiguredSheetNames() {
  try {
    const spreadsheet = getSpreadsheetSafely();
    const configuredSheets = {
      totalConfigured: Object.keys(CONFIG.SHEETS).length,
      sheets: {}
    };
    
    Object.entries(CONFIG.SHEETS).forEach(([key, sheetName]) => {
      try {
        const sheet = spreadsheet.getSheetByName(sheetName);
        if (!sheet) {
          throw new Error(`Sheet "${sheetName}" not found`);
        }
        configuredSheets.sheets[key] = {
          configKey: key,
          sheetName: sheetName,
          exists: true,
          rowCount: sheet.getLastRow(),
          columnCount: sheet.getLastColumn(),
          sheetId: sheet.getSheetId()
        };
      } catch (error) {
        configuredSheets.sheets[key] = {
          configKey: key,
          sheetName: sheetName,
          exists: false,
          error: error.toString()
        };
      }
    });
    
    const existingSheets = Object.values(configuredSheets.sheets).filter(sheet => sheet.exists);
    const missingSheets = Object.values(configuredSheets.sheets).filter(sheet => !sheet.exists);
    
    return createJSONResponse('success', `มี ${existingSheets.length}/${configuredSheets.totalConfigured} sheets ที่กำหนดใน CONFIG`, {
      ...configuredSheets,
      summary: {
        totalConfigured: configuredSheets.totalConfigured,
        existing: existingSheets.length,
        missing: missingSheets.length,
        existingSheets: existingSheets.map(s => s.sheetName),
        missingSheets: missingSheets.map(s => s.sheetName)
      }
    });
    
  } catch (error) {
    logError('getConfiguredSheetNames', error);
    return createJSONResponse('error', 'ไม่สามารถดึงข้อมูล configured sheets ได้: ' + error.toString());
  }
}

/**
 * Compare configured sheets with actual sheets
 * @returns {Object} Comparison report
 * @created 2025-09-27
 */
function compareConfiguredWithActualSheets() {
  try {
    const actualSheets = getAllSheetNames();
    const configuredSheets = getConfiguredSheetNames();
    
    if (actualSheets.status === 'error' || configuredSheets.status === 'error') {
      return createJSONResponse('error', 'ไม่สามารถเปรียบเทียบ sheets ได้');
    }
    
    // Check if data exists before accessing properties
    if (!actualSheets.data || !configuredSheets.data) {
      return createJSONResponse('error', 'ข้อมูล sheets ไม่ครบถ้วน');
    }
    
    const comparison = {
      spreadsheetInfo: {
        name: actualSheets.data.spreadsheetName,
        id: actualSheets.data.spreadsheetId,
        url: actualSheets.data.spreadsheetUrl
      },
      summary: {
        totalActualSheets: actualSheets.data.totalSheets,
        totalConfiguredSheets: configuredSheets.data.totalConfigured,
        matchingSheets: 0,
        extraSheets: 0,
        missingSheets: 0
      },
      details: {
        matching: [],
        extra: [],
        missing: []
      }
    };
    
    const actualSheetNames = actualSheets.data.sheets.map(s => s.name);
    const configuredSheetNames = Object.values(CONFIG.SHEETS);
    
    // Find matching sheets
    configuredSheetNames.forEach(configuredName => {
      if (actualSheetNames.includes(configuredName)) {
        comparison.details.matching.push(configuredName);
        comparison.summary.matchingSheets++;
      } else {
        comparison.details.missing.push(configuredName);
        comparison.summary.missingSheets++;
      }
    });
    
    // Find extra sheets
    actualSheetNames.forEach(actualName => {
      if (!configuredSheetNames.includes(actualName)) {
        comparison.details.extra.push(actualName);
        comparison.summary.extraSheets++;
      }
    });
    
    // Overall status
    let status = 'success';
    let message = '✅ ทุก sheet ตรงกับการกำหนดค่า';
    
    if (comparison.summary.missingSheets > 0) {
      status = 'warning';
      message = `⚠️ พบ sheets ที่หายไป ${comparison.summary.missingSheets} sheets`;
    }
    
    if (comparison.summary.extraSheets > 0 && status === 'success') {
      status = 'info';
      message = `ℹ️ มี sheets เพิ่มเติม ${comparison.summary.extraSheets} sheets`;
    }
    
    return createJSONResponse(status, message, comparison);
    
  } catch (error) {
    logError('compareConfiguredWithActualSheets', error);
    return createJSONResponse('error', 'ไม่สามารถเปรียบเทียบ sheets ได้: ' + error.toString());
  }
}

/**
 * Get current spreadsheet information and update CONFIG if needed
 * @returns {Object} Current spreadsheet info
 * @created 2025-09-27
 */
function getCurrentSpreadsheetInfo() {
  try {
    // Use the safe spreadsheet access method
    const spreadsheet = getSpreadsheetSafely();
    
    const info = {
      id: spreadsheet.getId(),
      name: spreadsheet.getName(),
      url: spreadsheet.getUrl(),
      sheetsCount: spreadsheet.getSheets().length
    };
    
    // Update CONFIG if ID is different
    if (CONFIG.SPREADSHEET_ID !== info.id) {
      console.log(`Updating CONFIG.SPREADSHEET_ID from ${CONFIG.SPREADSHEET_ID} to ${info.id}`);
      CONFIG.SPREADSHEET_ID = info.id;
    }
    
    return createJSONResponse('success', 'ได้ข้อมูล spreadsheet แล้ว', info);
    
  } catch (error) {
    logError('getCurrentSpreadsheetInfo', error);
    return createJSONResponse('error', 'ไม่สามารถเข้าถึง spreadsheet ได้: ' + error.toString());
  }
}

/**
 * Get system health status
 * @returns {Object} System health report
 * @created 2025-09-27
 */
function getSystemHealth() {
  try {
    const health = {
      timestamp: new Date().toISOString(),
      spreadsheet: {
        accessible: false,
        name: null,
        id: null
      },
      sheets: {
        total: 0,
        configured: 0,
        missing: 0
      },
      services: {
        auth: false,
        trading: false,
        accounts: false,
        assets: false
      }
    };
    
    // Check spreadsheet access using current spreadsheet info
    try {
      const spreadsheetInfo = getCurrentSpreadsheetInfo();
      if (spreadsheetInfo.status === 'success' && spreadsheetInfo.data) {
        health.spreadsheet.accessible = true;
        health.spreadsheet.name = spreadsheetInfo.data.name;
        health.spreadsheet.id = spreadsheetInfo.data.id;
        
        // Check sheets
        const sheetComparison = compareConfiguredWithActualSheets();
        if (sheetComparison.status !== 'error' && sheetComparison.data && sheetComparison.data.summary) {
          health.sheets.total = sheetComparison.data.summary.totalActualSheets;
          health.sheets.configured = sheetComparison.data.summary.matchingSheets;
          health.sheets.missing = sheetComparison.data.summary.missingSheets;
        }
      }
    } catch (error) {
      console.error('Spreadsheet access error:', error);
    }
    
    // Check service availability (basic function existence check)
    health.services.auth = typeof authenticateUser === 'function';
    health.services.trading = typeof addTrade === 'function';
    health.services.accounts = typeof getAccounts === 'function';
    health.services.assets = typeof getAssets === 'function';
    
    const overallHealth = health.spreadsheet.accessible && 
                         health.sheets.missing === 0 && 
                         Object.values(health.services).every(service => service);
    
    return createJSONResponse(overallHealth ? 'success' : 'warning', 
                            overallHealth ? 'ระบบทำงานปกติ' : 'พบปัญหาบางส่วน', 
                            health);
    
  } catch (error) {
    logError('getSystemHealth', error);
    return createJSONResponse('error', 'ไม่สามารถตรวจสอบสถานะระบบได้: ' + error.toString());
  }
}

/**
 * ตรวจสอบโครงสร้าง sheets และ headers พื้นฐาน
 * @returns {Object} ผลการตรวจสอบ structure
 * @created 2025-09-27
 */
function validateSheetsStructure() {
  console.log('📋 Validating Google Sheets structure...');
  
  const validation = {
    timestamp: new Date().toISOString(),
    spreadsheetId: CONFIG.SPREADSHEET_ID,
    overallStatus: 'success',
    missingSheets: [],
    invalidStructures: [],
    recommendations: [],
    sheets: {}
  };
  
  // Expected sheet structures
  const expectedStructures = {
    [CONFIG.SHEETS.TRADING_JOURNAL]: [
      'Transaction_ID', 'Timestamp', 'Account ID', 'Asset ID',
      'เงินต้นเริ่มต้นวัน (USD)', 'กำไร/ขาดทุนรายวัน (USD)',
      'เงินรวมสิ้นวัน (USD)', 'Lot Size', 'หมายเหตุ'
    ],
    [CONFIG.SHEETS.ACCOUNTS]: [
      'Account ID', 'ชื่อบัญชี', 'ชื่อผู้ใช้/เจ้าของ', 'เงินต้นเริ่มต้น (USD)'
    ],
    [CONFIG.SHEETS.ASSETS]: [
      'Asset ID', 'ชื่อสินทรัพย์', 'ประเภท', 'หมายเหตุ'
    ],
    [CONFIG.SHEETS.USER]: [
      'EmpId', 'FullNameTH', 'Email', 'Role', 'Userstatus', 'password'
    ],
    [CONFIG.SHEETS.USER_TOKENS]: [
      'User ID', 'Token', 'Created At'
    ]
  };
  
  try {
    const spreadsheet = getSpreadsheetSafely();
    validation.spreadsheetName = spreadsheet.getName();
    validation.spreadsheetUrl = spreadsheet.getUrl();
    validation.spreadsheetId = spreadsheet.getId();
    
    // ตรวจสอบแต่ละ sheet
    Object.entries(expectedStructures).forEach(([sheetName, expectedHeaders]) => {
      try {
        const sheet = spreadsheet.getSheetByName(sheetName);
        if (!sheet) {
          throw new Error(`Sheet "${sheetName}" not found`);
        }
        const values = sheet.getDataRange().getValues();
        
        const sheetInfo = {
          exists: true,
          rows: values.length,
          columns: values.length > 0 ? values[0].length : 0,
          actualHeaders: values.length > 0 ? values[0] : [],
          expectedHeaders: expectedHeaders,
          headerMatch: false,
          missingHeaders: [],
          extraHeaders: [],
          sampleDataCount: Math.max(0, values.length - 1)
        };
        
        // ตรวจสอบ headers
        if (values.length > 0) {
          const actualHeaders = values[0];
          
          // หา missing headers
          sheetInfo.missingHeaders = expectedHeaders.filter(header => 
            !actualHeaders.includes(header)
          );
          
          // หา extra headers
          sheetInfo.extraHeaders = actualHeaders.filter(header => 
            !expectedHeaders.includes(header)
          );
          
          // ตรวจสอบว่า headers ตรงกันหรือไม่
          sheetInfo.headerMatch = sheetInfo.missingHeaders.length === 0 && 
                                  sheetInfo.extraHeaders.length === 0;
          
          if (!sheetInfo.headerMatch) {
            validation.invalidStructures.push(sheetName);
            validation.overallStatus = 'warning';
          }
        } else {
          validation.invalidStructures.push(sheetName);
          validation.overallStatus = 'error';
          validation.recommendations.push(`Sheet "${sheetName}" is empty - add headers`);
        }
        
        validation.sheets[sheetName] = sheetInfo;
        
      } catch (error) {
        validation.sheets[sheetName] = {
          exists: false,
          error: error.toString()
        };
        validation.missingSheets.push(sheetName);
        validation.overallStatus = 'error';
      }
    });
    
    // สร้าง recommendations
    if (validation.missingSheets.length > 0) {
      validation.recommendations.push(`Create missing sheets: ${validation.missingSheets.join(', ')}`);
    }
    
    validation.invalidStructures.forEach(sheetName => {
      const sheetInfo = validation.sheets[sheetName];
      if (sheetInfo.missingHeaders && sheetInfo.missingHeaders.length > 0) {
        validation.recommendations.push(`Sheet "${sheetName}" missing headers: ${sheetInfo.missingHeaders.join(', ')}`);
      }
      if (sheetInfo.extraHeaders && sheetInfo.extraHeaders.length > 0) {
        validation.recommendations.push(`Sheet "${sheetName}" has extra headers: ${sheetInfo.extraHeaders.join(', ')}`);
      }
    });
    
    // Summary message
    if (validation.overallStatus === 'success') {
      validation.message = `✅ ทุก sheet มี structure ที่ถูกต้อง (${Object.keys(expectedStructures).length} sheets)`;
    } else if (validation.overallStatus === 'warning') {
      validation.message = `⚠️ Sheet structure มีปัญหาบางส่วน - กรุณาตรวจสอบ headers`;
    } else {
      validation.message = `❌ พบปัญหา sheet structure ที่ต้องแก้ไข`;
    }
    
    console.log(`Sheet validation completed: ${validation.overallStatus}`);
    return validation;
    
  } catch (error) {
    validation.overallStatus = 'error';
    validation.message = `❌ ไม่สามารถเข้าถึง Google Sheets ได้: ${error.toString()}`;
    validation.error = error.toString();
    return validation;
  }
}

/**
 * ตรวจสอบ headers ในแถวแรกของแต่ละ sheet อย่างละเอียด
 * @returns {Object} ผลการตรวจสอบ headers
 * @created 2025-09-27
 */
function validateSheetHeaders() {
  console.log('📋 Validating sheet headers in detail...');
  
  const headerValidation = {
    timestamp: new Date().toISOString(),
    overallStatus: 'success',
    totalSheets: 0,
    validSheets: 0,
    sheets: {}
  };
  
  const expectedHeaders = {
    [CONFIG.SHEETS.TRADING_JOURNAL]: [
      'Transaction_ID', 'Timestamp', 'Account ID', 'Asset ID',
      'เงินต้นเริ่มต้นวัน (USD)', 'กำไร/ขาดทุนรายวัน (USD)',
      'เงินรวมสิ้นวัน (USD)', 'Lot Size', 'หมายเหตุ'
    ],
    [CONFIG.SHEETS.ACCOUNTS]: [
      'Account ID', 'ชื่อบัญชี', 'ชื่อผู้ใช้/เจ้าของ', 'เงินต้นเริ่มต้น (USD)'
    ],
    [CONFIG.SHEETS.ASSETS]: [
      'Asset ID', 'ชื่อสินทรัพย์', 'ประเภท', 'หมายเหตุ'
    ],
    [CONFIG.SHEETS.USER]: [
      'EmpId', 'FullNameTH', 'Email', 'Role', 'Userstatus', 'password'
    ],
    [CONFIG.SHEETS.USER_TOKENS]: [
      'User ID', 'Token', 'Created At'
    ]
  };
  
  try {
    const spreadsheet = getSpreadsheetSafely();
    headerValidation.totalSheets = Object.keys(expectedHeaders).length;
    
    Object.entries(expectedHeaders).forEach(([sheetName, expected]) => {
      try {
        const sheet = spreadsheet.getSheetByName(sheetName);
        if (!sheet) {
          throw new Error(`Sheet "${sheetName}" not found`);
        }
        const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        
        const sheetHeader = {
          sheetName: sheetName,
          exists: true,
          actualHeaders: headerRow,
          expectedHeaders: expected,
          headerCount: {
            actual: headerRow.length,
            expected: expected.length
          },
          validation: {
            correctOrder: true,
            exactMatch: true,
            missingHeaders: [],
            extraHeaders: [],
            positionErrors: []
          }
        };
        
        // ตรวจสอบ headers อย่างละเอียด
        expected.forEach((expectedHeader, index) => {
          const actualHeader = headerRow[index];
          
          if (!actualHeader || actualHeader.toString().trim() === '') {
            sheetHeader.validation.missingHeaders.push({
              header: expectedHeader,
              expectedPosition: index + 1,
              actualValue: actualHeader || 'EMPTY'
            });
            sheetHeader.validation.exactMatch = false;
          } else if (actualHeader.toString().trim() !== expectedHeader) {
            sheetHeader.validation.positionErrors.push({
              position: index + 1,
              expected: expectedHeader,
              actual: actualHeader.toString().trim()
            });
            sheetHeader.validation.exactMatch = false;
          }
        });
        
        // ตรวจสอบ extra headers
        if (headerRow.length > expected.length) {
          for (let i = expected.length; i < headerRow.length; i++) {
            if (headerRow[i] && headerRow[i].toString().trim() !== '') {
              sheetHeader.validation.extraHeaders.push({
                position: i + 1,
                value: headerRow[i].toString().trim()
              });
            }
          }
          sheetHeader.validation.exactMatch = false;
        }
        
        // สถานะของ sheet นี้
        sheetHeader.status = sheetHeader.validation.exactMatch ? 'valid' : 'invalid';
        
        if (sheetHeader.status === 'valid') {
          headerValidation.validSheets++;
        } else {
          headerValidation.overallStatus = 'warning';
        }
        
        headerValidation.sheets[sheetName] = sheetHeader;
        
      } catch (error) {
        headerValidation.sheets[sheetName] = {
          sheetName: sheetName,
          exists: false,
          error: error.toString(),
          status: 'error'
        };
        headerValidation.overallStatus = 'error';
      }
    });
    
    // สรุปผลการตรวจสอบ
    headerValidation.summary = {
      validSheets: headerValidation.validSheets,
      totalSheets: headerValidation.totalSheets,
      validPercentage: Math.round((headerValidation.validSheets / headerValidation.totalSheets) * 100)
    };
    
    if (headerValidation.overallStatus === 'success') {
      headerValidation.message = `✅ Headers ของทุก sheet ถูกต้อง (${headerValidation.validSheets}/${headerValidation.totalSheets})`;
    } else if (headerValidation.overallStatus === 'warning') {
      headerValidation.message = `⚠️ พบปัญหา headers ใน ${headerValidation.totalSheets - headerValidation.validSheets} sheets`;
    } else {
      headerValidation.message = `❌ ไม่สามารถตรวจสอบ headers ได้`;
    }
    
    return headerValidation;
    
  } catch (error) {
    headerValidation.overallStatus = 'error';
    headerValidation.message = `❌ เกิดข้อผิดพลาดในการตรวจสอบ headers: ${error.toString()}`;
    return headerValidation;
  }
}

/**
 * ตรวจสอบ data types ในแถวที่ 2 ของแต่ละ sheet
 * @returns {Object} ผลการตรวจสอบ data types
 * @created 2025-09-27
 */
function validateSheetDataTypes() {
  console.log('🔍 Validating sheet data types...');
  
  const dataValidation = {
    timestamp: new Date().toISOString(),
    overallStatus: 'success',
    totalSheets: 0,
    sheetsWithData: 0,
    emptySheets: 0,
    sheets: {}
  };
  
  // Expected data types for each sheet
  const expectedDataTypes = {
    [CONFIG.SHEETS.TRADING_JOURNAL]: {
      'Transaction_ID': 'string',
      'Timestamp': 'date',
      'Account ID': 'string',
      'Asset ID': 'string',
      'เงินต้นเริ่มต้นวัน (USD)': 'number',
      'กำไร/ขาดทุนรายวัน (USD)': 'number',
      'เงินรวมสิ้นวัน (USD)': 'number',
      'Lot Size': 'number',
      'หมายเหตุ': 'string'
    },
    [CONFIG.SHEETS.ACCOUNTS]: {
      'Account ID': 'string',
      'ชื่อบัญชี': 'string',
      'ชื่อผู้ใช้/เจ้าของ': 'string',
      'เงินต้นเริ่มต้น (USD)': 'number'
    },
    [CONFIG.SHEETS.ASSETS]: {
      'Asset ID': 'string',
      'ชื่อสินทรัพย์': 'string',
      'ประเภท': 'string',
      'หมายเหตุ': 'string'
    },
    [CONFIG.SHEETS.USER]: {
      'EmpId': 'string',
      'FullNameTH': 'string',
      'Email': 'string',
      'Role': 'string',
      'Userstatus': 'number',
      'password': 'string'
    },
    [CONFIG.SHEETS.USER_TOKENS]: {
      'User ID': 'string',
      'Token': 'string',
      'Created At': 'date'
    }
  };
  
  /**
   * Helper function to detect data type
   */
  function detectDataType(value) {
    if (value === null || value === undefined || value === '') {
      return 'null';
    }
    
    if (value instanceof Date) {
      return 'date';
    }
    
    if (typeof value === 'number') {
      return 'number';
    }
    
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    
    const str = value.toString();
    
    // Check if it's a number string
    if (!isNaN(str) && !isNaN(parseFloat(str))) {
      return 'number';
    }
    
    // Check if it's a date string
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
      /^\d{1,2}\/\d{1,2}\/\d{4}/ // M/D/YYYY
    ];
    
    if (datePatterns.some(pattern => pattern.test(str))) {
      return 'date';
    }
    
    return 'string';
  }
  
  try {
    const spreadsheet = getSpreadsheetSafely();
    dataValidation.totalSheets = Object.keys(expectedDataTypes).length;
    
    Object.entries(expectedDataTypes).forEach(([sheetName, expectedTypes]) => {
      try {
        const sheet = spreadsheet.getSheetByName(sheetName);
        if (!sheet) {
          throw new Error(`Sheet "${sheetName}" not found`);
        }
        const values = sheet.getDataRange().getValues();
        
        const sheetData = {
          sheetName: sheetName,
          exists: true,
          totalRows: values.length,
          hasData: values.length > 1,
          headers: values.length > 0 ? values[0] : [],
          sampleData: null,
          dataTypes: {},
          validation: {
            correctTypes: 0,
            totalColumns: 0,
            typeErrors: []
          }
        };
        
        if (values.length > 1) {
          // มีข้อมูลในแถวที่ 2
          dataValidation.sheetsWithData++;
          sheetData.sampleData = values[1];
          
          // ตรวจสอบ data type ของแต่ละคอลัมน์
          sheetData.headers.forEach((header, index) => {
            const cellValue = values[1][index];
            const actualType = detectDataType(cellValue);
            const expectedType = expectedTypes[header];
            
            sheetData.dataTypes[header] = {
              expected: expectedType || 'unknown',
              actual: actualType,
              value: cellValue,
              isCorrect: actualType === expectedType || actualType === 'null', // null is acceptable
              position: index + 1
            };
            
            sheetData.validation.totalColumns++;
            
            if (sheetData.dataTypes[header].isCorrect) {
              sheetData.validation.correctTypes++;
            } else {
              sheetData.validation.typeErrors.push({
                column: header,
                position: index + 1,
                expected: expectedType,
                actual: actualType,
                value: cellValue
              });
            }
          });
          
          // คำนวณ accuracy percentage
          sheetData.validation.accuracy = sheetData.validation.totalColumns > 0 
            ? Math.round((sheetData.validation.correctTypes / sheetData.validation.totalColumns) * 100)
            : 0;
          
          // กำหนดสถานะ
          if (sheetData.validation.typeErrors.length === 0) {
            sheetData.status = 'valid';
          } else if (sheetData.validation.accuracy >= 80) {
            sheetData.status = 'warning';
            dataValidation.overallStatus = 'warning';
          } else {
            sheetData.status = 'error';
            dataValidation.overallStatus = 'error';
          }
          
        } else {
          // Sheet ว่างเปล่า (ไม่มีข้อมูลในแถวที่ 2)
          dataValidation.emptySheets++;
          sheetData.status = 'empty';
          sheetData.message = 'Sheet ไม่มีข้อมูลสำหรับตรวจสอบ data type';
        }
        
        dataValidation.sheets[sheetName] = sheetData;
        
      } catch (error) {
        dataValidation.sheets[sheetName] = {
          sheetName: sheetName,
          exists: false,
          error: error.toString(),
          status: 'error'
        };
        dataValidation.overallStatus = 'error';
      }
    });
    
    // สรุปผลการตรวจสอบ
    dataValidation.summary = {
      totalSheets: dataValidation.totalSheets,
      sheetsWithData: dataValidation.sheetsWithData,
      emptySheets: dataValidation.emptySheets,
      dataPercentage: dataValidation.totalSheets > 0 
        ? Math.round((dataValidation.sheetsWithData / dataValidation.totalSheets) * 100)
        : 0
    };
    
    if (dataValidation.overallStatus === 'success') {
      dataValidation.message = `✅ Data types ของทุก sheet ถูกต้อง (${dataValidation.sheetsWithData} sheets มีข้อมูล, ${dataValidation.emptySheets} sheets ว่าง)`;
    } else if (dataValidation.overallStatus === 'warning') {
      dataValidation.message = `⚠️ พบปัญหา data types ในบาง sheets`;
    } else {
      dataValidation.message = `❌ พบข้อผิดพลาดในการตรวจสอบ data types`;
    }
    
    return dataValidation;
    
  } catch (error) {
    dataValidation.overallStatus = 'error';
    dataValidation.message = `❌ เกิดข้อผิดพลาดในการตรวจสอบ data types: ${error.toString()}`;
    return dataValidation;
  }
}

/**
 * รันการตรวจสอบ headers และ data types แบบครบวงจร
 * @returns {Object} ผลการตรวจสอบรวม
 * @created 2025-09-27
 */
function validateSheetsComprehensive() {
  console.log('🔬 Running comprehensive sheet validation...');
  
  const comprehensive = {
    timestamp: new Date().toISOString(),
    overallStatus: 'success',
    components: {}
  };
  
  try {
    // 1. ตรวจสอบ structure พื้นฐาน
    console.log('📋 Checking basic structure...');
    comprehensive.components.structure = validateSheetsStructure();
    
    // 2. ตรวจสอบ headers อย่างละเอียด
    console.log('📋 Checking headers in detail...');
    comprehensive.components.headers = validateSheetHeaders();
    
    // 3. ตรวจสอบ data types
    console.log('🔍 Checking data types...');
    comprehensive.components.dataTypes = validateSheetDataTypes();
    
    // สรุปสถานะรวม
    const statuses = [
      comprehensive.components.structure.overallStatus,
      comprehensive.components.headers.overallStatus,
      comprehensive.components.dataTypes.overallStatus
    ];
    
    if (statuses.includes('error')) {
      comprehensive.overallStatus = 'error';
      comprehensive.message = '❌ พบปัญหาร้ายแรงในการตรวจสอบ sheets';
    } else if (statuses.includes('warning')) {
      comprehensive.overallStatus = 'warning';
      comprehensive.message = '⚠️ พบปัญหาบางส่วนที่ควรแก้ไข';
    } else {
      comprehensive.overallStatus = 'success';
      comprehensive.message = '✅ Sheet structure, headers และ data types ทั้งหมดถูกต้อง';
    }
    
    return comprehensive;
    
  } catch (error) {
    comprehensive.overallStatus = 'error';
    comprehensive.message = `❌ เกิดข้อผิดพลาดในการตรวจสอบรวม: ${error.toString()}`;
    return comprehensive;
  }
}

/**
 * รันการตรวจสอบและซ่อมแซม sheet structure แบบครบวงจร
 * @returns {Object} ผลรวมการดำเนินการ
 * @created 2025-09-27
 */
function validateAndFixSheets() {
  console.log('🔧 Running complete sheet validation and repair...');
  
  const report = {
    timestamp: new Date().toISOString(),
    validation: null,
    creation: null,
    overallStatus: 'success',
    message: ''
  };
  
  try {
    // 1. ตรวจสอบ structure
    report.validation = validateSheetsStructure();
    
    // 2. สร้าง missing sheets (ถ้ามี)
    if (report.validation.missingSheets.length > 0) {
      report.creation = createMissingSheets();
    }
    
    // 3. ตรวจสอบอีกครั้งหลังการซ่อมแซม
    if (report.creation && report.creation.created.length > 0) {
      report.finalValidation = validateSheetsStructure();
    }
    
    // สรุปผลรวม
    if (report.validation.overallStatus === 'error' && 
        (!report.creation || report.creation.overallStatus === 'error')) {
      report.overallStatus = 'error';
      report.message = '❌ ไม่สามารถแก้ไขปัญหา sheet structure ได้';
    } else if (report.validation.invalidStructures.length > 0) {
      report.overallStatus = 'warning';
      report.message = '⚠️ Sheet structure มีปัญหาบางส่วนที่ต้องแก้ไขด้วยตนเอง';
    } else {
      report.overallStatus = 'success';
      report.message = '✅ Sheet structure ถูกต้องและพร้อมใช้งาน';
    }
    
    return report;
    
  } catch (error) {
    report.overallStatus = 'error';
    report.message = `❌ เกิดข้อผิดพลาดในการตรวจสอบ: ${error.toString()}`;
    return report;
  }
}

/**
 * Simple test function to check spreadsheet access
 * @returns {Object} Test result
 * @created 2025-09-27
 */
function testSpreadsheetAccess() {
  try {
    console.log('🧪 Testing spreadsheet access...');
    
    // Test 1: Try active spreadsheet
    let result = { tests: [] };
    
    try {
      const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      result.tests.push({
        name: 'Active Spreadsheet Access',
        status: 'success',
        data: {
          id: activeSpreadsheet.getId(),
          name: activeSpreadsheet.getName(),
          sheetsCount: activeSpreadsheet.getSheets().length
        }
      });
    } catch (error) {
      result.tests.push({
        name: 'Active Spreadsheet Access',
        status: 'failed',
        error: error.toString()
      });
    }
    
    // Test 2: Try configured ID (if exists)
    if (CONFIG.SPREADSHEET_ID) {
      try {
        const configuredSpreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
        result.tests.push({
          name: 'Configured Spreadsheet Access',
          status: 'success',
          data: {
            id: configuredSpreadsheet.getId(),
            name: configuredSpreadsheet.getName(),
            sheetsCount: configuredSpreadsheet.getSheets().length
          }
        });
      } catch (error) {
        result.tests.push({
          name: 'Configured Spreadsheet Access',
          status: 'failed',
          error: error.toString()
        });
      }
    } else {
      result.tests.push({
        name: 'Configured Spreadsheet Access',
        status: 'skipped',
        reason: 'No SPREADSHEET_ID configured'
      });
    }
    
    const successfulTests = result.tests.filter(test => test.status === 'success');
    const overallStatus = successfulTests.length > 0 ? 'success' : 'error';
    
    return createJSONResponse(overallStatus, 
      `ทดสอบการเข้าถึงสำเร็จ ${successfulTests.length}/${result.tests.length} tests`, 
      result);
    
  } catch (error) {
    return createJSONResponse('error', 'ทดสอบล้มเหลว: ' + error.toString());
  }
}

/**
 * Simple version - get sheet names only (similar to user's original function)
 * @returns {Array} Array of sheet names
 * @created 2025-09-27
 */
function getSheetNames() {
  try {
    // รับ active spreadsheet (สเปรดชีตปัจจุบัน) หรือ fallback ไป configured ID
    const spreadsheet = getSpreadsheetSafely();
    
    // รับชีตทั้งหมดในสเปรดชีต
    const sheets = spreadsheet.getSheets();
    
    // สร้างอาร์เรย์ว่างเพื่อเก็บชื่อชีต
    const sheetNames = [];
    
    // วนลูปผ่านชีตแต่ละอันแล้วเพิ่มชื่อลงในอาร์เรย์
    for (let i = 0; i < sheets.length; i++) {
      sheetNames.push(sheets[i].getName());
    }
    
    // แสดงผลลัพธ์ใน logs
    console.log('Sheet names:', sheetNames);
    
    return sheetNames;
  } catch (error) {
    console.error('Error getting sheet names:', error);
    return [];
  }
}

/**
 * Simple version - check sheet headers (similar to user's original function)
 * @returns {Array} Array of sheet data with headers
 * @created 2025-09-27
 */
function checkSheetHeaders() {
  try {
    // รับ active spreadsheet (สเปรดชีตปัจจุบัน) หรือ fallback ไป configured ID
    const spreadsheet = getSpreadsheetSafely();
    
    // รับชีตทั้งหมดในสเปรดชีต
    const sheets = spreadsheet.getSheets();
    
    // สร้างอาร์เรย์ว่างเพื่อเก็บชื่อชีตและข้อมูล header
    const results = [];
    
    // วนลูปผ่านชีตแต่ละอัน
    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      const sheetName = sheet.getName();
      
      // ตรวจสอบว่าชีตนั้นมีข้อมูลอยู่หรือไม่
      const lastCol = sheet.getLastColumn();
      
      if (lastCol > 0) {
        // รับค่าทั้งหมดในแถวแรก (แถวที่ 1)
        // getRange(row, column, numRows, numColumns)
        const headerRange = sheet.getRange(1, 1, 1, lastCol);
        const headerValues = headerRange.getValues()[0];
        
        // สร้าง object เพื่อเก็บชื่อชีตและ header ของชีตนั้น
        const sheetData = {
          sheetName: sheetName,
          headers: headerValues
        };
        
        // เพิ่ม object เข้าไปในอาร์เรย์ผลลัพธ์
        results.push(sheetData);
        
        // แสดงผลลัพธ์ใน logs
        console.log(`Sheet: ${sheetName}, Headers: ${headerValues.join(', ')}`);
      } else {
        // กรณีชีตไม่มีข้อมูล
        const sheetData = {
          sheetName: sheetName,
          headers: []
        };
        results.push(sheetData);
        console.log(`Sheet: ${sheetName} is empty, no headers found.`);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error checking sheet headers:', error);
    return [];
  }
}

/**
 * สร้าง sheet ที่หายไปพร้อม headers ที่ถูกต้อง
 * @returns {Object} ผลการสร้าง sheets
 * @created 2025-09-27
 */
function createMissingSheets() {
  console.log('🛠️ Creating missing sheets...');
  
  const result = {
    timestamp: new Date().toISOString(),
    created: [],
    skipped: [],
    errors: [],
    overallStatus: 'success'
  };
  
  const expectedStructures = {
    [CONFIG.SHEETS.TRADING_JOURNAL]: [
      'Transaction_ID', 'Timestamp', 'Account ID', 'Asset ID',
      'เงินต้นเริ่มต้นวัน (USD)', 'กำไร/ขาดทุนรายวัน (USD)',
      'เงินรวมสิ้นวัน (USD)', 'Lot Size', 'หมายเหตุ'
    ],
    [CONFIG.SHEETS.ACCOUNTS]: [
      'Account ID', 'ชื่อบัญชี', 'ชื่อผู้ใช้/เจ้าของ', 'เงินต้นเริ่มต้น (USD)'
    ],
    [CONFIG.SHEETS.ASSETS]: [
      'Asset ID', 'ชื่อสินทรัพย์', 'ประเภท', 'หมายเหตุ'
    ],
    [CONFIG.SHEETS.USER]: [
      'EmpId', 'FullNameTH', 'Email', 'Role', 'Userstatus', 'password'
    ],
    [CONFIG.SHEETS.USER_TOKENS]: [
      'User ID', 'Token', 'Created At'
    ]
  };
  
  try {
    const spreadsheet = getSpreadsheetSafely();
    
    Object.entries(expectedStructures).forEach(([sheetName, headers]) => {
      try {
        // ตรวจสอบว่า sheet มีอยู่หรือไม่
        let sheet = spreadsheet.getSheetByName(sheetName);
        
        if (!sheet) {
          // สร้าง sheet ใหม่
          sheet = spreadsheet.insertSheet(sheetName);
          
          // เพิ่ม headers
          sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
          
          // Format headers
          const headerRange = sheet.getRange(1, 1, 1, headers.length);
          headerRange.setFontWeight('bold');
          headerRange.setBackground('#f0f0f0');
          
          result.created.push(sheetName);
          console.log(`Created sheet: ${sheetName}`);
        } else {
          result.skipped.push(`${sheetName} (already exists)`);
        }
        
      } catch (error) {
        result.errors.push(`${sheetName}: ${error.toString()}`);
        result.overallStatus = 'partial';
      }
    });
    
    if (result.errors.length > 0) {
      result.overallStatus = result.created.length > 0 ? 'partial' : 'error';
    }
    
    result.message = result.created.length > 0 
      ? `✅ สร้าง sheets เรียบร้อย: ${result.created.join(', ')}`
      : `ℹ️ ไม่มี sheet ที่ต้องสร้างเพิ่ม`;
    
    return result;
    
  } catch (error) {
    result.overallStatus = 'error';
    result.message = `❌ ไม่สามารถสร้าง sheets ได้: ${error.toString()}`;
    result.errors.push(error.toString());
    return result;
  }
}