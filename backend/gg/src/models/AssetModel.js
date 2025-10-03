/**
 * AssetModel - Asset data access layer
 * Handles all asset-related database operations
 * @requires BaseModel - For common database operations
 * @created 2025-10-03
 */

/**
 * Asset Model Class
 * Provides data access methods for asset operations
 */
class AssetModel extends BaseModel {
  
  static get SHEET_NAME() {
    return CONFIG.SHEETS.ASSETS;
  }
  
  static get HEADERS() {
    return [
      'Asset_ID',
      'ชื่อสินทรัพย์',
      'ประเภท',
      'หมายเหตุ'
    ];
  }
  
  /**
   * Get all assets
   * @returns {Array<Object>} Array of asset records
   */
  static getAllAssets() {
    const values = this.getSheetData(this.SHEET_NAME);
    return this.convertToObjects(values, this.HEADERS);
  }
  
  /**
   * Find asset by ID
   * @param {string} assetId - Asset ID to find
   * @returns {Object|null} Asset object or null if not found
   */
  static findById(assetId) {
    return this.findByField(
      this.SHEET_NAME,
      'Asset_ID',
      assetId,
      this.HEADERS
    );
  }
  
  /**
   * Find assets by type
   * @param {string} assetType - Asset type (e.g., 'Crypto', 'Forex')
   * @returns {Array<Object>} Array of assets of specified type
   */
  static findByType(assetType) {
    return this.findAllByField(
      this.SHEET_NAME,
      'ประเภท',
      assetType,
      this.HEADERS
    );
  }
  
  /**
   * Validate if asset exists
   * @param {string} assetId - Asset ID to validate
   * @returns {boolean} True if asset exists
   */
  static exists(assetId) {
    return this.findById(assetId) !== null;
  }
  
  /**
   * Get unique asset types
   * @returns {Array<string>} Array of unique asset types
   */
  static getAssetTypes() {
    const assets = this.getAllAssets();
    const types = assets.map(asset => asset['ประเภท']);
    return [...new Set(types)].filter(type => type); // Remove duplicates and empty values
  }
  
  /**
   * Create new asset
   * @param {Object} assetData - Asset data
   * @returns {Object} Result with success status and asset ID
   */
  static createAsset(assetData) {
    try {
      const validation = this.validateAssetData(assetData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.missing
        };
      }
      
      // Check if asset ID already exists
      if (this.exists(assetData.assetId)) {
        return {
          success: false,
          errors: ['Asset ID already exists']
        };
      }
      
      const rowData = [
        assetData.assetId,
        assetData.assetName,
        assetData.assetType,
        assetData.notes || ''
      ];
      
      const success = this.addRecord(this.SHEET_NAME, rowData);
      
      return {
        success: success,
        assetId: success ? assetData.assetId : null
      };
      
    } catch (error) {
      console.error('Error creating asset:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Update asset information
   * @param {string} assetId - Asset ID to update
   * @param {Object} updateData - Data to update
   * @returns {boolean} Success status
   */
  static updateAsset(assetId, updateData) {
    try {
      const values = this.getSheetData(this.SHEET_NAME);
      
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (String(row[0]) === String(assetId)) {
          // Update fields if provided
          if (updateData.assetName !== undefined) {
            row[1] = updateData.assetName;
          }
          if (updateData.assetType !== undefined) {
            row[2] = updateData.assetType;
          }
          if (updateData.notes !== undefined) {
            row[3] = updateData.notes;
          }
          
          return this.updateRecord(this.SHEET_NAME, i + 1, row);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error updating asset:', error);
      return false;
    }
  }
  
  /**
   * Delete asset
   * @param {string} assetId - Asset ID to delete
   * @returns {boolean} Success status
   */
  static deleteAsset(assetId) {
    try {
      // Check if asset is being used in trading records
      const tradingRecords = TradingModel.findAllByField(
        TradingModel.SHEET_NAME,
        'Asset_ID',
        assetId,
        TradingModel.HEADERS
      );
      
      if (tradingRecords.length > 0) {
        return {
          success: false,
          error: 'Cannot delete asset that has trading records'
        };
      }
      
      const values = this.getSheetData(this.SHEET_NAME);
      const sheet = this.getSheet(this.SHEET_NAME);
      
      for (let i = 1; i < values.length; i++) {
        if (String(values[i][0]) === String(assetId)) {
          sheet.deleteRow(i + 1);
          return { success: true };
        }
      }
      
      return {
        success: false,
        error: 'Asset not found'
      };
      
    } catch (error) {
      console.error('Error deleting asset:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get asset trading statistics
   * @param {string} assetId - Asset ID
   * @returns {Object} Asset trading statistics
   */
  static getAssetStatistics(assetId) {
    const asset = this.findById(assetId);
    if (!asset) return null;
    
    // Get all trading records for this asset
    const allTrades = TradingModel.findAllByField(
      TradingModel.SHEET_NAME,
      'Asset_ID',
      assetId,
      TradingModel.HEADERS
    );
    
    if (allTrades.length === 0) {
      return {
        asset: asset,
        totalTrades: 0,
        totalProfit: 0,
        totalVolume: 0,
        averageProfit: 0,
        uniqueAccounts: 0
      };
    }
    
    let totalProfit = 0;
    let totalVolume = 0;
    const uniqueAccounts = new Set();
    
    allTrades.forEach(trade => {
      totalProfit += parseFloat(trade['กำไร_ขาดทุนรายวัน_USD']) || 0;
      totalVolume += parseFloat(trade.Lot_Size) || 0;
      uniqueAccounts.add(trade.Account_ID);
    });
    
    return {
      asset: asset,
      totalTrades: allTrades.length,
      totalProfit: totalProfit,
      totalVolume: totalVolume,
      averageProfit: allTrades.length > 0 ? totalProfit / allTrades.length : 0,
      uniqueAccounts: uniqueAccounts.size
    };
  }
  
  /**
   * Validate asset data
   * @param {Object} assetData - Asset data to validate
   * @returns {Object} Validation result
   */
  static validateAssetData(assetData) {
    const required = ['assetId', 'assetName', 'assetType'];
    return this.validateRequired(assetData, required);
  }
  
  /**
   * Search assets by name (partial match)
   * @param {string} searchTerm - Search term
   * @returns {Array<Object>} Array of matching assets
   */
  static searchByName(searchTerm) {
    const allAssets = this.getAllAssets();
    const searchLower = searchTerm.toLowerCase();
    
    return allAssets.filter(asset => 
      asset['ชื่อสินทรัพย์'].toLowerCase().includes(searchLower) ||
      asset.Asset_ID.toLowerCase().includes(searchLower)
    );
  }
}