/**
 * Trading Service - Handle all trading-related operations
 * Provides functionality for trade management, statistics, and history
 * @requires Types.js - For JSDoc type definitions
 * @created 2025-09-27 (refactored)
 */

// Trading Journal Headers - Constants for better maintainability
const TRADING_HEADERS = [
  'Transaction_ID', 'Timestamp', 'Account ID', 'Asset ID',
  'เงินต้นเริ่มต้นวัน (USD)', 'กำไร/ขาดทุนรายวัน (USD)',
  'เงินรวมสิ้นวัน (USD)', 'Lot Size', 'หมายเหตุ', 'Trade Date'
];

/**
 * Find the last row for a specific account ID
 * @param {string} accountId - Account ID to search for
 * @returns {TradeRecord|null} Last row data or null if not found
 */
function findLastRowByAccountId(accountId) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.TRADING_JOURNAL);
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      return null; // No data found
    }

    const headers = ['Transaction_ID', 'Timestamp', 'Account ID', 'Asset ID',
      'เงินต้นเริ่มต้นวัน (USD)', 'กำไร/ขาดทุนรายวัน (USD)',
      'เงินรวมสิ้นวัน (USD)', 'Lot Size', 'หมายเหตุ', 'Trade Date'];
    const allTrades = convertSheetDataToJSON(values, headers);

    // Filter trades for specific account
    const accountTrades = allTrades.filter(trade => trade['Account ID'] === accountId);

    if (accountTrades.length === 0) {
      return null; // No data found for this account
    }

    // Sort by Trade Date (newest first)
    accountTrades.sort((a, b) => new Date(b['Trade Date']) - new Date(a['Trade Date']));

    // Return the last row (newest trade)
    return accountTrades[0];

  } catch (error) {
    logError('findLastRowByAccountId', error, { accountId });
    return null;
  }
}

/**
 * Get trading history for a specific account
 * @param {string} accountId - Account ID to get history for
 * @returns {APIResponse} Response with trading history data
 *   - data.trades: TradeRecord[] - Array of trade records
 *   - data.accountId: string - Account ID
 *   - data.count: number - Number of trades found
 */
function getTradingHistory(accountId) {
  try {
    if (isEmpty(accountId)) {
      return createJSONResponse('error', 'Account ID is required');
    }

    // Validate account exists
    if (!validateAccountExists(accountId)) {
      return createJSONResponse('error', CONFIG.MESSAGES.INVALID_ACCOUNT);
    }

    const sheet = getSheet(CONFIG.SHEETS.TRADING_JOURNAL);
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      return createJSONResponse('success', 'ไม่พบประวัติการเทรด', {
        trades: [],
        accountId: accountId,
        count: 0
      });
    }

    const allTrades = convertSheetDataToJSON(values, TRADING_HEADERS);

    // Filter trades for specific account
    const accountTrades = allTrades.filter(trade => trade['Account ID'] === accountId);

    // Sort by timestamp (newest first)
    accountTrades.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));

    console.log(`Retrieved ${accountTrades.length} trades for account ${accountId}`);
    return createJSONResponse('success', CONFIG.MESSAGES.DATA_RETRIEVED_SUCCESS, {
      trades: accountTrades,
      accountId: accountId,
      count: accountTrades.length
    });

  } catch (error) {
    logError('getTradingHistory', error, { accountId });
    return createJSONResponse('error', error.toString());
  }
}

/**
 * Add a new trade record with backdate support
 * @param {string} accountId - Account ID
 * @param {string} assetId - Asset ID
 * @param {number} startBalance - Starting balance for the day (USD)
 * @param {number} dailyProfit - Daily profit/loss (USD)
 * @param {number} lotSize - Lot size used in trading
 * @param {string} [notes=''] - Optional notes for the trade
 * @param {string} [tradeDate=''] - Trade date in YYYY-MM-DD format (defaults to current date)
 * @returns {APIResponse} Response with operation result
 *   - data.id: string - Transaction ID
 *   - data.accountId: string - Account ID
 *   - data.endBalance: number - Calculated end balance
 *   - data.timestamp: string - Creation timestamp
 *   - data.tradeDate: string - Trade date
 */
function addTrade(accountId, assetId, startBalance, dailyProfit, lotSize, notes = '', tradeDate = '') {
  try {
    // Validate required parameters
    const validation = validateRequiredParams(
      { accountId, assetId, startBalance, dailyProfit, lotSize },
      ['accountId', 'assetId', 'startBalance', 'dailyProfit', 'lotSize']
    );

    if (!validation.isValid) {
      return createJSONResponse('error', `${CONFIG.MESSAGES.MISSING_PARAMETERS}: ${validation.missing.join(', ')}`);
    }

    // Validate account and asset exist
    if (!validateAccountExists(accountId)) {
      return createJSONResponse('error', CONFIG.MESSAGES.INVALID_ACCOUNT);
    }

    if (!validateAssetExists(assetId)) {
      return createJSONResponse('error', CONFIG.MESSAGES.INVALID_ASSET);
    }

    // Convert and validate numeric values
    const numericStartBalance = safeParseFloat(startBalance);
    const numericDailyProfit = safeParseFloat(dailyProfit);
    const numericLotSize = safeParseFloat(lotSize);

    if (numericStartBalance <= 0) {
      return createJSONResponse('error', 'เงินต้นเริ่มต้นต้องมากกว่า 0');
    }

    // Use provided trade date or current date
    const finalTradeDate = tradeDate || getCurrentDate();
    
    // Find last row for this account to check for existing data
    const lastRow = findLastRowByAccountId(accountId);
    
    // Check if trade date already exists
    if (lastRow) {
      const sheet = getSheet(CONFIG.SHEETS.TRADING_JOURNAL);
      const values = sheet.getDataRange().getValues();
      
      // Convert sheet data to check for duplicate dates
      const allTrades = convertSheetDataToJSON(values, TRADING_HEADERS);
      
      // Filter trades for specific account and date
      const existingTrade = allTrades.find(trade => 
        trade['Account ID'] === accountId && 
        new Date(trade['Trade Date']).getTime() === new Date(finalTradeDate).getTime()
      );
      
      if (existingTrade) {
        console.log(`Warning: Trade date ${finalTradeDate} already exists for account ${accountId}. Adding new record anyway.`);
        // Note: We're allowing duplicate dates as per user requirement
      }
    }

    // Calculate ending balance
    const endBalance = numericStartBalance + numericDailyProfit;

      // Generate UUID and timestamp
      const transactionId = createUUID();
      const timestamp = getCurrentTimestamp();

      // Prepare data row
    // Prepare data row
    const newRow = [
      transactionId,
      timestamp,
      accountId,
      assetId,
      numericStartBalance,
      numericDailyProfit,
      endBalance,
      numericLotSize,
      sanitizeString(notes),
      finalTradeDate
    ];

    // Add to sheet
    const sheet = getSheet(CONFIG.SHEETS.TRADING_JOURNAL);
    sheet.appendRow(newRow);

    console.log(`Added new trade: ${transactionId} for account ${accountId} on ${finalTradeDate}`);
    return createJSONResponse('success', CONFIG.MESSAGES.TRADE_ADDED_SUCCESS, {
      id: transactionId,
      accountId: accountId,
      assetId: assetId,
      startBalance: numericStartBalance,
      dailyProfit: numericDailyProfit,
      endBalance: endBalance,
      lotSize: numericLotSize,
      timestamp: timestamp,
      tradeDate: finalTradeDate
    });

  } catch (error) {
    logError('addTrade', error, {
      accountId, assetId, startBalance, dailyProfit, lotSize, notes, tradeDate
    });
    return createJSONResponse('error', error.toString());
  }
}

/**
 * Get comprehensive trading statistics for an account
 * @param {string} accountId - Account ID to get statistics for
 * @returns {APIResponse} Response with trading statistics
 *   - data.statistics: TradingStatistics - Comprehensive trading statistics
 *   - data.accountId: string - Account ID
 */
function getTradingStatistics(accountId) {
    try {
      const historyResponse = getTradingHistory(accountId);
      if (historyResponse.status === 'error') {
        return historyResponse;
      }

      const trades = historyResponse.trades;

      if (trades.length === 0) {
        return createJSONResponse('success', 'ไม่พบข้อมูลการเทรด', {
          accountId: accountId,
          statistics: {
            totalTrades: 0,
            totalProfit: 0,
            averageProfit: 0,
            winRate: 0,
            profitableTrades: 0,
            lossTrades: 0,
            breakEvenTrades: 0,
            largestWin: 0,
            largestLoss: 0,
            totalLotSize: 0,
            averageLotSize: 0
          }
        });
      }

      // Calculate statistics
      let totalProfit = 0;
      let profitableTrades = 0;
      let lossTrades = 0;
      let breakEvenTrades = 0;
      let totalLotSize = 0;
      let largestWin = 0;
      let largestLoss = 0;

      trades.forEach(trade => {
        const profit = safeParseFloat(trade['กำไร/ขาดทุนรายวัน (USD)']);
        const lotSize = safeParseFloat(trade['Lot Size']);

        totalProfit += profit;
        totalLotSize += lotSize;

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

      const statistics = {
        totalTrades: trades.length,
        totalProfit: totalProfit,
        averageProfit: totalProfit / trades.length,
        winRate: (profitableTrades / trades.length) * 100,
        profitableTrades: profitableTrades,
        lossTrades: lossTrades,
        breakEvenTrades: breakEvenTrades,
        largestWin: largestWin,
        largestLoss: largestLoss,
        totalLotSize: totalLotSize,
        averageLotSize: totalLotSize / trades.length
      };

      return createJSONResponse('success', 'คำนวณสถิติการเทรดเรียบร้อย', {
        accountId: accountId,
        statistics: statistics
      });

    } catch (error) {
      logError('getTradingStatistics', error, { accountId });
      return createJSONResponse('error', error.toString());
    }
  }

/**
 * Get recent trades across all accounts or filtered by specific account
 * @param {number} [limit=10] - Number of recent trades to return
 * @param {string|null} [accountId=null] - Optional account ID filter
 * @returns {APIResponse} Response with recent trades
 *   - data.trades: TradeRecord[] - Array of recent trade records
 *   - data.count: number - Number of trades returned
 *   - data.limit: number - Applied limit
 *   - data.accountId: string|null - Account filter applied
 */
function getRecentTrades(limit = 10, accountId = null) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.TRADING_JOURNAL);
      const values = sheet.getDataRange().getValues();

      if (values.length <= 1) {
        return createJSONResponse('success', 'ไม่พบข้อมูลการเทรด', { trades: [], count: 0 });
      }

      let allTrades = convertSheetDataToJSON(values, TRADING_HEADERS);

      // Filter by account if specified
      if (accountId) {
        allTrades = allTrades.filter(trade => trade['Account ID'] === accountId);
      }

      // Sort by timestamp (newest first) and limit results
      const recentTrades = allTrades
        .sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp))
        .slice(0, limit);

      return createJSONResponse('success', `ดึงข้อมูลการเทรดล่าสุด ${recentTrades.length} รายการ`, {
        trades: recentTrades,
        count: recentTrades.length,
        limit: limit,
        accountId: accountId
      });

    } catch (error) {
      logError('getRecentTrades', error, { limit, accountId });
      return createJSONResponse('error', error.toString());
    }
  }

/**
 * Add multiple trade records in batch
 * @param {string} tradesDataJSON - JSON string containing array of TradeData objects
 * @param {string} [token] - User authentication token for access control
 * @returns {APIResponse} Response with batch operation results
 *   - data: BatchOperationSummary - Summary of batch operation results
 * 
 * @example
 * // Example tradesDataJSON structure:
 * [
 *   {
 *     "accountId": "ACC001",
 *     "assetId": "BTC",
 *     "startBalance": 1000.0,
 *     "dailyProfit": 50.0,
 *     "lotSize": 0.1,
 *     "notes": "First trade",
 *     "tradeDate": "2025-01-01"
 *   }
 * ]
 */
function addMultipleTrades(tradesDataJSON, token) {
    try {
      // Parse JSON data
      let tradesArray;
      try {
        tradesArray = JSON.parse(tradesDataJSON);
      } catch (parseError) {
        return createJSONResponse('error', 'ข้อมูล JSON ไม่ถูกต้อง: ' + parseError.toString());
      }

      if (!Array.isArray(tradesArray) || tradesArray.length === 0) {
        return createJSONResponse('error', 'ข้อมูลต้องเป็น array และมีรายการอย่างน้อย 1 รายการ');
      }

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      // Process each trade
      for (let i = 0; i < tradesArray.length; i++) {
        const trade = tradesArray[i];

        try {
          // Validate required fields for each trade
          if (!trade.accountId || !trade.assetId || 
              trade.startBalance === undefined || trade.dailyProfit === undefined || 
              trade.lotSize === undefined) {
            results.push({
              index: i + 1,
              status: 'error',
              message: 'Missing required fields in trade data',
              id: null,
              tradeDate: trade.tradeDate || 'N/A',
              accountId: trade.accountId || 'N/A'
            });
            errorCount++;
            continue;
          }

          // Verify user has access to this account (if token provided)
          if (token) {
            const accessResult = verifyAccountAccess(token, trade.accountId);
            if (accessResult.status === 'error') {
              results.push({
                index: i + 1,
                status: 'error',
                message: `Access denied to account ${trade.accountId}`,
                id: null,
                tradeDate: trade.tradeDate || 'N/A',
                accountId: trade.accountId
              });
              errorCount++;
              continue;
            }
          }

          // Call addTrade with all parameters including tradeDate
          const tradeResult = addTrade(
            trade.accountId,
            trade.assetId,
            parseFloat(trade.startBalance || 0),
            parseFloat(trade.dailyProfit || 0),
            parseFloat(trade.lotSize || 0),
            trade.notes || '',
            trade.tradeDate || ''
          );

          results.push({
            index: i + 1,
            status: tradeResult.status,
            message: tradeResult.message,
            id: tradeResult.data?.id || tradeResult.id || null,
            tradeDate: trade.tradeDate || getCurrentDate(),
            accountId: trade.accountId
          });

          if (tradeResult.status === 'success') {
            successCount++;
          } else {
            errorCount++;
          }

        } catch (error) {
          results.push({
            index: i + 1,
            status: 'error',
            message: error.toString(),
            id: null,
            tradeDate: trade.tradeDate || 'N/A',
            accountId: trade.accountId || 'N/A'
          });
          errorCount++;
        }
      }

      // Prepare summary response
      const summary = {
        total: tradesArray.length,
        success: successCount,
        errors: errorCount,
        results: results
      };

      const overallStatus = errorCount === 0 ? 'success' : (successCount > 0 ? 'partial' : 'error');
      const message = errorCount === 0
        ? `บันทึกสำเร็จทั้งหมด ${successCount} รายการ`
        : `บันทึกสำเร็จ ${successCount} รายการ, ผิดพลาด ${errorCount} รายการ`;

      console.log(`Batch trade submission completed: ${successCount}/${tradesArray.length} successful`);
      
      // Add summary information about duplicate dates if any
      const duplicateDates = results.filter(r => r.status === 'success' && r.message && r.message.includes('already exists'));
      if (duplicateDates.length > 0) {
        summary.duplicateDatesCount = duplicateDates.length;
        summary.duplicateDatesMessage = `Found ${duplicateDates.length} trades with existing dates - added anyway as per policy`;
      }
      
      return createJSONResponse(overallStatus, message, summary);

    } catch (error) {
      logError('addMultipleTrades', error, { tradesDataJSON });
      return createJSONResponse('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูลแบบ batch: ' + error.toString());
    }
  }

/**
 * Delete a trade by transaction ID (admin function)
 * @param {string} transactionId - Transaction ID to delete
 * @returns {APIResponse} Response with operation result
 *   - data.deletedId: string - ID of deleted transaction
 * @security Admin access required
 */
function deleteTrade(transactionId) {
    try {
      if (isEmpty(transactionId)) {
        return createJSONResponse('error', 'Transaction ID is required');
      }

      const sheet = getSheet(CONFIG.SHEETS.TRADING_JOURNAL);
      const values = sheet.getDataRange().getValues();

      // Find the row with matching transaction ID
      let rowToDelete = -1;
      for (let i = 1; i < values.length; i++) { // Skip header row
        if (values[i][0] === transactionId) { // Transaction_ID is in column 0
          rowToDelete = i + 1; // Sheet rows are 1-indexed
          break;
        }
      }

      if (rowToDelete === -1) {
        return createJSONResponse('error', 'ไม่พบรายการเทรดที่ระบุ');
      }

      // Delete the row
      sheet.deleteRow(rowToDelete);

      console.log(`Deleted trade: ${transactionId} from row ${rowToDelete}`);
      return createJSONResponse('success', 'ลบรายการเทรดเรียบร้อยแล้ว', {
        deletedId: transactionId
      });

    } catch (error) {
      logError('deleteTrade', error, { transactionId });
      return createJSONResponse('error', error.toString());
    }
  }
