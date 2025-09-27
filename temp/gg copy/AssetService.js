/**
 * Asset Service
 * Handles all asset-related operations
 */

const AssetService = {
  
  /**
   * Get all assets from the Assets sheet
   * @returns {GoogleAppsScript.Content.TextOutput} JSON response containing assets data
   */
  getAssets: function() {
    try {
      Logger.log('AssetService.getAssets: Starting...');
      
      const sheet = getSheet(CONFIG.SHEETS.ASSETS);
      if (!sheet) {
        return createErrorResponse(
          `${CONFIG.MESSAGES.ERROR.SHEET_NOT_FOUND}: ${CONFIG.SHEETS.ASSETS}`
        );
      }
      
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      if (values.length <= 1) {
        Logger.log('AssetService.getAssets: No assets found');
        return createSuccessResponse(
          CONFIG.MESSAGES.SUCCESS.DATA_RETRIEVED,
          { assets: CONFIG.DEFAULTS.EMPTY_ARRAY }
        );
      }
      
      const assets = convertSheetDataToJSON(values);
      
      Logger.log(`AssetService.getAssets: Retrieved ${assets.length} assets`);
      
      return createSuccessResponse(
        CONFIG.MESSAGES.SUCCESS.DATA_RETRIEVED,
        { 
          assets: assets,
          count: assets.length
        }
      );
      
    } catch (error) {
      logError('AssetService.getAssets', error);
      return createErrorResponse(
        `${CONFIG.MESSAGES.ERROR.DATA_RETRIEVAL_FAILED}: ${error.message}`
      );
    }
  },

  /**
   * Get asset by ID
   * @param {string} assetId - Asset ID to search for
   * @returns {Object|null} Asset object or null if not found
   */
  getAssetById: function(assetId) {
    try {
      Logger.log(`AssetService.getAssetById: Searching for asset ${assetId}`);
      
      const sheet = getSheet(CONFIG.SHEETS.ASSETS);
      if (!sheet) {
        return null;
      }
      
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      if (values.length <= 1) {
        return null;
      }
      
      const assets = convertSheetDataToJSON(values);
      const asset = assets.find(ast => ast['Asset ID'] && ast['Asset ID'].toString() === assetId.toString());
      
      if (asset) {
        Logger.log(`AssetService.getAssetById: Found asset ${assetId}`);
      } else {
        Logger.log(`AssetService.getAssetById: Asset ${assetId} not found`);
      }
      
      return asset || null;
      
    } catch (error) {
      logError('AssetService.getAssetById', error, { assetId });
      return null;
    }
  },

  /**
   * Validate if asset exists
   * @param {string} assetId - Asset ID to validate
   * @returns {boolean} True if asset exists
   */
  validateAssetExists: function(assetId) {
    if (!assetId) {
      return false;
    }
    
    const asset = this.getAssetById(assetId);
    return asset !== null;
  },

  /**
   * Get assets by type
   * @param {string} assetType - Type of assets to retrieve (e.g., 'Crypto', 'Forex')
   * @returns {Array} Array of assets matching the type
   */
  getAssetsByType: function(assetType) {
    try {
      Logger.log(`AssetService.getAssetsByType: Getting assets of type ${assetType}`);
      
      const sheet = getSheet(CONFIG.SHEETS.ASSETS);
      if (!sheet) {
        return [];
      }
      
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      if (values.length <= 1) {
        return [];
      }
      
      const assets = convertSheetDataToJSON(values);
      const filteredAssets = assets.filter(asset => 
        asset['ประเภท'] && asset['ประเภท'].toString().toLowerCase() === assetType.toLowerCase()
      );
      
      Logger.log(`AssetService.getAssetsByType: Found ${filteredAssets.length} assets of type ${assetType}`);
      
      return filteredAssets;
      
    } catch (error) {
      logError('AssetService.getAssetsByType', error, { assetType });
      return [];
    }
  },

  /**
   * Get asset statistics
   * @param {string} assetId - Asset ID
   * @returns {Object|null} Asset with trading statistics
   */
  getAssetStatistics: function(assetId) {
    try {
      const asset = this.getAssetById(assetId);
      if (!asset) {
        return null;
      }
      
      // Get all trades for this asset
      const sheet = getSheet(CONFIG.SHEETS.TRADING_JOURNAL);
      if (!sheet) {
        return asset;
      }
      
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      if (values.length <= 1) {
        return { ...asset, statistics: { totalTrades: 0, totalVolume: 0 } };
      }
      
      const trades = convertSheetDataToJSON(values);
      const assetTrades = trades.filter(trade => 
        trade['Asset ID'] && trade['Asset ID'].toString() === assetId.toString()
      );
      
      let totalVolume = 0;
      let totalPnL = 0;
      let winTrades = 0;
      
      assetTrades.forEach(trade => {
        const lotSize = safeParseFloat(trade['Lot Size']);
        const pnl = safeParseFloat(trade['กำไร/ขาดทุนรายวัน (USD)']);
        
        totalVolume += lotSize;
        totalPnL += pnl;
        if (pnl > 0) winTrades++;
      });
      
      const winRate = assetTrades.length > 0 ? (winTrades / assetTrades.length * 100) : 0;
      
      return {
        ...asset,
        statistics: {
          totalTrades: assetTrades.length,
          totalVolume: formatNumber(totalVolume, 3),
          totalPnL: formatNumber(totalPnL),
          winRate: formatNumber(winRate, 1),
          avgLotSize: assetTrades.length > 0 ? formatNumber(totalVolume / assetTrades.length, 3) : '0.000'
        }
      };
      
    } catch (error) {
      logError('AssetService.getAssetStatistics', error, { assetId });
      return null;
    }
  }
  
};