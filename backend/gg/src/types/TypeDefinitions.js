/**
 * Data Transfer Objects (DTOs) and Type Definitions
 * JSDoc typedefs for better code documentation and IDE support
 * @created 2025-09-27
 * @moved 2025-10-03 (to types/ directory for MVC structure)
 */

/**
 * @typedef {Object} TradeData - Trade data structure for input
 * @property {string} accountId - Account ID associated with the trade
 * @property {string} assetId - Asset ID being traded
 * @property {number} startBalance - Starting balance for the day (USD)
 * @property {number} dailyProfit - Daily profit/loss (USD)
 * @property {number} lotSize - Lot size used in trading
 * @property {string} [notes=''] - Optional notes for the trade
 * @property {string} [tradeDate=''] - Trade date in YYYY-MM-DD format (defaults to current date)
 */

/**
 * @typedef {Object} TradeRecord - Complete trade record from database
 * @property {string} Transaction_ID - Unique transaction identifier
 * @property {string} Timestamp - ISO timestamp when record was created
 * @property {string} Account_ID - Account ID
 * @property {string} Asset_ID - Asset ID
 * @property {number} เงินต้นเริ่มต้นวัน_USD - Starting balance in USD
 * @property {number} กำไร_ขาดทุนรายวัน_USD - Daily profit/loss in USD
 * @property {number} เงินรวมสิ้นวัน_USD - End balance in USD
 * @property {number} Lot_Size - Lot size
 * @property {string} หมายเหตุ - Notes
 * @property {string} Trade_Date - Trade date
 */

/**
 * @typedef {Object} Account - Account data structure
 * @property {string} Account_ID - Unique account identifier
 * @property {string} ชื่อบัญชี - Account name
 * @property {string} ชื่อผู้ใช้_เจ้าของ - Owner/username
 * @property {number} เงินต้นเริ่มต้น_USD - Initial capital in USD
 */

/**
 * @typedef {Object} Asset - Asset data structure
 * @property {string} Asset_ID - Unique asset identifier
 * @property {string} ชื่อสินทรัพย์ - Asset name
 * @property {string} ประเภท - Asset type (Crypto, Forex, etc.)
 * @property {string} หมายเหตุ - Notes about the asset
 */

/**
 * @typedef {Object} User - User data structure
 * @property {string} id - Employee ID (unique identifier)
 * @property {string} fullName - Full name in Thai
 * @property {string} email - Email address
 * @property {string} role - User role
 * @property {number} status - User status (1 = active, 0 = inactive)
 */

/**
 * @typedef {Object} APIResponse - Standard API response structure
 * @property {string} status - Response status ('success', 'error', 'partial')
 * @property {string} message - Response message
 * @property {string} timestamp - ISO timestamp of response
 * @property {Object} [data] - Additional response data
 */

/**
 * @typedef {Object} ValidationResult - Parameter validation result
 * @property {boolean} isValid - Whether validation passed
 * @property {string[]} missing - Array of missing parameter names
 */

/**
 * @typedef {Object} AuthResult - Authentication result
 * @property {string} status - Authentication status
 * @property {string} message - Authentication message
 * @property {User} [user] - User object if authentication successful
 * @property {string} [token] - Authentication token if successful
 */

/**
 * @typedef {Object} TokenInfo - Token information structure
 * @property {string} token - Token string
 * @property {string} userId - Associated user ID
 * @property {string} createdAt - Token creation timestamp
 * @property {string} [expiresAt] - Token expiration timestamp
 */

/**
 * @typedef {Object} TradingStatistics - Trading statistics for an account
 * @property {number} totalTrades - Total number of trades
 * @property {number} totalProfit - Total profit/loss
 * @property {number} averageProfit - Average profit per trade
 * @property {number} winRate - Win rate percentage
 * @property {number} profitableTrades - Number of profitable trades
 * @property {number} lossTrades - Number of losing trades
 * @property {number} breakEvenTrades - Number of break-even trades
 * @property {number} largestWin - Largest single win
 * @property {number} largestLoss - Largest single loss
 * @property {number} totalLotSize - Total lot size traded
 * @property {number} averageLotSize - Average lot size per trade
 */

/**
 * @typedef {Object} BatchTradeResult - Result of batch trade operation
 * @property {number} index - Index of trade in batch (1-based)
 * @property {string} status - Result status ('success' or 'error')
 * @property {string} message - Result message
 * @property {string} [id] - Transaction ID if successful
 * @property {string} tradeDate - Trade date
 * @property {string} accountId - Account ID
 */

/**
 * @typedef {Object} BatchOperationSummary - Summary of batch operation
 * @property {number} total - Total number of items processed
 * @property {number} success - Number of successful operations
 * @property {number} errors - Number of failed operations
 * @property {BatchTradeResult[]} results - Detailed results for each item
 * @property {number} [duplicateDatesCount] - Number of duplicate dates found
 * @property {string} [duplicateDatesMessage] - Message about duplicate dates
 */

/**
 * @typedef {Object} SheetValidationResult - Sheet validation result
 * @property {boolean} exists - Whether sheet exists
 * @property {boolean} hasValidHeaders - Whether headers are valid
 * @property {string[]} missingHeaders - Missing headers
 * @property {string[]} extraHeaders - Extra headers not in config
 * @property {number} rowCount - Number of rows in sheet
 * @property {number} columnCount - Number of columns in sheet
 */

/**
 * @typedef {Object} SystemHealthCheck - System health check result
 * @property {boolean} spreadsheetsAccessible - Whether spreadsheets are accessible
 * @property {boolean} allSheetsExist - Whether all required sheets exist
 * @property {boolean} headersValid - Whether all headers are valid
 * @property {Object} sheetStatus - Status of each sheet
 * @property {string[]} issues - Array of identified issues
 * @property {string} overallStatus - Overall system status
 */

// ==========================================
// MVC Additional Types (added 2025-10-03)
// ==========================================

/**
 * @typedef {Object} ControllerResponse - Standard controller response
 * @property {string} status - Response status ('success', 'error', 'partial')
 * @property {string} message - Response message
 * @property {Object} [data] - Response data
 * @property {number} [code] - HTTP status code
 * @property {string} timestamp - Response timestamp
 */

/**
 * @typedef {Object} ModelResult - Standard model operation result
 * @property {boolean} success - Whether operation was successful
 * @property {string} [error] - Error message if operation failed
 * @property {Object} [data] - Result data if operation succeeded
 * @property {number} [rowIndex] - Row index for inserted records
 */

/**
 * @typedef {Object} DatabaseRecord - Generic database record
 * @property {string} id - Record ID
 * @property {string} created_at - Creation timestamp
 * @property {string} [updated_at] - Last update timestamp
 * @property {boolean} [active] - Whether record is active
 */

/**
 * @typedef {Object} PaginationParams - Pagination parameters
 * @property {number} [limit] - Maximum number of records to return
 * @property {number} [offset] - Number of records to skip
 * @property {string} [sortBy] - Field to sort by
 * @property {string} [sortOrder] - Sort order ('asc' or 'desc')
 */

/**
 * @typedef {Object} FilterParams - Filter parameters
 * @property {string} [category] - Category filter
 * @property {boolean} [active_only] - Whether to include only active records
 * @property {string} [date_from] - Start date filter
 * @property {string} [date_to] - End date filter
 * @property {string} [search] - Search query
 */

// Export types for use in other files (GAS doesn't have modules, but this documents the types)
// These typedefs can be used with @param {TradeData} and @returns {APIResponse} in JSDoc comments