/**
 * Asset Service - Handle all asset-related operations
 * Provides functions for asset retrieval, validation, and management
 * @requires Types.js - For type definitions
 * @requires Config.js - For configuration constants
 * @created 2025-09-27 (refactored)
 */

/**
 * Get all assets from the Assets sheet
 * @returns {APIResponse} Response with assets data
 *   - data.assets: Asset[] - Array of asset objects
 *   - data.count: number - Number of assets found
 */
function getAssets() {
  try {
    const sheet = getSheet(CONFIG.SHEETS.ASSETS);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) {
      return createJSONResponse('success', 'ไม่พบข้อมูลสินทรัพย์', { assets: [], count: 0 });
    }
    
    const headers = ['Asset ID', 'ชื่อสินทรัพย์', 'ประเภท', 'หมายเหตุ'];
    const assets = convertSheetDataToJSON(values, headers);
    
    console.log(`Retrieved ${assets.length} assets`);
    return createJSONResponse('success', CONFIG.MESSAGES.DATA_RETRIEVED_SUCCESS, {
      assets: assets,
      count: assets.length
    });
    
  } catch (error) {
    logError('getAssets', error);
    return createJSONResponse('error', error.toString());
  }
}

/**
 * Get specific asset by ID
 * @param {string} assetId - Asset ID to retrieve
 * @returns {APIResponse} Response with asset data
 *   - data.asset: Asset - Asset object if found
 */
function getAssetById(assetId) {
  try {
    if (isEmpty(assetId)) {
      return createJSONResponse('error', 'Asset ID is required');
    }
    
    const assetsResponse = getAssets();
    if (assetsResponse.status === 'error') {
      return assetsResponse;
    }
    
    const asset = assetsResponse.assets.find(ast => ast['Asset ID'] === assetId);
    
    if (!asset) {
      return createJSONResponse('error', CONFIG.MESSAGES.INVALID_ASSET);
    }
    
    return createJSONResponse('success', 'พบข้อมูลสินทรัพย์', { asset: asset });
    
  } catch (error) {
    logError('getAssetById', error, { assetId });
    return createJSONResponse('error', error.toString());
  }
}

/**
 * Validate if asset exists
 * @param {string} assetId - Asset ID to validate
 * @returns {boolean} True if asset exists
 */
function validateAssetExists(assetId) {
  try {
    const result = getAssetById(assetId);
    return result.status === 'success';
  } catch (error) {
    logError('validateAssetExists', error, { assetId });
    return false;
  }
}

/**
 * Get assets filtered by type (Crypto, Forex, etc.)
 * @param {string} assetType - Type of asset to filter by
 * @returns {APIResponse} Response with filtered assets
 *   - data.assets: Asset[] - Array of filtered asset objects
 *   - data.count: number - Number of assets found
 *   - data.type: string - Filter type applied
 */
function getAssetsByType(assetType) {
  try {
    const assetsResponse = getAssets();
    if (assetsResponse.status === 'error') {
      return assetsResponse;
    }
    
    const filteredAssets = assetsResponse.assets.filter(asset => 
      asset['ประเภท'].toLowerCase() === assetType.toLowerCase()
    );
    
    return createJSONResponse('success', `พบสินทรัพย์ประเภท ${assetType}`, {
      assets: filteredAssets,
      count: filteredAssets.length,
      type: assetType
    });
    
  } catch (error) {
    logError('getAssetsByType', error, { assetType });
    return createJSONResponse('error', error.toString());
  }
}

/**
 * Get asset statistics (trading frequency, profit/loss by asset)
 * @param {string} assetId - Optional asset ID to get specific stats
 * @returns {Object} Response with asset statistics
 */
function getAssetStatistics(assetId = null) {
  try {
    // Get trading history for all trades or specific asset
    const sheet = getSheet(CONFIG.SHEETS.TRADING_JOURNAL);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) {
      return createJSONResponse('success', 'ไม่พบข้อมูลการเทรด', { statistics: [] });
    }
    
    const headers = ['Transaction_ID', 'Timestamp', 'Account ID', 'Asset ID', 
                    'เงินต้นเริ่มต้นวัน (USD)', 'กำไร/ขาดทุนรายวัน (USD)', 
                    'เงินรวมสิ้นวัน (USD)', 'Lot Size', 'หมายเหตุ'];
    const trades = convertSheetDataToJSON(values, headers);
    
    // Filter by asset if specified
    const filteredTrades = assetId ? 
      trades.filter(trade => trade['Asset ID'] === assetId) : trades;
    
    // Calculate statistics by asset
    const assetStats = {};
    
    filteredTrades.forEach(trade => {
      const tradeAssetId = trade['Asset ID'];
      const profit = safeParseFloat(trade['กำไร/ขาดทุนรายวัน (USD)']);
      const lotSize = safeParseFloat(trade['Lot Size']);
      
      if (!assetStats[tradeAssetId]) {
        assetStats[tradeAssetId] = {
          assetId: tradeAssetId,
          totalTrades: 0,
          totalProfit: 0,
          totalLotSize: 0,
          profitableTrades: 0,
          lossTrades: 0,
          winRate: 0,
          averageProfit: 0
        };
      }
      
      const stats = assetStats[tradeAssetId];
      stats.totalTrades++;
      stats.totalProfit += profit;
      stats.totalLotSize += lotSize;
      
      if (profit > 0) {
        stats.profitableTrades++;
      } else if (profit < 0) {
        stats.lossTrades++;
      }
    });
    
    // Calculate derived statistics
    Object.values(assetStats).forEach(stats => {
      if (stats.totalTrades > 0) {
        stats.winRate = (stats.profitableTrades / stats.totalTrades) * 100;
        stats.averageProfit = stats.totalProfit / stats.totalTrades;
      }
    });
    
    // Get asset details for each statistic
    const assetsResponse = getAssets();
    if (assetsResponse.status === 'success') {
      Object.values(assetStats).forEach(stats => {
        const asset = assetsResponse.assets.find(a => a['Asset ID'] === stats.assetId);
        if (asset) {
          stats.assetName = asset['ชื่อสินทรัพย์'];
          stats.assetType = asset['ประเภท'];
        }
      });
    }
    
    const statisticsArray = Object.values(assetStats);
    
    return createJSONResponse('success', 'คำนวณสถิติสินทรัพย์เรียบร้อย', {
      statistics: statisticsArray,
      count: statisticsArray.length,
      assetId: assetId
    });
    
  } catch (error) {
    logError('getAssetStatistics', error, { assetId });
    return createJSONResponse('error', error.toString());
  }
}

/**
 * Get popular assets (most traded)
 * @param {number} limit - Number of top assets to return (default: 5)
 * @returns {Object} Response with popular assets
 */
function getPopularAssets(limit = 5) {
  try {
    const statsResponse = getAssetStatistics();
    if (statsResponse.status === 'error') {
      return statsResponse;
    }
    
    // Sort by total trades and take top N
    const popularAssets = statsResponse.statistics
      .sort((a, b) => b.totalTrades - a.totalTrades)
      .slice(0, limit);
    
    return createJSONResponse('success', `สินทรัพย์ยอดนิยม ${limit} อันดับแรก`, {
      assets: popularAssets,
      count: popularAssets.length,
      limit: limit
    });
    
  } catch (error) {
    logError('getPopularAssets', error, { limit });
    return createJSONResponse('error', error.toString());
  }
}