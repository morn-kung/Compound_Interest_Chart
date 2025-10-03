/**
 * TradingModel - Trading data access layer
 * Handles all trading-related database operations
 * @requires BaseModel - For common database operations
 * @created 2025-10-03
 */

/**
 * Trading Model Class
 * Provides data access methods for trading operations
 */
class TradingModel extends BaseModel {
  
  static get SHEET_NAME() {
    return CONFIG.SHEETS.TRADING_JOURNAL;
  }
  
  static get HEADERS() {
    return [
      'Transaction_ID',
      'Timestamp', 
      'Account_ID',
      'Asset_ID',
      'เงินต้นเริ่มต้นวัน_USD',
      'กำไร_ขาดทุนรายวัน_USD',
      'เงินรวมสิ้นวัน_USD',
      'Lot_Size',
      'หมายเหตุ',
      'Trade_Date'
    ];
  }
  
  /**
   * Get all trades for a specific account
   * @param {string} accountId - Account ID
   * @returns {Array<Object>} Array of trade records
   */
  static getTradesByAccount(accountId) {
    return this.findAllByField(
      this.SHEET_NAME,
      'Account_ID',
      accountId,
      this.HEADERS
    );
  }
  
  /**
   * Get recent trades across all accounts or specific account
   * @param {number} limit - Number of recent trades to return
   * @param {string|null} accountId - Optional account ID filter
   * @returns {Array<Object>} Array of recent trade records
   */
  static getRecentTrades(limit = 10, accountId = null) {
    const values = this.getSheetData(this.SHEET_NAME);
    if (values.length <= 1) return [];
    
    // Convert to objects and sort by timestamp (most recent first)
    const allTrades = this.convertToObjects(values, this.HEADERS);
    
    // Filter by account if specified
    let filteredTrades = accountId 
      ? allTrades.filter(trade => String(trade.Account_ID) === String(accountId))
      : allTrades;
    
    // Sort by timestamp descending (most recent first)
    filteredTrades.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
    
    // Apply limit
    return filteredTrades.slice(0, limit);
  }
  
  /**
   * Find last trade record for a specific account
   * @param {string} accountId - Account ID
   * @returns {Object|null} Last trade record or null
   */
  static getLastTradeByAccount(accountId) {
    const accountTrades = this.getTradesByAccount(accountId);
    if (accountTrades.length === 0) return null;
    
    // Sort by timestamp descending and return first (most recent)
    accountTrades.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
    return accountTrades[0];
  }
  
  /**
   * Add new trade record
   * @param {Object} tradeData - Trade data object
   * @returns {Object} Result with success status and trade ID
   */
  static addTrade(tradeData) {
    try {
      const transactionId = this.generateId();
      const timestamp = this.getCurrentTimestamp();
      const endBalance = tradeData.startBalance + tradeData.dailyProfit;
      
      const rowData = [
        transactionId,
        timestamp,
        tradeData.accountId,
        tradeData.assetId,
        tradeData.startBalance,
        tradeData.dailyProfit,
        endBalance,
        tradeData.lotSize,
        tradeData.notes || '',
        tradeData.tradeDate || new Date().toISOString().split('T')[0] // YYYY-MM-DD
      ];
      
      const success = this.addRecord(this.SHEET_NAME, rowData);
      
      return {
        success: success,
        transactionId: success ? transactionId : null,
        endBalance: success ? endBalance : null,
        timestamp: success ? timestamp : null
      };
      
    } catch (error) {
      console.error('Error adding trade:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get trading statistics for an account
   * @param {string} accountId - Account ID
   * @returns {Object} Trading statistics
   */
  static getTradingStatistics(accountId) {
    const trades = this.getTradesByAccount(accountId);
    
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        totalProfit: 0,
        averageProfit: 0,
        winRate: 0,
        profitableTrades: 0,
        lossTrades: 0,
        breakEvenTrades: 0,
        largestWin: 0,
        largestLoss: 0,
        totalVolume: 0
      };
    }
    
    let totalProfit = 0;
    let profitableTrades = 0;
    let lossTrades = 0;
    let breakEvenTrades = 0;
    let largestWin = 0;
    let largestLoss = 0;
    let totalVolume = 0;
    
    trades.forEach(trade => {
      const profit = parseFloat(trade['กำไร_ขาดทุนรายวัน_USD']) || 0;
      const lotSize = parseFloat(trade.Lot_Size) || 0;
      
      totalProfit += profit;
      totalVolume += lotSize;
      
      if (profit > 0) {
        profitableTrades++;
        if (profit > largestWin) largestWin = profit;
      } else if (profit < 0) {
        lossTrades++;
        if (profit < largestLoss) largestLoss = profit;
      } else {
        breakEvenTrades++;
      }
    });
    
    return {
      totalTrades: trades.length,
      totalProfit: totalProfit,
      averageProfit: trades.length > 0 ? totalProfit / trades.length : 0,
      winRate: trades.length > 0 ? (profitableTrades / trades.length) * 100 : 0,
      profitableTrades: profitableTrades,
      lossTrades: lossTrades,
      breakEvenTrades: breakEvenTrades,
      largestWin: largestWin,
      largestLoss: largestLoss,
      totalVolume: totalVolume
    };
  }
  
  /**
   * Get trades by date range
   * @param {string} accountId - Account ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Array<Object>} Array of trade records in date range
   */
  static getTradesByDateRange(accountId, startDate, endDate) {
    const accountTrades = this.getTradesByAccount(accountId);
    
    return accountTrades.filter(trade => {
      const tradeDate = trade.Trade_Date;
      return tradeDate >= startDate && tradeDate <= endDate;
    });
  }
  
  /**
   * Validate trade data
   * @param {Object} tradeData - Trade data to validate
   * @returns {Object} Validation result
   */
  static validateTradeData(tradeData) {
    const required = ['accountId', 'assetId', 'startBalance', 'dailyProfit', 'lotSize'];
    const validation = this.validateRequired(tradeData, required);
    
    if (!validation.isValid) {
      return validation;
    }
    
    // Additional business rule validations
    const errors = [];
    
    if (parseFloat(tradeData.startBalance) <= 0) {
      errors.push('Start balance must be greater than 0');
    }
    
    if (parseFloat(tradeData.lotSize) <= 0) {
      errors.push('Lot size must be greater than 0');
    }
    
    // Validate trade date format if provided
    if (tradeData.tradeDate && !/^\d{4}-\d{2}-\d{2}$/.test(tradeData.tradeDate)) {
      errors.push('Trade date must be in YYYY-MM-DD format');
    }
    
    return {
      isValid: errors.length === 0,
      missing: errors
    };
  }
  
  /**
   * Delete trade record
   * @param {string} transactionId - Transaction ID to delete
   * @returns {boolean} Success status
   */
  static deleteTrade(transactionId) {
    try {
      const values = this.getSheetData(this.SHEET_NAME);
      const sheet = this.getSheet(this.SHEET_NAME);
      
      for (let i = 1; i < values.length; i++) {
        if (values[i][0] === transactionId) { // Transaction_ID is first column
          sheet.deleteRow(i + 1);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting trade:', error);
      return false;
    }
  }
}