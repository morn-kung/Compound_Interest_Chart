/**
 * Test Functions for Data Generator Service
 * Functions to test and demonstrate the data generation capabilities
 * @requires DataGeneratorService.js
 * @created 2025-09-27
 */

/**
 * Test generating trading data to yesterday for account 405911362
 * This function can be run directly in GAS editor for testing
 */
function testGenerateTradingData() {
  try {
    console.log('Starting trading data generation test...');
    
    const accountId = '405911362'; // Your test account
    const result = generateTradingDataToYesterday(accountId);
    
    console.log('Generation Result:', result);
    
    if (result.status === 'success') {
      console.log(`✅ Success: Generated ${result.tradesGenerated} trades`);
      console.log(`📊 Date range: ${result.startDate} to ${result.endDate}`);
      console.log(`💰 Final balance: ${result.finalBalance}`);
      
      // Get updated trading history to verify
      const historyResult = getTradingHistory(accountId);
      if (historyResult.status === 'success') {
        console.log(`📈 Total trades in system: ${historyResult.count}`);
        
        // Show last 5 trades
        const recentTrades = historyResult.trades.slice(0, 5);
        console.log('Recent trades:', recentTrades);
      }
    } else {
      console.log('❌ Error:', result.message);
    }
    
    return result;
    
  } catch (error) {
    console.error('Test failed:', error);
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Test generating trading data for a specific date range
 */
function testGenerateTradingDataForRange() {
  try {
    const accountId = '405911362';
    const startDate = '2025-08-03'; // Start from after your existing data
    const endDate = '2025-08-10';   // Generate a week's worth of data
    const initialBalance = 1005.5;  // Start from your last balance
    
    console.log(`Generating trading data for ${accountId} from ${startDate} to ${endDate}`);
    
    const result = generateTradingDataForDateRange(accountId, startDate, endDate, initialBalance);
    
    console.log('Range Generation Result:', result);
    
    return result;
    
  } catch (error) {
    console.error('Range test failed:', error);
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Test the realistic trading patterns and win rate
 */
function testTradingPatterns() {
  try {
    console.log('Testing trading pattern generation...');
    
    // Generate sample trades to analyze patterns
    const sampleTrades = [];
    const testAccountId = '405911362';
    const testDate = new Date('2025-08-15');
    let testBalance = 1000;
    
    // Generate 100 sample trades to test win rate
    for (let i = 0; i < 100; i++) {
      const trade = generateSingleTrade(testAccountId, testBalance, testDate);
      if (trade) {
        sampleTrades.push(trade);
        testBalance = trade.endBalance;
      }
    }
    
    // Calculate statistics
    const stats = getGeneratedDataStatistics(sampleTrades);
    
    console.log('📊 Trading Pattern Statistics:');
    console.log(`Total trades: ${stats.totalTrades}`);
    console.log(`Wins: ${stats.wins} (${stats.winRate}%)`);
    console.log(`Losses: ${stats.losses} (${(100 - stats.winRate).toFixed(2)}%)`);
    console.log(`Total profit: $${stats.totalProfit}`);
    console.log(`Average profit per trade: $${stats.averageProfit}`);
    console.log(`Final balance: $${testBalance.toFixed(2)}`);
    
    // Verify win rate is close to target (60%)
    const targetWinRate = 60;
    const actualWinRate = stats.winRate;
    const variance = Math.abs(actualWinRate - targetWinRate);
    
    if (variance <= 10) { // Allow 10% variance
      console.log(`✅ Win rate test PASSED: ${actualWinRate}% (target: ${targetWinRate}%)`);
    } else {
      console.log(`⚠️ Win rate test WARNING: ${actualWinRate}% (target: ${targetWinRate}%, variance: ${variance.toFixed(2)}%)`);
    }
    
    return {
      status: 'success',
      message: 'Pattern test completed',
      statistics: stats,
      sampleSize: sampleTrades.length,
      winRateVariance: variance.toFixed(2)
    };
    
  } catch (error) {
    console.error('Pattern test failed:', error);
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Show current trading data summary for an account
 */
function showCurrentTradingDataSummary(accountId = '405911362') {
  try {
    console.log(`📊 Current Trading Data Summary for Account: ${accountId}`);
    
    // Get trading history
    const historyResult = getTradingHistory(accountId);
    
    if (historyResult.status === 'success') {
      const trades = historyResult.trades;
      console.log(`Total trades: ${trades.length}`);
      
      if (trades.length > 0) {
        // Find date range
        const dates = trades.map(t => new Date(t['Trade Date']));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        
        console.log(`Date range: ${minDate.toISOString().substr(0, 10)} to ${maxDate.toISOString().substr(0, 10)}`);
        
        // Calculate basic statistics
        let totalProfit = 0;
        let wins = 0;
        let losses = 0;
        
        trades.forEach(trade => {
          const profit = parseFloat(trade['กำไร/ขาดทุนรายวัน (USD)']);
          totalProfit += profit;
          if (profit > 0) wins++;
          else if (profit < 0) losses++;
        });
        
        const winRate = trades.length > 0 ? (wins / trades.length * 100).toFixed(2) : 0;
        
        console.log(`Win Rate: ${wins}/${trades.length} (${winRate}%)`);
        console.log(`Total P&L: $${totalProfit.toFixed(2)}`);
        
        // Show last trade
        const lastTrade = trades[0]; // Assuming sorted by newest first
        console.log('Last Trade:', {
          date: lastTrade['Trade Date'],
          asset: lastTrade['Asset ID'],
          profit: lastTrade['กำไร/ขาดทุนรายวัน (USD)'],
          balance: lastTrade['เงินรวมสิ้นวัน (USD)'],
          notes: lastTrade['หมายเหตุ']
        });
      }
    } else {
      console.log('❌ Failed to get trading history:', historyResult.message);
    }
    
    return historyResult;
    
  } catch (error) {
    console.error('Summary failed:', error);
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Quick setup function to generate data and show results
 */
function quickSetupTradingData() {
  try {
    console.log('🚀 Quick Setup: Generating Trading Data...\n');
    
    // Show current state
    console.log('1. Current Data Summary:');
    showCurrentTradingDataSummary();
    
    console.log('\n2. Generating new data to yesterday...');
    const result = testGenerateTradingData();
    
    console.log('\n3. Updated Data Summary:');
    showCurrentTradingDataSummary();
    
    console.log('\n4. Testing trading patterns...');
    testTradingPatterns();
    
    console.log('\n✅ Quick setup completed!');
    
    return result;
    
  } catch (error) {
    console.error('Quick setup failed:', error);
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Clean up test data (use with caution!)
 * This function can delete trading data - use only for testing
 */
function cleanupTestData(accountId = '405911362', confirmDelete = false) {
  if (!confirmDelete) {
    console.log('⚠️ This function will delete trading data!');
    console.log('To confirm, call: cleanupTestData("' + accountId + '", true)');
    return { status: 'warning', message: 'Deletion not confirmed' };
  }
  
  try {
    console.log(`🗑️ Cleaning up test data for account: ${accountId}`);
    
    // This would require implementation of a delete function
    // For now, just return a message
    console.log('⚠️ Delete function not implemented for safety');
    console.log('Manually delete test data from Google Sheets if needed');
    
    return { 
      status: 'info', 
      message: 'Delete function not implemented - clean up manually from Google Sheets'
    };
    
  } catch (error) {
    console.error('Cleanup failed:', error);
    return { status: 'error', message: error.toString() };
  }
}