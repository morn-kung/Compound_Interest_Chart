/**
 * Data Generator Service - Generate realistic trading data for testing and development
 * Creates sample trading data with realistic win/loss ratios and market conditions
 * @requires Types.js - For type definitions
 * @requires Config.js - For configuration constants
 * @requires TradingService.js - For adding generated trades
 * @created 2025-09-27
 */

// ==========================================
// Helper Functions
// ==========================================

/**
 * Generate UUID for transaction ID
 * @returns {string} UUID string
 */
function createUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get current timestamp in the format used by the system
 * @returns {string} Current timestamp
 */
function getCurrentTimestamp() {
  return new Date().toLocaleString('en-US');
}

// ==========================================
// Trading Data Generation Constants
// ==========================================

/**
 * Configuration for realistic trading data generation
 */
const TRADE_GENERATION_CONFIG = {
  WIN_RATE: 0.6, // 60% win rate
  LOSS_RATE: 0.4, // 40% loss rate
  
  // Profit/Loss ranges (USD)
  PROFIT_RANGE: {
    MIN: 5,
    MAX: 100
  },
  LOSS_RANGE: {
    MIN: -100,
    MAX: -5
  },
  
  // Lot size ranges
  LOT_SIZE_RANGE: {
    MIN: 0.01,
    MAX: 0.5
  },
  
  // Trading notes templates
  TRADE_NOTES: {
    WINS: [
      'เทรดตามแผน สำเร็จ',
      'Breakout เป็นไปตามคาด',
      'Support/Resistance ทำงานดี',
      'Follow trend สำเร็จ',
      'รอ setup ที่ดี จึงเข้า',
      'Risk management ดี',
      'เทรดตาม signal',
      'Market condition เหมาะสม'
    ],
    LOSSES: [
      'Stop loss ทำงาน',
      'Market เปลี่ยนทิศทาง',
      'False breakout',
      'News impact',
      'เข้าเร็วไป รอไม่พอ',
      'Position size ใหญ่ไป',
      'Emotional trading',
      'Market sideways'
    ]
  }
};

// ==========================================
// Core Data Generation Functions
// ==========================================

/**
 * Generate realistic trading data for Account ID 405911362 from 2025-08-03 to yesterday
 * Hardcoded to continue from existing data in Trading_Journal
 * @returns {APIResponse} Result of data generation
 */
function generateTradingDataToYesterday() {
  try {
    // Hardcoded values based on existing data - bypassing validation due to type mismatch
    const accountId = "405911362";
    const startDate = new Date("2025-08-03"); // Day after last trade (2025-08-02)
    const lastBalance = 1005.5; // From last trade record
    
    // End date is yesterday
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1);

    console.log(`Generating data from ${startDate.toISOString().substr(0, 10)} to ${endDate.toISOString().substr(0, 10)}`);

    // If start date is after end date, no data to generate
    if (startDate > endDate) {
      return createJSONResponse('success', 'ไม่มีวันที่ต้อง generate ข้อมูล (ข้อมูลครบแล้ว)', {
        accountId: accountId,
        startDate: startDate.toISOString().substr(0, 10),
        endDate: endDate.toISOString().substr(0, 10),
        daysToGenerate: 0,
        tradesGenerated: 0
      });
    }

    // Generate trades for each day
    const generatedTrades = [];
    const currentDate = new Date(startDate);
    let currentBalance = lastBalance;

    while (currentDate <= endDate) {
      // Skip weekends (optional - remove if you want weekend trading)
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        
        // Generate 1-3 trades per day randomly
        const tradesPerDay = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < tradesPerDay; i++) {
          const trade = generateSingleTrade(accountId, currentBalance, currentDate);
          if (trade) {
            generatedTrades.push(trade);
            currentBalance = trade.endBalance;
          }
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`Generated ${generatedTrades.length} trades for ${accountId}`);

    // Add all generated trades to the system using direct sheet insertion
    const addResult = addGeneratedTradesToSystemDirect(generatedTrades);

    return createJSONResponse('success', `สร้างข้อมูลเทรดสำเร็จ ${generatedTrades.length} รายการ`, {
      accountId: accountId,
      startDate: startDate.toISOString().substr(0, 10),
      endDate: endDate.toISOString().substr(0, 10),
      daysGenerated: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1,
      tradesGenerated: generatedTrades.length,
      finalBalance: currentBalance,
      addResult: addResult
    });

  } catch (error) {
    logError('generateTradingDataToYesterday', error, { accountId: "405911362" });
    return createJSONResponse('error', 'เกิดข้อผิดพลาดในการสร้างข้อมูล: ' + error.toString());
  }
}

/**
 * Generate a single realistic trade record
 * @param {string} accountId - Account ID
 * @param {number} currentBalance - Current account balance
 * @param {Date} tradeDate - Date for the trade
 * @returns {Object} Generated trade object
 */
function generateSingleTrade(accountId, currentBalance, tradeDate) {
  try {
    // Determine if this trade is a win or loss based on win rate
    const isWin = Math.random() < TRADE_GENERATION_CONFIG.WIN_RATE;
    
    // Generate profit/loss amount
    let dailyProfit;
    if (isWin) {
      dailyProfit = Math.random() * 
        (TRADE_GENERATION_CONFIG.PROFIT_RANGE.MAX - TRADE_GENERATION_CONFIG.PROFIT_RANGE.MIN) + 
        TRADE_GENERATION_CONFIG.PROFIT_RANGE.MIN;
      dailyProfit = Math.round(dailyProfit * 100) / 100; // Round to 2 decimal places
    } else {
      dailyProfit = Math.random() * 
        (TRADE_GENERATION_CONFIG.LOSS_RANGE.MAX - TRADE_GENERATION_CONFIG.LOSS_RANGE.MIN) + 
        TRADE_GENERATION_CONFIG.LOSS_RANGE.MIN;
      dailyProfit = Math.round(dailyProfit * 100) / 100; // Round to 2 decimal places
    }

    // Generate lot size
    const lotSize = Math.random() * 
      (TRADE_GENERATION_CONFIG.LOT_SIZE_RANGE.MAX - TRADE_GENERATION_CONFIG.LOT_SIZE_RANGE.MIN) + 
      TRADE_GENERATION_CONFIG.LOT_SIZE_RANGE.MIN;
    const roundedLotSize = Math.round(lotSize * 100) / 100;

    // Calculate end balance
    const endBalance = currentBalance + dailyProfit;

    // Select random asset (1 or 2 based on your data)
    const assetId = Math.random() < 0.5 ? '1' : '2';

    // Select appropriate note
    const notesArray = isWin ? 
      TRADE_GENERATION_CONFIG.TRADE_NOTES.WINS : 
      TRADE_GENERATION_CONFIG.TRADE_NOTES.LOSSES;
    const notes = notesArray[Math.floor(Math.random() * notesArray.length)];

    // Generate realistic timestamp (random time during market hours)
    const timestamp = generateRealisticTimestamp(tradeDate);

    return {
      accountId: accountId,
      assetId: assetId,
      startBalance: currentBalance,
      dailyProfit: dailyProfit,
      endBalance: endBalance,
      lotSize: roundedLotSize,
      notes: notes,
      tradeDate: tradeDate.toISOString().substr(0, 10),
      timestamp: timestamp,
      isWin: isWin
    };

  } catch (error) {
    logError('generateSingleTrade', error, { accountId, currentBalance, tradeDate });
    return null;
  }
}

/**
 * Generate realistic timestamp during trading hours
 * @param {Date} date - Base date for the timestamp
 * @returns {string} Formatted timestamp string
 */
function generateRealisticTimestamp(date) {
  // Generate random time between 9 AM and 5 PM (trading hours)
  const startHour = 9;
  const endHour = 17;
  const randomHour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
  const randomMinute = Math.floor(Math.random() * 60);
  const randomSecond = Math.floor(Math.random() * 60);

  const timestamp = new Date(date);
  timestamp.setHours(randomHour, randomMinute, randomSecond);

  return timestamp.toLocaleString('en-US');
}

/**
 * Add generated trades directly to sheet (bypassing validation)
 * @param {Object[]} generatedTrades - Array of generated trade objects
 * @returns {Object} Result of adding trades to system
 */
function addGeneratedTradesToSystemDirect(generatedTrades) {
  try {
    console.log(`Adding ${generatedTrades.length} trades directly to sheet...`);
    
    const sheet = getSheet(CONFIG.SHEETS.TRADING_JOURNAL);
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < generatedTrades.length; i++) {
      const trade = generatedTrades[i];
      
      try {
        // Generate UUID and timestamp
        const transactionId = createUUID();
        const timestamp = getCurrentTimestamp();
        
        // Calculate ending balance
        const endBalance = trade.startBalance + trade.dailyProfit;

        // Prepare data row - matching the exact format of your existing data
        const newRow = [
          transactionId,
          timestamp,
          parseFloat(trade.accountId), // Convert to number to match existing data
          parseFloat(trade.assetId),   // Convert to number to match existing data
          trade.startBalance,
          trade.dailyProfit,
          endBalance,
          trade.lotSize,
          trade.notes,
          trade.tradeDate
        ];

        // Add to sheet
        sheet.appendRow(newRow);
        console.log(`Added trade ${i + 1}/${generatedTrades.length}: ${transactionId} on ${trade.tradeDate}`);

        results.push({
          index: i + 1,
          status: 'success',
          tradeDate: trade.tradeDate,
          profit: trade.dailyProfit,
          isWin: trade.isWin,
          transactionId: transactionId
        });

        successCount++;

      } catch (error) {
        console.error(`Error adding trade ${i + 1}:`, error.toString());
        results.push({
          index: i + 1,
          status: 'error',
          error: error.toString(),
          tradeDate: trade.tradeDate
        });
        errorCount++;
      }
    }

    return {
      total: generatedTrades.length,
      success: successCount,
      errors: errorCount,
      results: results
    };

  } catch (error) {
    console.error('Error in addGeneratedTradesToSystemDirect:', error.toString());
    return {
      total: generatedTrades.length,
      success: 0,
      errors: generatedTrades.length,
      error: error.toString()
    };
  }
}

/**
 * Add generated trades to the system using existing trade functions
 * @param {Object[]} generatedTrades - Array of generated trade objects
 * @returns {Object} Result of adding trades to system
 */
function addGeneratedTradesToSystem(generatedTrades) {
  try {
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < generatedTrades.length; i++) {
      const trade = generatedTrades[i];
      
      try {
        const result = addTrade(
          trade.accountId,
          trade.assetId,
          trade.startBalance,
          trade.dailyProfit,
          trade.lotSize,
          trade.notes,
          trade.tradeDate
        );

        results.push({
          index: i + 1,
          status: result.status,
          tradeDate: trade.tradeDate,
          profit: trade.dailyProfit,
          isWin: trade.isWin
        });

        if (result.status === 'success') {
          successCount++;
        } else {
          errorCount++;
        }

      } catch (error) {
        results.push({
          index: i + 1,
          status: 'error',
          error: error.toString(),
          tradeDate: trade.tradeDate
        });
        errorCount++;
      }
    }

    return {
      total: generatedTrades.length,
      success: successCount,
      errors: errorCount,
      results: results
    };

  } catch (error) {
    logError('addGeneratedTradesToSystem', error, { tradesCount: generatedTrades.length });
    return {
      total: generatedTrades.length,
      success: 0,
      errors: generatedTrades.length,
      error: error.toString()
    };
  }
}

// ==========================================
// Utility Functions for Data Generation
// ==========================================

/**
 * Generate trading data for specific date range
 * @param {string} accountId - Account ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {number} [initialBalance=1000] - Starting balance
 * @returns {APIResponse} Result of data generation
 */
function generateTradingDataForDateRange(accountId, startDate, endDate, initialBalance = 1000) {
  try {
    if (!accountId || !startDate || !endDate) {
      return createJSONResponse('error', 'Account ID, start date, and end date are required');
    }

    if (!validateAccountExists(accountId)) {
      return createJSONResponse('error', 'Invalid account ID');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return createJSONResponse('error', 'Start date must be before end date');
    }

    const generatedTrades = [];
    const currentDate = new Date(start);
    let currentBalance = initialBalance;

    while (currentDate <= end) {
      // Skip weekends
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        
        const tradesPerDay = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < tradesPerDay; i++) {
          const trade = generateSingleTrade(accountId, currentBalance, currentDate);
          if (trade) {
            generatedTrades.push(trade);
            currentBalance = trade.endBalance;
          }
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const addResult = addGeneratedTradesToSystem(generatedTrades);

    return createJSONResponse('success', `สร้างข้อมูลเทรดสำเร็จ ${generatedTrades.length} รายการ`, {
      accountId: accountId,
      startDate: startDate,
      endDate: endDate,
      tradesGenerated: generatedTrades.length,
      initialBalance: initialBalance,
      finalBalance: currentBalance,
      addResult: addResult
    });

  } catch (error) {
    logError('generateTradingDataForDateRange', error, { accountId, startDate, endDate });
    return createJSONResponse('error', 'เกิดข้อผิดพลาดในการสร้างข้อมูล: ' + error.toString());
  }
}

/**
 * Get statistics about win/loss ratio from generated data
 * @param {Object[]} trades - Array of trade objects
 * @returns {Object} Statistics about the trades
 */
function getGeneratedDataStatistics(trades) {
  const totalTrades = trades.length;
  const wins = trades.filter(trade => trade.isWin).length;
  const losses = totalTrades - wins;
  const winRate = totalTrades > 0 ? (wins / totalTrades * 100).toFixed(2) : 0;
  
  const totalProfit = trades.reduce((sum, trade) => sum + trade.dailyProfit, 0);
  const averageProfit = totalTrades > 0 ? (totalProfit / totalTrades).toFixed(2) : 0;

  return {
    totalTrades: totalTrades,
    wins: wins,
    losses: losses,
    winRate: parseFloat(winRate),
    totalProfit: Math.round(totalProfit * 100) / 100,
    averageProfit: parseFloat(averageProfit)
  };
}