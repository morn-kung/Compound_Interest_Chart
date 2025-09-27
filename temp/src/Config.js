/**
 * Configuration constants and settings for the Trading Journal application
 * Central location for all app configuration
 */

const CONFIG = {
  // Google Spreadsheet Configuration
  SPREADSHEET_ID: '1yIK0FeaI5XlGkHMo05aLgEXw9YSJYuL6iEzrV0oYvgw',
  
  // Sheet Names
  SHEETS: {
    TRADING_JOURNAL: 'Trading_Journal',
    ACCOUNTS: 'Accounts',
    ASSETS: 'Assets',
    USER: 'user',
    USER_TOKENS: 'UserTokens'
  },
  
  // Error Messages
  MESSAGES: {
    SPREADSHEET_ERROR: 'ไม่สามารถเข้าถึง Google Sheets ได้',
    SHEET_NOT_FOUND: 'ไม่พบ sheet ที่ระบุ',
    INVALID_ACCOUNT: 'รหัสบัญชีไม่ถูกต้อง',
    INVALID_ASSET: 'รหัสสินทรัพย์ไม่ถูกต้อง',
    MISSING_PARAMETERS: 'ข้อมูลไม่ครบถ้วน',
    TRADE_ADDED_SUCCESS: 'บันทึกข้อมูลการเทรดเรียบร้อยแล้ว',
    DATA_RETRIEVED_SUCCESS: 'ดึงข้อมูลเรียบร้อยแล้ว'
  },
  
  // Default Values
  DEFAULTS: {
    CURRENCY: 'USD',
    TIMEZONE: 'Asia/Bangkok',
    DECIMAL_PLACES: 2
  },
  
  // Column Mappings for Sheets
  COLUMNS: {
    TRADING_JOURNAL: {
      TRANSACTION_ID: 0,
      TIMESTAMP: 1,
      ACCOUNT_ID: 2,
      ASSET_ID: 3,
      START_BALANCE: 4,
      DAILY_PROFIT: 5,
      END_BALANCE: 6,
      LOT_SIZE: 7,
      NOTES: 8,
      TRADE_DATE: 9
    },
    ACCOUNTS: {
      ACCOUNT_ID: 0,
      ACCOUNT_NAME: 1,
      OWNER_NAME: 2,
      INITIAL_CAPITAL: 3
    },
    ASSETS: {
      ASSET_ID: 0,
      ASSET_NAME: 1,
      ASSET_TYPE: 2,
      NOTES: 3
    },
    USER: {
      EMP_ID: 0,
      FULL_NAME_TH: 1,
      EMAIL: 2,
      ROLE: 3,
      USER_STATUS: 4,
      PASSWORD: 5
    }
  }
};

/**
 * Get the main spreadsheet using safe method
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} The spreadsheet object
 */
function getSpreadsheet() {
  // Use the safe method from Services_System.js
  return getSpreadsheetSafely();
}

/**
 * Get a specific sheet by name
 * @param {string} sheetName - Name of the sheet to retrieve
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} The sheet object
 */
function getSheet(sheetName) {
  try {
    const spreadsheet = getSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`${CONFIG.MESSAGES.SHEET_NOT_FOUND}: ${sheetName}`);
    }
    
    return sheet;
  } catch (error) {
    console.error(`Error getting sheet ${sheetName}:`, error);
    throw error;
  }
}