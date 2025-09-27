/**
 * Trading Service
 * Handles all trading-related operations
 */

const TradingService = {
  
  /**
   * Get trading history for a specific account
   * @param {string} accountId - Account ID to get history for
   * @returns {GoogleAppsScript.Content.TextOutput} JSON response containing trading history
   */
  getTradingHistory: function(accountId) {
    try {
      Logger.log(`TradingService.getTradingHistory: Getting history for account ${accountId}`);
      
      if (!accountId) {
        return createErrorResponse(CONFIG.MESSAGES.ERROR.ACCOUNT_ID_REQUIRED);
      }
      
      const trades = this.getTradingHistoryData(accountId);
      
      Logger.log(`TradingService.getTradingHistory: Retrieved ${trades.length} trades for account ${accountId}`);
      
      return createSuccessResponse(
        CONFIG.MESSAGES.SUCCESS.DATA_RETRIEVED,
        { 
          trades: trades,
          accountId: accountId,
          count: trades.length
        }
      );
      
    } catch (error) {
      logError('TradingService.getTradingHistory', error, { accountId });
      return createErrorResponse(
        `${CONFIG.MESSAGES.ERROR.DATA_RETRIEVAL_FAILED}: ${error.message}`
      );
    }
  },

  /**
   * Get trading history data (internal function)
   * @param {string} accountId - Account ID
   * @returns {Array} Array of trade objects
   */
  getTradingHistoryData: function(accountId) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.TRADING_JOURNAL);
      if (!sheet) {
        return [];
      }
      
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      if (values.length <= 1) {
        return [];
      }
      
      const headers = values[0];
      const accountIdIndex = headers.indexOf('Account ID');
      
      if (accountIdIndex === -1) {
        Logger.log('TradingService.getTradingHistoryData: Account ID column not found');
        return [];
      }
      
      const trades = [];
      
      // Filter trades by Account ID
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        
        if (row[accountIdIndex] && row[accountIdIndex].toString() === accountId.toString()) {
          const trade = {};
          headers.forEach((header, index) => {
            trade[header] = row[index];
          });
          trades.push(trade);
        }
      }
      
      // Sort by timestamp (newest first)
      return sortByDateDesc(trades, 'Timestamp');
      
    } catch (error) {
      logError('TradingService.getTradingHistoryData', error, { accountId });
      return [];
    }
  },

  /**
   * Add new trade record
   * @param {Object} tradeData - Trade data object
   * @returns {GoogleAppsScript.Content.TextOutput} JSON response
   */
  addTrade: function(tradeData) {
    try {
      Logger.log('TradingService.addTrade: Starting trade addition');
      
      // Validate required fields
      const requiredFields = ['accountId', 'assetId', 'startBalance', 'dailyProfit', 'lotSize'];
      const validation = validateRequiredParams(tradeData, requiredFields);
      
      if (!validation.isValid) {
        return createErrorResponse(
          `Missing required fields: ${validation.missingFields.join(', ')}`
        );
      }
      
      // Validate account and asset exist
      if (!AccountService.validateAccountExists(tradeData.accountId)) {
        return createErrorResponse(`Invalid Account ID: ${tradeData.accountId}`);
      }
      
      if (!AssetService.validateAssetExists(tradeData.assetId)) {
        return createErrorResponse(`Invalid Asset ID: ${tradeData.assetId}`);
      }
      
      const sheet = getSheet(CONFIG.SHEETS.TRADING_JOURNAL);
      if (!sheet) {
        return createErrorResponse(
          `${CONFIG.MESSAGES.ERROR.SHEET_NOT_FOUND}: ${CONFIG.SHEETS.TRADING_JOURNAL}`
        );
      }
      
      // Generate transaction ID and timestamp
      const transactionId = createUUID();
      const timestamp = getCurrentTimestamp();
      
      // Calculate end balance
      const startBalance = safeParseFloat(tradeData.startBalance);
      const dailyProfit = safeParseFloat(tradeData.dailyProfit);
      const endBalance = startBalance + dailyProfit;
      
      // Prepare row data
      const rowData = [
        transactionId,
        timestamp,
        tradeData.accountId,
        tradeData.assetId,
        formatNumber(startBalance),
        formatNumber(dailyProfit),
        formatNumber(endBalance),
        formatNumber(safeParseFloat(tradeData.lotSize)),
        tradeData.notes || ''
      ];
      
      // Add row to sheet
      sheet.appendRow(rowData);
      
      Logger.log(`TradingService.addTrade: Successfully added trade ${transactionId}`);
      
      return createSuccessResponse(
        CONFIG.MESSAGES.SUCCESS.TRADE_SAVED,
        { 
          id: transactionId,
          endBalance: formatNumber(endBalance)
        }
      );
      
    } catch (error) {
      logError('TradingService.addTrade', error, tradeData);
      return createErrorResponse(
        `${CONFIG.MESSAGES.ERROR.TRADE_SAVE_FAILED}: ${error.message}`
      );
    }
  },

  /**
   * Get trading statistics for an account
   * @param {string} accountId - Account ID
   * @returns {Object} Trading statistics
   */
  getTradingStatistics: function(accountId) {
    try {
      const trades = this.getTradingHistoryData(accountId);
      
      if (trades.length === 0) {
        return {
          totalTrades: 0,
          totalPnL: 0,
          winRate: 0,
          winTrades: 0,
          lossTrades: 0,
          avgProfit: 0,
          avgLoss: 0,
          totalVolume: 0
        };
      }
      
      let totalPnL = 0;
      let winTrades = 0;
      let totalWinAmount = 0;
      let totalLossAmount = 0;
      let totalVolume = 0;
      
      trades.forEach(trade => {
        const pnl = safeParseFloat(trade['กำไร/ขาดทุนรายวัน (USD)']);
        const lotSize = safeParseFloat(trade['Lot Size']);
        
        totalPnL += pnl;
        totalVolume += lotSize;
        
        if (pnl > 0) {
          winTrades++;
          totalWinAmount += pnl;
        } else if (pnl < 0) {
          totalLossAmount += Math.abs(pnl);
        }
      });
      
      const lossTrades = trades.length - winTrades;
      const winRate = trades.length > 0 ? (winTrades / trades.length * 100) : 0;
      const avgProfit = winTrades > 0 ? (totalWinAmount / winTrades) : 0;
      const avgLoss = lossTrades > 0 ? (totalLossAmount / lossTrades) : 0;
      
      return {
        totalTrades: trades.length,
        totalPnL: formatNumber(totalPnL),
        winRate: formatNumber(winRate, 1),
        winTrades: winTrades,
        lossTrades: lossTrades,
        avgProfit: formatNumber(avgProfit),
        avgLoss: formatNumber(avgLoss),
        totalVolume: formatNumber(totalVolume, 3)
      };
      
    } catch (error) {
      logError('TradingService.getTradingStatistics', error, { accountId });
      return null;
    }
  },

  /**
   * Get recent trades (last N trades)
   * @param {string} accountId - Account ID
   * @param {number} limit - Number of recent trades to get (default: 10)
   * @returns {Array} Array of recent trades
   */
  getRecentTrades: function(accountId, limit = 10) {
    try {
      const allTrades = this.getTradingHistoryData(accountId);
      return allTrades.slice(0, limit);
    } catch (error) {
      logError('TradingService.getRecentTrades', error, { accountId, limit });
      return [];
    }
  }
  
};