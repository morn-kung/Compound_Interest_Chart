/**
 * AccountController
 * Handle account management requests
 */

class AccountController extends BaseController {
  constructor() {
    super();
    this.accountModel = new AccountModel();
    this.tradingModel = new TradingModel();
  }

  /**
   * Get user accounts
   */
  handleGetAccounts(data) {
    try {
      const { username } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ username }, ['username']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Get user accounts
      const accounts = this.accountModel.getUserAccounts(username);
      
      return ApiResponse.success({
        message: 'Accounts retrieved successfully',
        accounts: accounts,
        count: accounts.length
      });

    } catch (error) {
      console.error('Get accounts error:', error);
      return ApiResponse.error('Failed to get accounts: ' + error.message);
    }
  }

  /**
   * Get account details
   */
  handleGetAccountDetails(data) {
    try {
      const { username, account_id } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ username, account_id }, ['username', 'account_id']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Validate user access to account
      if (!this.accountModel.userHasAccess(username, account_id)) {
        return ApiResponse.error('Access denied to this account', 403);
      }

      // Get account details
      const account = this.accountModel.findById(account_id);
      if (!account) {
        return ApiResponse.error('Account not found', 404);
      }

      // Get account summary with statistics
      const summary = this.accountModel.getAccountSummary(account_id);
      
      return ApiResponse.success({
        message: 'Account details retrieved successfully',
        account: account,
        summary: summary
      });

    } catch (error) {
      console.error('Get account details error:', error);
      return ApiResponse.error('Failed to get account details: ' + error.message);
    }
  }

  /**
   * Create new account
   */
  handleCreateAccount(data) {
    try {
      const { username, account_name, account_type, initial_balance = 0, description = '' } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ username, account_name, account_type }, ['username', 'account_name', 'account_type']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Validate account type
      const validTypes = ['TRADING', 'DEMO', 'PAPER'];
      if (!validTypes.includes(account_type.toUpperCase())) {
        return ApiResponse.error('Invalid account type. Must be: ' + validTypes.join(', '), 400);
      }

      // Validate initial balance
      const numBalance = parseFloat(initial_balance);
      if (isNaN(numBalance) || numBalance < 0) {
        return ApiResponse.error('Initial balance must be a non-negative number', 400);
      }

      // Create account record
      const accountData = {
        account_name: account_name,
        account_type: account_type.toUpperCase(),
        owner_username: username,
        initial_balance: numBalance,
        current_balance: numBalance,
        description: description,
        created_at: new Date().toISOString(),
        active: true
      };

      const result = this.accountModel.addRecord(accountData);
      if (!result.success) {
        return ApiResponse.error('Failed to create account: ' + result.error);
      }

      return ApiResponse.success({
        message: 'Account created successfully',
        account: accountData,
        account_id: result.rowIndex
      });

    } catch (error) {
      console.error('Create account error:', error);
      return ApiResponse.error('Failed to create account: ' + error.message);
    }
  }

  /**
   * Update account
   */
  handleUpdateAccount(data) {
    try {
      const { username, account_id, updates } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ username, account_id, updates }, ['username', 'account_id', 'updates']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Validate user access to account
      if (!this.accountModel.userHasAccess(username, account_id)) {
        return ApiResponse.error('Access denied to this account', 403);
      }

      // Validate updates
      if (updates.account_type) {
        const validTypes = ['TRADING', 'DEMO', 'PAPER'];
        if (!validTypes.includes(updates.account_type.toUpperCase())) {
          return ApiResponse.error('Invalid account type. Must be: ' + validTypes.join(', '), 400);
        }
        updates.account_type = updates.account_type.toUpperCase();
      }

      if (updates.current_balance && (isNaN(parseFloat(updates.current_balance)) || parseFloat(updates.current_balance) < 0)) {
        return ApiResponse.error('Current balance must be a non-negative number', 400);
      }

      // Add update timestamp
      updates.updated_at = new Date().toISOString();

      // Update account
      const result = this.accountModel.updateAccount(account_id, updates);
      if (!result.success) {
        return ApiResponse.error('Failed to update account: ' + result.error);
      }

      return ApiResponse.success({
        message: 'Account updated successfully',
        account_id: account_id
      });

    } catch (error) {
      console.error('Update account error:', error);
      return ApiResponse.error('Failed to update account: ' + error.message);
    }
  }

  /**
   * Delete account
   */
  handleDeleteAccount(data) {
    try {
      const { username, account_id } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ username, account_id }, ['username', 'account_id']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Validate user access to account
      if (!this.accountModel.userHasAccess(username, account_id)) {
        return ApiResponse.error('Access denied to this account', 403);
      }

      // Check if account has active trades
      const recentTrades = this.tradingModel.getRecentTrades(username, account_id, 1);
      if (recentTrades.length > 0) {
        return ApiResponse.error('Cannot delete account with trading history. Consider deactivating instead.', 400);
      }

      // Delete account (or deactivate)
      const result = this.accountModel.deleteAccount(account_id);
      if (!result.success) {
        return ApiResponse.error('Failed to delete account: ' + result.error);
      }

      return ApiResponse.success({
        message: 'Account deleted successfully',
        account_id: account_id
      });

    } catch (error) {
      console.error('Delete account error:', error);
      return ApiResponse.error('Failed to delete account: ' + error.message);
    }
  }

  /**
   * Get account performance
   */
  handleGetAccountPerformance(data) {
    try {
      const { username, account_id, period } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ username, account_id }, ['username', 'account_id']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Validate user access to account
      if (!this.accountModel.userHasAccess(username, account_id)) {
        return ApiResponse.error('Access denied to this account', 403);
      }

      // Get account performance data
      const performance = this.accountModel.getAccountPerformance(account_id, period);
      
      return ApiResponse.success({
        message: 'Account performance retrieved successfully',
        account_id: account_id,
        performance: performance
      });

    } catch (error) {
      console.error('Get account performance error:', error);
      return ApiResponse.error('Failed to get account performance: ' + error.message);
    }
  }

  /**
   * Transfer funds between accounts
   */
  handleTransferFunds(data) {
    try {
      const { username, from_account_id, to_account_id, amount, description = '' } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams(
        { username, from_account_id, to_account_id, amount }, 
        ['username', 'from_account_id', 'to_account_id', 'amount']
      );
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Validate user access to both accounts
      if (!this.accountModel.userHasAccess(username, from_account_id)) {
        return ApiResponse.error('Access denied to source account', 403);
      }
      if (!this.accountModel.userHasAccess(username, to_account_id)) {
        return ApiResponse.error('Access denied to destination account', 403);
      }

      // Validate amount
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return ApiResponse.error('Transfer amount must be a positive number', 400);
      }

      // Get source account to check balance
      const fromAccount = this.accountModel.findById(from_account_id);
      if (!fromAccount) {
        return ApiResponse.error('Source account not found', 404);
      }

      if (fromAccount.current_balance < numAmount) {
        return ApiResponse.error('Insufficient balance in source account', 400);
      }

      // Perform transfer
      const result = this.accountModel.transferFunds(from_account_id, to_account_id, numAmount, description);
      if (!result.success) {
        return ApiResponse.error('Failed to transfer funds: ' + result.error);
      }

      return ApiResponse.success({
        message: 'Funds transferred successfully',
        from_account_id: from_account_id,
        to_account_id: to_account_id,
        amount: numAmount,
        transaction_id: result.transactionId
      });

    } catch (error) {
      console.error('Transfer funds error:', error);
      return ApiResponse.error('Failed to transfer funds: ' + error.message);
    }
  }

  /**
   * Get account transaction history
   */
  handleGetTransactionHistory(data) {
    try {
      const { username, account_id, limit, offset } = data;
      
      // Validate required parameters
      const validationResult = this.validateRequiredParams({ username, account_id }, ['username', 'account_id']);
      if (!validationResult.isValid) {
        return ApiResponse.validationError(validationResult.message);
      }

      // Validate user access to account
      if (!this.accountModel.userHasAccess(username, account_id)) {
        return ApiResponse.error('Access denied to this account', 403);
      }

      // Get transaction history
      const transactions = this.accountModel.getTransactionHistory(account_id, limit, offset);
      
      return ApiResponse.success({
        message: 'Transaction history retrieved successfully',
        account_id: account_id,
        transactions: transactions,
        count: transactions.length
      });

    } catch (error) {
      console.error('Get transaction history error:', error);
      return ApiResponse.error('Failed to get transaction history: ' + error.message);
    }
  }
}