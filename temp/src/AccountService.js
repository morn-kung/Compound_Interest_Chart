/**
 * Account Service - Handle all account-related operations
 * Provides functions for account retrieval, validation, and statistics
 */

/**
 * Get all accounts from the Accounts sheet
 * @returns {Object} Response with accounts data
 */
function getAccounts() {
  try {
    const sheet = getSheet(CONFIG.SHEETS.ACCOUNTS);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) {
      return createJSONResponse('success', 'ไม่พบข้อมูลบัญชี', { accounts: [], count: 0 });
    }
    
    const headers = ['Account ID', 'ชื่อบัญชี', 'ชื่อผู้ใช้/เจ้าของ', 'เงินต้นเริ่มต้น (USD)'];
    const accounts = convertSheetDataToJSON(values, headers);
    
    console.log(`Retrieved ${accounts.length} accounts`);
    return createJSONResponse('success', CONFIG.MESSAGES.DATA_RETRIEVED_SUCCESS, {
      accounts: accounts,
      count: accounts.length
    });
    
  } catch (error) {
    logError('getAccounts', error);
    return createJSONResponse('error', error.toString());
  }
}

/**
 * Get specific account by ID
 * @param {string} accountId - Account ID to retrieve
 * @returns {Object} Response with account data
 */
function getAccountById(accountId) {
  try {
    if (isEmpty(accountId)) {
      return createJSONResponse('error', 'Account ID is required');
    }
    
    const accountsResponse = getAccounts();
    if (accountsResponse.status === 'error') {
      return accountsResponse;
    }
    
    const account = accountsResponse.accounts.find(acc => acc['Account ID'] === accountId);
    
    if (!account) {
      return createJSONResponse('error', CONFIG.MESSAGES.INVALID_ACCOUNT);
    }
    
    return createJSONResponse('success', 'พบข้อมูลบัญชี', { account: account });
    
  } catch (error) {
    logError('getAccountById', error, { accountId });
    return createJSONResponse('error', error.toString());
  }
}

/**
 * Validate if account exists
 * @param {string} accountId - Account ID to validate
 * @returns {boolean} True if account exists
 */
function validateAccountExists(accountId) {
  try {
    const result = getAccountById(accountId);
    return result.status === 'success';
  } catch (error) {
    logError('validateAccountExists', error, { accountId });
    return false;
  }
}

/**
 * Get account summary with trading statistics
 * @param {string} accountId - Account ID
 * @returns {Object} Account summary with statistics
 */
function getAccountSummary(accountId) {
  try {
    const accountResult = getAccountById(accountId);
    if (accountResult.status === 'error') {
      return accountResult;
    }
    
    const account = accountResult.account;
    const tradingHistory = getTradingHistory(accountId);
    
    let summary = {
      accountInfo: account,
      statistics: {
        totalTrades: 0,
        totalProfit: 0,
        currentBalance: safeParseFloat(account['เงินต้นเริ่มต้น (USD)']),
        winRate: 0,
        profitableTrades: 0,
        lossTrades: 0
      }
    };
    
    if (tradingHistory.status === 'success' && tradingHistory.trades.length > 0) {
      const trades = tradingHistory.trades;
      summary.statistics.totalTrades = trades.length;
      
      trades.forEach(trade => {
        const profit = safeParseFloat(trade['กำไร/ขาดทุนรายวัน (USD)']);
        summary.statistics.totalProfit += profit;
        
        if (profit > 0) {
          summary.statistics.profitableTrades++;
        } else if (profit < 0) {
          summary.statistics.lossTrades++;
        }
      });
      
      // Calculate current balance (initial + total profit)
      summary.statistics.currentBalance = safeParseFloat(account['เงินต้นเริ่มต้น (USD)']) + summary.statistics.totalProfit;
      
      // Calculate win rate
      if (summary.statistics.totalTrades > 0) {
        summary.statistics.winRate = (summary.statistics.profitableTrades / summary.statistics.totalTrades) * 100;
      }
      
      // Get the latest balance from the most recent trade
      const latestTrade = trades[trades.length - 1];
      if (latestTrade && latestTrade['เงินรวมสิ้นวัน (USD)']) {
        summary.statistics.currentBalance = safeParseFloat(latestTrade['เงินรวมสิ้นวัน (USD)']);
      }
    }
    
    return createJSONResponse('success', 'สรุปข้อมูลบัญชีเรียบร้อย', summary);
    
  } catch (error) {
    logError('getAccountSummary', error, { accountId });
    return createJSONResponse('error', error.toString());
  }
}

/**
 * Get all accounts with their basic statistics
 * @returns {Object} Response with accounts and their statistics
 */
function getAccountsWithStats() {
  try {
    const accountsResponse = getAccounts();
    if (accountsResponse.status === 'error') {
      return accountsResponse;
    }
    
    const accountsWithStats = accountsResponse.accounts.map(account => {
      const accountId = account['Account ID'];
      const summary = getAccountSummary(accountId);
      
      return {
        ...account,
        statistics: summary.status === 'success' ? summary.statistics : null
      };
    });
    
    return createJSONResponse('success', 'ดึงข้อมูลบัญชีพร้อมสถิติเรียบร้อย', {
      accounts: accountsWithStats,
      count: accountsWithStats.length
    });
    
  } catch (error) {
    logError('getAccountsWithStats', error);
    return createJSONResponse('error', error.toString());
  }
}