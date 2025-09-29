/**
 * Configuration constants and settings for the Trading Journal application
 * Central location for all application configuration, constants, and settings
 * @requires Types.js - For type definitions
 * @created 2025-09-27 (refactored)
 */

/**
 * Main configuration object containing all application settings
 * @namespace CONFIG
 */
const CONFIG = {
  /** 
   * Google Spreadsheet Configuration
   * @readonly
   */
  SPREADSHEET_ID: '1yIK0FeaI5XlGkHMo05aLgEXw9YSJYuL6iEzrV0oYvgw',
  
  /** 
   * Sheet Names Configuration
   * Maps logical sheet names to actual Google Sheets tab names
   * @readonly
   */
  SHEETS: {
    TRADING_JOURNAL: 'Trading_Journal',
    ACCOUNTS: 'Accounts',
    ASSETS: 'Assets',
    USER: 'user',
    USER_TOKENS: 'UserTokens'
  },
  
  /** 
   * Standardized Error and Success Messages
   * Centralized message constants for consistency across the application
   * @readonly
   */
  MESSAGES: {
    SPREADSHEET_ERROR: 'ไม่สามารถเข้าถึง Google Sheets ได้',
    SHEET_NOT_FOUND: 'ไม่พบ sheet ที่ระบุ',
    INVALID_ACCOUNT: 'รหัสบัญชีไม่ถูกต้อง',
    INVALID_ASSET: 'รหัสสินทรัพย์ไม่ถูกต้อง',
    MISSING_PARAMETERS: 'ข้อมูลไม่ครบถ้วน',
    TRADE_ADDED_SUCCESS: 'บันทึกข้อมูลการเทรดเรียบร้อยแล้ว',
    DATA_RETRIEVED_SUCCESS: 'ดึงข้อมูลเรียบร้อยแล้ว'
  },
  
  /** 
   * Default Values and Settings
   * Application-wide default configurations
   * @readonly
   */
  DEFAULTS: {
    CURRENCY: 'USD',
    TIMEZONE: 'Asia/Bangkok',
    DECIMAL_PLACES: 2
  },
  
  /** 
   * Column Mappings for Google Sheets (will be auto-generated from SHEET_SCHEMAS)
   * Zero-based column indices for programmatic access to sheet data
   * @readonly
   */
  COLUMNS: {} // Will be populated by auto-generation
};

/**
 * Get the main spreadsheet using safe access method
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} The spreadsheet object
 * @throws {Error} When spreadsheet cannot be accessed
 */
function getSpreadsheet() {
  // Use the safe method from Services_System.js
  return getSpreadsheetSafely();
}

/**
 * Get a specific sheet by name with error handling
 * @param {string} sheetName - Name of the sheet to retrieve (use CONFIG.SHEETS constants)
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} The sheet object
 * @throws {Error} When sheet is not found or cannot be accessed
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

/**
 * Sheet schema definitions for all sheets (headers, dataTypes)
 * @typedef {Object} SheetSchema
 * @property {string[]} headers - List of column names
 * @property {string[]} dataTypes - List of data types for each column
 */

/**
 * Static fallback SHEET_SCHEMAS (can be overridden by loadSchemasFromSheets())
 * @type {Object.<string, SheetSchema>}
 */
var SHEET_SCHEMAS = {
  Trading_Journal: {
    "headers": [
      "Transaction_ID",
      "Timestamp",
      "Account ID",
      "Asset ID",
      "เงินต้นเริ่มต้นวัน (USD)",
      "กำไร/ขาดทุนรายวัน (USD)",
      "เงินรวมสิ้นวัน (USD)",
      "Lot Size",
      "หมายเหตุ",
      "Trade Date"
    ],
    "dataTypes": [
      "string",
      "object (Date)",
      "number",
      "number",
      "number",
      "number",
      "number",
      "number",
      "string",
      "object (Date)"
    ]
  },
  Assets: {
    "headers": [
      "Asset ID",
      "ชื่อสินทรัพย์",
      "ประเภท",
      "หมายเหตุ"
    ],
    "dataTypes": [
      "number",
      "string",
      "string",
      "string"
    ]
  },
  Accounts: {
    "headers": [
      "Account ID",
      "ชื่อบัญชี",
      "ชื่อผู้ใช้/เจ้าของ",
      "เงินต้นเริ่มต้น (USD)"
    ],
    "dataTypes": [
      "number",
      "string",
      "string",
      "number"
    ]
  },
  UserTokens: {
    "headers": [
      "User ID",
      "Token",
      "Created At"
    ],
    "dataTypes": [
      "number",
      "string",
      "object (Date)"
    ]
  },
  user: {
    "headers": [
      "EmpId",
      "FullNameTH",
      "Email",
      "Role",
      "Userstatus",
      "password",
      "requirePasswordChange",
      "tempPassword"
    ],  
    "dataTypes": [
      "number",
      "string",
      "string",
      "string",
      "number",
      "string",
      "string",
      "string"
    ]
  }
};

/**
 * Column index mapping for all sheets (auto-generated from headers)
 * @readonly
 * @type {Object.<string, Object<string, number>>}
 */
/**
 * Auto-generated COLUMNS from SHEET_SCHEMAS
 * Use loadSchemasFromSheets() to refresh from Google Sheets
 * Use regenerateColumns() to refresh from current SHEET_SCHEMAS
 */
var COLUMNS = {};
// Initial generation will be done by regenerateColumns() below

/**
 * Load SHEET_SCHEMAS dynamically from Google Sheets (requires checkSheetDatatypes.js)
 * This will update SHEET_SCHEMAS and regenerate COLUMNS
 */
function loadSchemasFromSheets() {
  try {
    // Call the function from checkSheetDatatypes.js
    const sheetsData = checkSheetDatatypes(); // Returns array of objects
    
    // Convert array format to object format for SHEET_SCHEMAS
    const newSchemas = {};
    sheetsData.forEach(function(sheetData) {
      newSchemas[sheetData.sheetName] = {
        headers: sheetData.headers,
        dataTypes: sheetData.dataTypes
      };
    });
    
    // Update global SHEET_SCHEMAS
    SHEET_SCHEMAS = newSchemas;
    
    // Regenerate COLUMNS
    regenerateColumns();
    
    console.log('✅ SHEET_SCHEMAS loaded dynamically from Google Sheets');
    return newSchemas;
    
  } catch (error) {
    console.warn('⚠️ Failed to load schemas from sheets, using static fallback:', error.toString());
    return SHEET_SCHEMAS; // Return static fallback
  }
}

/**
 * Regenerate COLUMNS from current SHEET_SCHEMAS
 */
function regenerateColumns() {
  // Clear existing COLUMNS
  COLUMNS = {};
  
  // Regenerate COLUMNS from current SHEET_SCHEMAS
  Object.keys(SHEET_SCHEMAS).forEach(function(sheetName) {
    var cols = {};
    var headers = SHEET_SCHEMAS[sheetName].headers;
    headers.forEach(function(h, idx) { cols[h] = idx; });
    COLUMNS[sheetName] = cols;
  });
  
  // Update CONFIG.COLUMNS
  CONFIG.COLUMNS = {
    TRADING_JOURNAL: COLUMNS.Trading_Journal || {},
    ACCOUNTS: COLUMNS.Accounts || {},
    ASSETS: COLUMNS.Assets || {},
    USER_TOKENS: COLUMNS.UserTokens || {},
    USER: {
      EMP_ID: COLUMNS.user ? COLUMNS.user['EmpId'] : 0,
      FULL_NAME_TH: COLUMNS.user ? COLUMNS.user['FullNameTH'] : 1,
      EMAIL: COLUMNS.user ? COLUMNS.user['Email'] : 2,
      ROLE: COLUMNS.user ? COLUMNS.user['Role'] : 3,
      USER_STATUS: COLUMNS.user ? COLUMNS.user['Userstatus'] : 4,
      PASSWORD: COLUMNS.user ? COLUMNS.user['password'] : 5,
      REQUIRE_PASSWORD_CHANGE: COLUMNS.user ? COLUMNS.user['requirePasswordChange'] : 6,
      TEMP_PASSWORD: COLUMNS.user ? COLUMNS.user['tempPassword'] : 7
    }
  };
}

// Initialize with static schemas first
regenerateColumns();

/**
 * Get current SHEET_SCHEMAS (either static or dynamically loaded)
 * @returns {Object.<string, SheetSchema>} Current sheet schemas
 */
function getSheetSchemas() {
  return SHEET_SCHEMAS;
}

/**
 * Get schema for a specific sheet
 * @param {string} sheetName - Name of the sheet
 * @returns {SheetSchema|null} Schema object or null if not found
 */
function getSheetSchema(sheetName) {
  return SHEET_SCHEMAS[sheetName] || null;
}