/**
 * BaseModel - Foundation class for all data models
 * Provides common database operations and utilities
 * @created 2025-10-03
 */

/**
 * Base Model Class
 * Provides common functionality for all data models
 */
class BaseModel {
  
  /**
   * Get Google Sheets instance by name
   * @param {string} sheetName - Name of the sheet
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} Sheet instance
   */
  static getSheet(sheetName) {
    return getSheet(sheetName); // Uses existing CONFIG function
  }
  
  /**
   * Get all data from a sheet as 2D array
   * @param {string} sheetName - Name of the sheet
   * @returns {Array<Array>} 2D array of sheet data
   */
  static getSheetData(sheetName) {
    const sheet = this.getSheet(sheetName);
    return sheet.getDataRange().getValues();
  }
  
  /**
   * Convert sheet data to array of objects
   * @param {Array<Array>} values - 2D array from sheet
   * @param {Array<string>} headers - Array of column headers
   * @returns {Array<Object>} Array of objects with headers as keys
   */
  static convertToObjects(values, headers) {
    if (values.length <= 1) return [];
    
    const dataRows = values.slice(1); // Skip header row
    return dataRows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  }
  
  /**
   * Find record by field value
   * @param {string} sheetName - Name of the sheet
   * @param {string} fieldName - Name of the field to search
   * @param {*} value - Value to search for
   * @param {Array<string>} headers - Column headers
   * @returns {Object|null} Found record or null
   */
  static findByField(sheetName, fieldName, value, headers) {
    const values = this.getSheetData(sheetName);
    if (values.length <= 1) return null;
    
    const fieldIndex = headers.indexOf(fieldName);
    if (fieldIndex === -1) return null;
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (String(row[fieldIndex]) === String(value)) {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      }
    }
    
    return null;
  }
  
  /**
   * Find all records matching criteria
   * @param {string} sheetName - Name of the sheet
   * @param {string} fieldName - Field to filter by
   * @param {*} value - Value to match
   * @param {Array<string>} headers - Column headers
   * @returns {Array<Object>} Array of matching records
   */
  static findAllByField(sheetName, fieldName, value, headers) {
    const values = this.getSheetData(sheetName);
    if (values.length <= 1) return [];
    
    const fieldIndex = headers.indexOf(fieldName);
    if (fieldIndex === -1) return [];
    
    const results = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (String(row[fieldIndex]) === String(value)) {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        results.push(obj);
      }
    }
    
    return results;
  }
  
  /**
   * Add new record to sheet
   * @param {string} sheetName - Name of the sheet
   * @param {Array} rowData - Array of values to add
   * @returns {boolean} Success status
   */
  static addRecord(sheetName, rowData) {
    try {
      const sheet = this.getSheet(sheetName);
      sheet.appendRow(rowData);
      return true;
    } catch (error) {
      console.error('Error adding record:', error);
      return false;
    }
  }
  
  /**
   * Update record by row index
   * @param {string} sheetName - Name of the sheet
   * @param {number} rowIndex - Row index (1-based)
   * @param {Array} newData - New row data
   * @returns {boolean} Success status
   */
  static updateRecord(sheetName, rowIndex, newData) {
    try {
      const sheet = this.getSheet(sheetName);
      const range = sheet.getRange(rowIndex, 1, 1, newData.length);
      range.setValues([newData]);
      return true;
    } catch (error) {
      console.error('Error updating record:', error);
      return false;
    }
  }
  
  /**
   * Generate UUID for records
   * @returns {string} UUID string
   */
  static generateId() {
    return createUUID(); // Uses existing utility function
  }
  
  /**
   * Get current timestamp
   * @returns {string} ISO timestamp
   */
  static getCurrentTimestamp() {
    return new Date().toISOString();
  }
  
  /**
   * Validate required fields
   * @param {Object} data - Data object to validate
   * @param {Array<string>} requiredFields - Array of required field names
   * @returns {Object} Validation result { isValid: boolean, missing: Array }
   */
  static validateRequired(data, requiredFields) {
    const missing = [];
    
    requiredFields.forEach(field => {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        missing.push(field);
      }
    });
    
    return {
      isValid: missing.length === 0,
      missing: missing
    };
  }
}