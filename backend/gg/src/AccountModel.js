/**
 * AccountModel - Account data access layer
 * Handles all account-related database operations
 * @requires BaseModel - For common database operations
 * @created 2025-10-03
 */

/**
 * Account Model Class
 * Provides data access methods for account operations
 */
class AccountModel extends BaseModel {
  
  static get SHEET_NAME() {
    return CONFIG.SHEETS.ACCOUNTS;
  }
  
  static get HEADERS() {
    return [
      'Account_ID',
      'ชื่อบัญชี',
      'ชื่อผู้ใช้_เจ้าของ',
      'เงินต้นเริ่มต้น_USD'
    ];
  }
  
  /**
   * Get all accounts
   * @returns {Array<Object>} Array of account records
   */
  static getAllAccounts() {
    const values = this.getSheetData(this.SHEET_NAME);
    return this.convertToObjects(values, this.HEADERS);
  }
  
  /**
   * Find account by ID
   * @param {string} accountId - Account ID to find
   * @returns {Object|null} Account object or null if not found
   */
  static findById(accountId) {
    return this.findByField(
      this.SHEET_NAME,
      'Account_ID',
      accountId,
      this.HEADERS
    );
  }
  
  /**
   * Find accounts by owner username
   * @param {string} username - Owner username
   * @returns {Array<Object>} Array of accounts owned by user
   */
  static findByOwner(username) {
    return this.findAllByField(
      this.SHEET_NAME,
      'ชื่อผู้ใช้_เจ้าของ',
      username,
      this.HEADERS
    );
  }
  
  /**
   * Validate if account exists
   * @param {string} accountId - Account ID to validate
   * @returns {boolean} True if account exists
   */
  static exists(accountId) {
    return this.findById(accountId) !== null;
  }
  
  /**
   * Create new account
   * @param {Object} accountData - Account data
   * @returns {Object} Result with success status and account ID
   */
  static createAccount(accountData) {
    try {
      const validation = this.validateAccountData(accountData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.missing
        };
      }
      
      // Check if account ID already exists
      if (this.exists(accountData.accountId)) {
        return {
          success: false,
          errors: ['Account ID already exists']
        };
      }
      
      const rowData = [
        accountData.accountId,
        accountData.accountName,
        accountData.ownerUsername,
        accountData.initialCapital || 0
      ];
      
      const success = this.addRecord(this.SHEET_NAME, rowData);
      
      return {
        success: success,
        accountId: success ? accountData.accountId : null
      };
      
    } catch (error) {
      console.error('Error creating account:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Update account information
   * @param {string} accountId - Account ID to update
   * @param {Object} updateData - Data to update
   * @returns {boolean} Success status
   */
  static updateAccount(accountId, updateData) {
    try {
      const values = this.getSheetData(this.SHEET_NAME);
      
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (String(row[0]) === String(accountId)) {
          // Update fields if provided
          if (updateData.accountName !== undefined) {
            row[1] = updateData.accountName;
          }
          if (updateData.ownerUsername !== undefined) {
            row[2] = updateData.ownerUsername;
          }
          if (updateData.initialCapital !== undefined) {
            row[3] = updateData.initialCapital;
          }
          
          return this.updateRecord(this.SHEET_NAME, i + 1, row);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error updating account:', error);
      return false;
    }
  }
  
  /**
   * Delete account
   * @param {string} accountId - Account ID to delete
   * @returns {boolean} Success status
   */
  static deleteAccount(accountId) {
    try {
      const values = this.getSheetData(this.SHEET_NAME);
      const sheet = this.getSheet(this.SHEET_NAME);
      
      for (let i = 1; i < values.length; i++) {
        if (String(values[i][0]) === String(accountId)) {
          sheet.deleteRow(i + 1);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting account:', error);
      return false;
    }
  }
  
  /**
   * Get account summary with trading statistics
   * @param {string} accountId - Account ID
   * @returns {Object|null} Account summary with statistics
   */
  static getAccountSummary(accountId) {
    const account = this.findById(accountId);
    if (!account) return null;
    
    // Get trading statistics from TradingModel
    const tradingStats = TradingModel.getTradingStatistics(accountId);
    
    // Calculate current balance based on initial capital + total profit
    const currentBalance = parseFloat(account['เงินต้นเริ่มต้น_USD']) + tradingStats.totalProfit;
    
    return {
      ...account,
      currentBalance: currentBalance,
      statistics: tradingStats
    };
  }
  
  /**
   * Validate account data
   * @param {Object} accountData - Account data to validate
   * @returns {Object} Validation result
   */
  static validateAccountData(accountData) {
    const required = ['accountId', 'accountName', 'ownerUsername'];
    const validation = this.validateRequired(accountData, required);
    
    if (!validation.isValid) {
      return validation;
    }
    
    // Additional validations
    const errors = [];
    
    if (accountData.initialCapital !== undefined && parseFloat(accountData.initialCapital) < 0) {
      errors.push('Initial capital cannot be negative');
    }
    
    return {
      isValid: errors.length === 0,
      missing: errors
    };
  }
  
  /**
   * Check if user has access to account
   * @param {string} username - Username to check
   * @param {string} accountId - Account ID to check
   * @returns {boolean} True if user has access
   */
  static userHasAccess(username, accountId) {
    const account = this.findById(accountId);
    if (!account) return false;
    
    return String(account['ชื่อผู้ใช้_เจ้าของ']) === String(username);
  }
  
  /**
   * Get accounts accessible by user
   * @param {string} username - Username
   * @returns {Array<Object>} Array of accessible accounts
   */
  static getAccessibleAccounts(username) {
    return this.findByOwner(username);
  }
}