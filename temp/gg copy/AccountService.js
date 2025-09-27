/**
 * Account Service
 * Handles all account-related operations
 */

const AccountService = {
  
  /**
   * Get all accounts from the Accounts sheet
   * @returns {GoogleAppsScript.Content.TextOutput} JSON response containing accounts data
   */
  getAccounts: function() {
    try {
      Logger.log('AccountService.getAccounts: Starting...');
      
      const sheet = getSheet(CONFIG.SHEETS.ACCOUNTS);
      if (!sheet) {
        return createErrorResponse(
          `${CONFIG.MESSAGES.ERROR.SHEET_NOT_FOUND}: ${CONFIG.SHEETS.ACCOUNTS}`
        );
      }
      
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      if (values.length <= 1) {
        Logger.log('AccountService.getAccounts: No accounts found');
        return createSuccessResponse(
          CONFIG.MESSAGES.SUCCESS.DATA_RETRIEVED,
          { accounts: CONFIG.DEFAULTS.EMPTY_ARRAY }
        );
      }
      
      const accounts = convertSheetDataToJSON(values);
      
      Logger.log(`AccountService.getAccounts: Retrieved ${accounts.length} accounts`);
      
      return createSuccessResponse(
        CONFIG.MESSAGES.SUCCESS.DATA_RETRIEVED,
        { 
          accounts: accounts,
          count: accounts.length
        }
      );
      
    } catch (error) {
      logError('AccountService.getAccounts', error);
      return createErrorResponse(
        `${CONFIG.MESSAGES.ERROR.DATA_RETRIEVAL_FAILED}: ${error.message}`
      );
    }
  },

  /**
   * Get account by ID
   * @param {string} accountId - Account ID to search for
   * @returns {Object|null} Account object or null if not found
   */
  getAccountById: function(accountId) {
    try {
      Logger.log(`AccountService.getAccountById: Searching for account ${accountId}`);
      
      const sheet = getSheet(CONFIG.SHEETS.ACCOUNTS);
      if (!sheet) {
        return null;
      }
      
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      if (values.length <= 1) {
        return null;
      }
      
      const accounts = convertSheetDataToJSON(values);
      const account = accounts.find(acc => acc['Account ID'] && acc['Account ID'].toString() === accountId.toString());
      
      if (account) {
        Logger.log(`AccountService.getAccountById: Found account ${accountId}`);
      } else {
        Logger.log(`AccountService.getAccountById: Account ${accountId} not found`);
      }
      
      return account || null;
      
    } catch (error) {
      logError('AccountService.getAccountById', error, { accountId });
      return null;
    }
  },

  /**
   * Validate if account exists
   * @param {string} accountId - Account ID to validate
   * @returns {boolean} True if account exists
   */
  validateAccountExists: function(accountId) {
    if (!accountId) {
      return false;
    }
    
    const account = this.getAccountById(accountId);
    return account !== null;
  },

  /**
   * Get account summary with trading statistics
   * @param {string} accountId - Account ID
   * @returns {Object|null} Account summary or null
   */
  getAccountSummary: function(accountId) {
    try {
      const account = this.getAccountById(accountId);
      if (!account) {
        return null;
      }
      
      // Get trading history for statistics
      const tradingHistory = TradingService.getTradingHistoryData(accountId);
      
      let totalTrades = tradingHistory.length;
      let totalPnL = 0;
      let winTrades = 0;
      let currentBalance = safeParseFloat(account['เงินต้นเริ่มต้น (USD)']);
      
      tradingHistory.forEach(trade => {
        const pnl = safeParseFloat(trade['กำไร/ขาดทุนรายวัน (USD)']);
        totalPnL += pnl;
        if (pnl > 0) winTrades++;
      });
      
      if (tradingHistory.length > 0) {
        const lastTrade = tradingHistory[tradingHistory.length - 1];
        currentBalance = safeParseFloat(lastTrade['เงินรวมสิ้นวัน (USD)'], currentBalance);
      }
      
      const winRate = totalTrades > 0 ? (winTrades / totalTrades * 100) : 0;
      
      return {
        ...account,
        statistics: {
          totalTrades: totalTrades,
          totalPnL: formatNumber(totalPnL),
          currentBalance: formatNumber(currentBalance),
          winRate: formatNumber(winRate, 1),
          winTrades: winTrades,
          lossTrades: totalTrades - winTrades
        }
      };
      
    } catch (error) {
      logError('AccountService.getAccountSummary', error, { accountId });
      return null;
    }
  }
  
};