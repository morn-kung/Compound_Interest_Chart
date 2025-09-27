/**
 * Configuration file for Trading Journal & Compound Calculator
 * Contains all constants and configuration settings
 */

/**
 * Google Spreadsheet Configuration
 */
const CONFIG = {
  // Main Spreadsheet ID - CHANGE THIS TO YOUR ACTUAL SPREADSHEET ID
  SPREADSHEET_ID: '1w5FzO39xC_xvLNxreHZyQLMf-dVVeQYRh_CkKRg5K1k',
  
  // Sheet Names
  SHEETS: {
    TRADING_JOURNAL: 'Trading_Journal',
    ACCOUNTS: 'Accounts',
    ASSETS: 'Assets',
    USER: 'user'
  },
  
  // API Response Messages
  MESSAGES: {
    SUCCESS: {
      TRADE_SAVED: 'บันทึกข้อมูลการเทรดสำเร็จแล้ว',
      DATA_RETRIEVED: 'ดึงข้อมูลสำเร็จ'
    },
    ERROR: {
      INVALID_ACTION: 'Invalid action. Supported actions: getAccounts, getAssets, getTradingHistory',
      INVALID_CONTENT_TYPE: 'Invalid content type. Please use form data.',
      SHEET_NOT_FOUND: 'ไม่พบชีทที่ระบุ',
      ACCOUNT_ID_REQUIRED: 'Account ID is required',
      TRADE_SAVE_FAILED: 'บันทึกข้อมูลไม่สำเร็จ',
      DATA_RETRIEVAL_FAILED: 'ไม่สามารถดึงข้อมูลได้'
    }
  },
  
  // Default Values
  DEFAULTS: {
    EMPTY_ARRAY: [],
    STATUS_SUCCESS: 'success',
    STATUS_ERROR: 'error'
  }
};

/**
 * Get spreadsheet instance
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

/**
 * Get sheet by name with error handling
 * @param {string} sheetName - Name of the sheet
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null}
 */
function getSheet(sheetName) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet named "${sheetName}" not found.`);
    }
    
    return sheet;
  } catch (error) {
    Logger.log(`Error getting sheet "${sheetName}": ${error.message}`);
    return null;
  }
}