/**
 * UserModel - User data access layer
 * Handles all user-related database operations
 * @requires BaseModel - For common database operations
 * @created 2025-10-03
 */

/**
 * User Model Class
 * Provides data access methods for user operations
 */
class UserModel extends BaseModel {
  
  // Define column mapping for USER sheet
  static get COLUMNS() {
    return CONFIG.COLUMNS.USER;
  }
  
  static get SHEET_NAME() {
    return CONFIG.SHEETS.USER;
  }
  
  static get HEADERS() {
    return [
      'EMP_ID',
      'FULL_NAME_EN', 
      'EMAIL',
      'FULL_NAME_TH',
      'USER_STATUS',
      'PASSWORD',
      'ROLE',
      'REQUIRE_PASSWORD_CHANGE',
      'TEMP_PASSWORD'
    ];
  }
  
  /**
   * Find user by username (EmpId or Email)
   * @param {string} username - Username or email to search for
   * @returns {Object|null} User object or null if not found
   */
  static findByUsername(username) {
    const values = this.getSheetData(this.SHEET_NAME);
    if (values.length <= 1) return null;
    
    const usernameStr = String(username);
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const empId = String(row[this.COLUMNS.EMP_ID]);
      const email = String(row[this.COLUMNS.EMAIL]);
      const userStatus = String(row[this.COLUMNS.USER_STATUS]);
      
      // Check if username matches EmpId or Email and user is active
      if ((empId === usernameStr || email === usernameStr) && userStatus === '1') {
        return this.mapRowToUser(row);
      }
    }
    
    return null;
  }
  
  /**
   * Find user by Employee ID
   * @param {string} empId - Employee ID
   * @returns {Object|null} User object or null if not found
   */
  static findByEmpId(empId) {
    return this.findByField(
      this.SHEET_NAME,
      'EMP_ID',
      empId,
      this.HEADERS
    );
  }
  
  /**
   * Find user by email address
   * @param {string} email - Email address
   * @returns {Object|null} User object or null if not found
   */
  static findByEmail(email) {
    return this.findByField(
      this.SHEET_NAME,
      'EMAIL',
      email,
      this.HEADERS
    );
  }
  
  /**
   * Get all active users
   * @returns {Array<Object>} Array of active users
   */
  static getAllActiveUsers() {
    return this.findAllByField(
      this.SHEET_NAME,
      'USER_STATUS',
      '1',
      this.HEADERS
    );
  }
  
  /**
   * Update user password
   * @param {string} empId - Employee ID
   * @param {string} newPasswordHash - New password hash
   * @param {boolean} requirePasswordChange - Whether to require password change
   * @returns {boolean} Success status
   */
  static updatePassword(empId, newPasswordHash, requirePasswordChange = false) {
    try {
      const values = this.getSheetData(this.SHEET_NAME);
      
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (String(row[this.COLUMNS.EMP_ID]) === String(empId)) {
          // Update password fields
          row[this.COLUMNS.PASSWORD] = newPasswordHash;
          row[this.COLUMNS.REQUIRE_PASSWORD_CHANGE] = requirePasswordChange;
          row[this.COLUMNS.TEMP_PASSWORD] = false; // Clear temp password flag
          
          return this.updateRecord(this.SHEET_NAME, i + 1, row);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  }
  
  /**
   * Set temporary password for user
   * @param {string} empId - Employee ID
   * @param {string} tempPasswordHash - Temporary password hash
   * @returns {boolean} Success status
   */
  static setTemporaryPassword(empId, tempPasswordHash) {
    try {
      const values = this.getSheetData(this.SHEET_NAME);
      
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (String(row[this.COLUMNS.EMP_ID]) === String(empId)) {
          // Set temporary password
          row[this.COLUMNS.PASSWORD] = tempPasswordHash;
          row[this.COLUMNS.TEMP_PASSWORD] = true;
          row[this.COLUMNS.REQUIRE_PASSWORD_CHANGE] = true;
          
          return this.updateRecord(this.SHEET_NAME, i + 1, row);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error setting temporary password:', error);
      return false;
    }
  }
  
  /**
   * Update user status (activate/deactivate)
   * @param {string} empId - Employee ID
   * @param {boolean} isActive - Active status
   * @returns {boolean} Success status
   */
  static updateUserStatus(empId, isActive) {
    try {
      const values = this.getSheetData(this.SHEET_NAME);
      
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (String(row[this.COLUMNS.EMP_ID]) === String(empId)) {
          row[this.COLUMNS.USER_STATUS] = isActive ? 1 : 0;
          return this.updateRecord(this.SHEET_NAME, i + 1, row);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  }
  
  /**
   * Map sheet row to user object
   * @param {Array} row - Sheet row data
   * @returns {Object} User object
   */
  static mapRowToUser(row) {
    return {
      id: row[this.COLUMNS.EMP_ID],
      empId: row[this.COLUMNS.EMP_ID],
      fullNameEn: row[this.COLUMNS.FULL_NAME_EN],
      fullNameTh: row[this.COLUMNS.FULL_NAME_TH],
      email: row[this.COLUMNS.EMAIL],
      role: row[this.COLUMNS.ROLE],
      status: row[this.COLUMNS.USER_STATUS],
      passwordHash: row[this.COLUMNS.PASSWORD],
      requirePasswordChange: row[this.COLUMNS.REQUIRE_PASSWORD_CHANGE],
      tempPasswordFlag: row[this.COLUMNS.TEMP_PASSWORD]
    };
  }
  
  /**
   * Validate user data
   * @param {Object} userData - User data to validate
   * @returns {Object} Validation result
   */
  static validateUserData(userData) {
    const required = ['empId', 'email', 'fullNameTh', 'role'];
    return this.validateRequired(userData, required);
  }
  
  /**
   * Create new user record
   * @param {Object} userData - User data
   * @returns {boolean} Success status
   */
  static createUser(userData) {
    const validation = this.validateUserData(userData);
    if (!validation.isValid) {
      return false;
    }
    
    const rowData = [
      userData.empId,
      userData.fullNameEn || '',
      userData.email,  
      userData.fullNameTh,
      1, // Active by default
      userData.passwordHash || '',
      userData.role,
      userData.requirePasswordChange || false,
      userData.tempPasswordFlag || false
    ];
    
    return this.addRecord(this.SHEET_NAME, rowData);
  }
}