/**
 * TradingController
 * Handle trading-related requests
 */

class TradingController extends BaseController {
  constructor() {
    super();
    this.tradingModel = new TradingModel();
    this.accountModel = new AccountModel();
    this.assetModel = new AssetModel();
  }

  /**
   * Add new trade
   */
  handleAddTrade(data) {
    try {
      const { username, account_id, asset, amount, action, price } = data;
      
      // Validate required parameters
      const requiredParams = ['username', 'account_id', 'asset', 'amount', 'action', 'price'];
      const validationResult = this.validateRequiredParams(data, requiredParams);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Validate user access to account
      if (!this.accountModel.userHasAccess(username, account_id)) {
        return ApiResponse.error('Access denied to this account', 403);
      }

      // Validate asset exists
      if (!this.assetModel.exists(asset)) {
        return ApiResponse.error('Asset not found', 404);
      }

      // Validate action
      if (!['BUY', 'SELL'].includes(action.toUpperCase())) {
        return ApiResponse.error('Action must be BUY or SELL', 400);
      }

      // Validate numeric values
      const numAmount = parseFloat(amount);
      const numPrice = parseFloat(price);
      if (isNaN(numAmount) || numAmount <= 0) {
        return ApiResponse.error('Amount must be a positive number', 400);
      }
      if (isNaN(numPrice) || numPrice <= 0) {
        return ApiResponse.error('Price must be a positive number', 400);
      }

      // Create trade record
      const tradeData = {
        username: username,
        account_id: account_id,
        asset: asset,
        amount: numAmount,
        action: action.toUpperCase(),
        price: numPrice,
        total_value: numAmount * numPrice,
        timestamp: new Date().toISOString(),
        status: 'COMPLETED'
      };

      const result = this.tradingModel.addTrade(tradeData);
      if (!result.success) {
        return ApiResponse.error('Failed to add trade: ' + result.error);
      }

      return ApiResponse.success({
        message: 'Trade added successfully',
        trade: tradeData,
        trade_id: result.rowIndex
      });

    } catch (error) {
      console.error('Add trade error:', error);
      return ApiResponse.error('Failed to add trade: ' + error.message);
    }
  }

  /**
   * Get trading history
   */
  handleGetTradingHistory(data) {
    try {
      const { username, account_id, limit, offset } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ username }, ['username']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // If account_id specified, validate access
      if (account_id && !this.accountModel.userHasAccess(username, account_id)) {
        return ApiResponse.error('Access denied to this account', 403);
      }

      // Get trading history
      const trades = this.tradingModel.getUserTrades(username, account_id, limit, offset);
      
      return ApiResponse.success({
        message: 'Trading history retrieved successfully',
        trades: trades,
        count: trades.length
      });

    } catch (error) {
      console.error('Get trading history error:', error);
      return ApiResponse.error('Failed to get trading history: ' + error.message);
    }
  }

  /**
   * Get trading statistics
   */
  handleGetTradingStats(data) {
    try {
      const { username, account_id, period } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ username }, ['username']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // If account_id specified, validate access
      if (account_id && !this.accountModel.userHasAccess(username, account_id)) {
        return ApiResponse.error('Access denied to this account', 403);
      }

      // Get trading statistics
      const stats = this.tradingModel.getTradingStatistics(username, account_id, period);
      
      return ApiResponse.success({
        message: 'Trading statistics retrieved successfully',
        statistics: stats
      });

    } catch (error) {
      console.error('Get trading stats error:', error);
      return ApiResponse.error('Failed to get trading statistics: ' + error.message);
    }
  }

  /**
   * Get recent trades
   */
  handleGetRecentTrades(data) {
    try {
      const { username, account_id, limit = 10 } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ username }, ['username']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // If account_id specified, validate access
      if (account_id && !this.accountModel.userHasAccess(username, account_id)) {
        return ApiResponse.error('Access denied to this account', 403);
      }

      // Get recent trades
      const trades = this.tradingModel.getRecentTrades(username, account_id, limit);
      
      return ApiResponse.success({
        message: 'Recent trades retrieved successfully',
        trades: trades,
        count: trades.length
      });

    } catch (error) {
      console.error('Get recent trades error:', error);
      return ApiResponse.error('Failed to get recent trades: ' + error.message);
    }
  }

  /**
   * Update trade
   */
  handleUpdateTrade(data) {
    try {
      const { username, trade_id, updates } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ username, trade_id, updates }, ['username', 'trade_id', 'updates']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Get existing trade to verify ownership
      const existingTrade = this.tradingModel.findById(trade_id);
      if (!existingTrade) {
        return ApiResponse.error('Trade not found', 404);
      }

      if (existingTrade.username !== username) {
        return ApiResponse.error('Access denied to this trade', 403);
      }

      // Validate updates if they include numeric fields
      if (updates.amount && (isNaN(parseFloat(updates.amount)) || parseFloat(updates.amount) <= 0)) {
        return ApiResponse.error('Amount must be a positive number', 400);
      }
      if (updates.price && (isNaN(parseFloat(updates.price)) || parseFloat(updates.price) <= 0)) {
        return ApiResponse.error('Price must be a positive number', 400);
      }
      if (updates.action && !['BUY', 'SELL'].includes(updates.action.toUpperCase())) {
        return ApiResponse.error('Action must be BUY or SELL', 400);
      }

      // Update trade
      const result = this.tradingModel.updateTrade(trade_id, updates);
      if (!result.success) {
        return ApiResponse.error('Failed to update trade: ' + result.error);
      }

      return ApiResponse.success({
        message: 'Trade updated successfully',
        trade_id: trade_id
      });

    } catch (error) {
      console.error('Update trade error:', error);
      return ApiResponse.error('Failed to update trade: ' + error.message);
    }
  }

  /**
   * Delete trade
   */
  handleDeleteTrade(data) {
    try {
      const { username, trade_id } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ username, trade_id }, ['username', 'trade_id']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Get existing trade to verify ownership
      const existingTrade = this.tradingModel.findById(trade_id);
      if (!existingTrade) {
        return ApiResponse.error('Trade not found', 404);
      }

      if (existingTrade.username !== username) {
        return ApiResponse.error('Access denied to this trade', 403);
      }

      // Delete trade
      const result = this.tradingModel.deleteTrade(trade_id);
      if (!result.success) {
        return ApiResponse.error('Failed to delete trade: ' + result.error);
      }

      return ApiResponse.success({
        message: 'Trade deleted successfully',
        trade_id: trade_id
      });

    } catch (error) {
      console.error('Delete trade error:', error);
      return ApiResponse.error('Failed to delete trade: ' + error.message);
    }
  }

  /**
   * Get portfolio summary
   */
  handleGetPortfolio(data) {
    try {
      const { username, account_id } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ username }, ['username']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // If account_id specified, validate access
      if (account_id && !this.accountModel.userHasAccess(username, account_id)) {
        return ApiResponse.error('Access denied to this account', 403);
      }

      // Get portfolio data
      const portfolio = this.tradingModel.getPortfolioSummary(username, account_id);
      
      return ApiResponse.success({
        message: 'Portfolio retrieved successfully',
        portfolio: portfolio
      });

    } catch (error) {
      console.error('Get portfolio error:', error);
      return ApiResponse.error('Failed to get portfolio: ' + error.message);
    }
  }
}