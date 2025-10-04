/**
 * AssetController
 * Handle asset management requests
 */

class AssetController extends BaseController {   
  constructor() {
    super();
    this.assetModel = new AssetModel();
    this.tradingModel = new TradingModel();
  }

  /**
   * Get all assets
   */
  handleGetAllAssets(data) {
    try {
      const { category, active_only = true } = data;

      // Get all assets with optional filtering
      const assets = this.assetModel.getAllAssets(category, active_only);
      
      return ApiResponse.success({
        message: 'Assets retrieved successfully',
        assets: assets,
        count: assets.length
      });

    } catch (error) {
      console.error('Get all assets error:', error);
      return ApiResponse.error('Failed to get assets: ' + error.message);
    }
  }

  /**
   * Get asset details
   */
  handleGetAssetDetails(data) {
    try {
      const { asset_symbol } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ asset_symbol }, ['asset_symbol']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Get asset details
      const asset = this.assetModel.findBySymbol(asset_symbol);
      if (!asset) {
        return ApiResponse.error('Asset not found', 404);
      }

      // Get asset trading statistics
      const statistics = this.assetModel.getAssetStatistics(asset_symbol);
      
      return ApiResponse.success({
        message: 'Asset details retrieved successfully',
        asset: asset,
        statistics: statistics
      });

    } catch (error) {
      console.error('Get asset details error:', error);
      return ApiResponse.error('Failed to get asset details: ' + error.message);
    }
  }

  /**
   * Create new asset
   */
  handleCreateAsset(data) {
    try {
      const { symbol, name, category, description = '', current_price = 0 } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ symbol, name, category }, ['symbol', 'name', 'category']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Check if asset already exists
      if (this.assetModel.exists(symbol)) {
        return ApiResponse.error('Asset with this symbol already exists', 409);
      }

      // Validate category
      const validCategories = ['STOCK', 'CRYPTO', 'FOREX', 'COMMODITY', 'BOND', 'ETF', 'MUTUAL_FUND'];
      if (!validCategories.includes(category.toUpperCase())) {
        return ApiResponse.error('Invalid category. Must be: ' + validCategories.join(', '), 400);
      }

      // Validate current price
      const numPrice = parseFloat(current_price);
      if (isNaN(numPrice) || numPrice < 0) {
        return ApiResponse.error('Current price must be a non-negative number', 400);
      }

      // Create asset record
      const assetData = {
        symbol: symbol.toUpperCase(),
        name: name,
        category: category.toUpperCase(),
        description: description,
        current_price: numPrice,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active: true
      };

      const result = this.assetModel.addRecord(assetData);
      if (!result.success) {
        return ApiResponse.error('Failed to create asset: ' + result.error);
      }

      return ApiResponse.success({
        message: 'Asset created successfully',
        asset: assetData
      });

    } catch (error) {
      console.error('Create asset error:', error);
      return ApiResponse.error('Failed to create asset: ' + error.message);
    }
  }

  /**
   * Update asset
   */
  handleUpdateAsset(data) {
    try {
      const { asset_symbol, updates } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ asset_symbol, updates }, ['asset_symbol', 'updates']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Check if asset exists
      if (!this.assetModel.exists(asset_symbol)) {
        return ApiResponse.error('Asset not found', 404);
      }

      // Validate updates
      if (updates.category) {
        const validCategories = ['STOCK', 'CRYPTO', 'FOREX', 'COMMODITY', 'BOND', 'ETF', 'MUTUAL_FUND'];
        if (!validCategories.includes(updates.category.toUpperCase())) {
          return ApiResponse.error('Invalid category. Must be: ' + validCategories.join(', '), 400);
        }
        updates.category = updates.category.toUpperCase();
      }

      if (updates.current_price && (isNaN(parseFloat(updates.current_price)) || parseFloat(updates.current_price) < 0)) {
        return ApiResponse.error('Current price must be a non-negative number', 400);
      }

      // Add update timestamp
      updates.updated_at = new Date().toISOString();

      // Update asset
      const result = this.assetModel.updateAsset(asset_symbol, updates);
      if (!result.success) {
        return ApiResponse.error('Failed to update asset: ' + result.error);
      }

      return ApiResponse.success({
        message: 'Asset updated successfully',
        asset_symbol: asset_symbol
      });

    } catch (error) {
      console.error('Update asset error:', error);
      return ApiResponse.error('Failed to update asset: ' + error.message);
    }
  }

  /**
   * Delete asset
   */
  handleDeleteAsset(data) {
    try {
      const { asset_symbol } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ asset_symbol }, ['asset_symbol']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Check if asset exists
      if (!this.assetModel.exists(asset_symbol)) {
        return ApiResponse.error('Asset not found', 404);
      }

      // Check if asset is being used in trades
      const assetTrades = this.tradingModel.findByAsset(asset_symbol);
      if (assetTrades.length > 0) {
        return ApiResponse.error('Cannot delete asset with existing trades. Consider deactivating instead.', 400);
      }

      // Delete asset
      const result = this.assetModel.deleteAsset(asset_symbol);
      if (!result.success) {
        return ApiResponse.error('Failed to delete asset: ' + result.error);
      }

      return ApiResponse.success({
        message: 'Asset deleted successfully',
        asset_symbol: asset_symbol
      });

    } catch (error) {
      console.error('Delete asset error:', error);
      return ApiResponse.error('Failed to delete asset: ' + error.message);
    }
  }

  /**
   * Get asset price history
   */
  handleGetPriceHistory(data) {
    try {
      const { asset_symbol, period, limit } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ asset_symbol }, ['asset_symbol']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Check if asset exists
      if (!this.assetModel.exists(asset_symbol)) {
        return ApiResponse.error('Asset not found', 404);
      }

      // Get price history
      const priceHistory = this.assetModel.getPriceHistory(asset_symbol, period, limit);
      
      return ApiResponse.success({
        message: 'Price history retrieved successfully',
        asset_symbol: asset_symbol,
        price_history: priceHistory,
        count: priceHistory.length
      });

    } catch (error) {
      console.error('Get price history error:', error);
      return ApiResponse.error('Failed to get price history: ' + error.message);
    }
  }

  /**
   * Update asset price
   */
  handleUpdatePrice(data) {
    try {
      const { asset_symbol, new_price, source = 'MANUAL' } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ asset_symbol, new_price }, ['asset_symbol', 'new_price']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Check if asset exists
      if (!this.assetModel.exists(asset_symbol)) {
        return ApiResponse.error('Asset not found', 404);
      }

      // Validate new price
      const numPrice = parseFloat(new_price);
      if (isNaN(numPrice) || numPrice < 0) {
        return ApiResponse.error('New price must be a non-negative number', 400);
      }

      // Update asset price
      const result = this.assetModel.updatePrice(asset_symbol, numPrice, source);
      if (!result.success) {
        return ApiResponse.error('Failed to update price: ' + result.error);
      }

      return ApiResponse.success({
        message: 'Asset price updated successfully',
        asset_symbol: asset_symbol,
        new_price: numPrice,
        source: source,
        updated_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Update price error:', error);
      return ApiResponse.error('Failed to update price: ' + error.message);
    }
  }

  /**
   * Get assets by category
   */
  handleGetAssetsByCategory(data) {
    try {
      const { category, active_only = true } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ category }, ['category']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Validate category
      const validCategories = ['STOCK', 'CRYPTO', 'FOREX', 'COMMODITY', 'BOND', 'ETF', 'MUTUAL_FUND'];
      if (!validCategories.includes(category.toUpperCase())) {
        return ApiResponse.error('Invalid category. Must be: ' + validCategories.join(', '), 400);
      }

      // Get assets by category
      const assets = this.assetModel.getByCategory(category.toUpperCase(), active_only);
      
      return ApiResponse.success({
        message: 'Assets retrieved successfully',
        category: category.toUpperCase(),
        assets: assets,
        count: assets.length
      });

    } catch (error) {
      console.error('Get assets by category error:', error);
      return ApiResponse.error('Failed to get assets by category: ' + error.message);
    }
  }

  /**
   * Search assets
   */
  handleSearchAssets(data) {
    try {
      const { query, category, active_only = true, limit = 50 } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ query }, ['query']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Search assets
      const assets = this.assetModel.searchAssets(query, category, active_only, limit);
      
      return ApiResponse.success({
        message: 'Asset search completed successfully',
        query: query,
        assets: assets,
        count: assets.length
      });

    } catch (error) {
      console.error('Search assets error:', error);
      return ApiResponse.error('Failed to search assets: ' + error.message);
    }
  }

  /**
   * Get popular assets (most traded)
   */
  handleGetPopularAssets(data) {
    try {
      const { period = '30d', limit = 10 } = data;

      // Get popular assets based on trading volume
      const popularAssets = this.assetModel.getPopularAssets(period, limit);
      
      return ApiResponse.success({
        message: 'Popular assets retrieved successfully',
        period: period,
        assets: popularAssets,
        count: popularAssets.length
      });

    } catch (error) {
      console.error('Get popular assets error:', error);
      return ApiResponse.error('Failed to get popular assets: ' + error.message);
    }
  }
}