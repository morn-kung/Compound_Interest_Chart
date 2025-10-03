# Trading Journal GAS Project - Refactored

## 📋 Overview
This Google Apps Script (GAS) project has been completely refactored to improve code quality, maintainability, and developer experience. The refactoring focuses on better organization, comprehensive documentation, and modern JavaScript practices.

## 🏗️ Project Structure

### Core Files
- **`Code.js`** - Main entry point handling HTTP requests and routing
- **`Config.js`** - Centralized configuration and constants
- **`Utils.js`** - Common utility functions with enhanced documentation
- **`Types.js`** - JSDoc type definitions (DTOs) for better IDE support

### Service Files
- **`TradingService.js`** - Trade management and statistics
- **`AccountService.js`** - Account-related operations
- **`AssetService.js`** - Asset management functionality
- **`Services_Auth.js`** - Authentication and authorization
- **`Services_System.js`** - System administration and maintenance
- **`PasswordService.js`** - Password hashing and verification
- **`ValidationService.js`** - Centralized validation layer
- **`DataGeneratorService.js`** - Realistic trading data generation

### Test and Utility Files
- **`TestFunctions.js`** - General test functions
- **`AuthTestFunctions.js`** - Authentication testing
- **`PasswordResetTests.js`** - Password reset testing
- **`DataGeneratorTestFunctions.js`** - Data generation testing and demos

## 🚀 Key Improvements

### 1. JSDoc Type Definitions (DTOs)
```javascript
/**
 * @typedef {Object} TradeData - Trade data structure for input
 * @property {string} accountId - Account ID associated with the trade
 * @property {string} assetId - Asset ID being traded
 * @property {number} startBalance - Starting balance for the day (USD)
 * @property {number} dailyProfit - Daily profit/loss (USD)
 * @property {number} lotSize - Lot size used in trading
 * @property {string} [notes=''] - Optional notes for the trade
 * @property {string} [tradeDate=''] - Trade date in YYYY-MM-DD format
 */
```

### 2. Enhanced Documentation
- Comprehensive JSDoc comments for all functions
- Parameter types with detailed descriptions
- Return type specifications with data structure details
- Usage examples where appropriate

### 3. Constants and Configuration
```javascript
// Trading Journal Headers - Constants for better maintainability
const TRADING_HEADERS = [
  'Transaction_ID', 'Timestamp', 'Account ID', 'Asset ID',
  'เงินต้นเริ่มต้นวัน (USD)', 'กำไร/ขาดทุนรายวัน (USD)',
  'เงินรวมสิ้นวัน (USD)', 'Lot Size', 'หมายเหตุ', 'Trade Date'
];
```

### 4. Validation Layer
- Centralized validation functions in `ValidationService.js`
- Business rule validation
- Data format validation
- Access control validation

### 5. Better Error Handling
- Comprehensive error logging with context
- Standardized error messages
- Proper exception handling

### 6. Organized Code Structure
- Logical grouping of functions with section headers
- Consistent naming conventions
- Reduced code duplication

## 🔧 API Endpoints

### Public Endpoints (No Authentication)
- `getAccounts` - Retrieve all accounts
- `getAssets` - Retrieve all assets

### Protected Endpoints (Authentication Required)
- `getTradingHistory` - Get trading history for account
- `getAccountSummary` - Get account summary
- `addTrade` - Add single trade record
- `addMultipleTrades` - Batch add trades
- `getTradingStatistics` - Get trading statistics
- `getRecentTrades` - Get recent trades

### Admin Endpoints
- `validateSheets` - Validate sheet structure
- `fixSheets` - Fix sheet issues
- `getAllSheets` - Get all sheet information 
- `getSystemHealth` - System health check
- `generateTradingData` - Generate realistic trading data to yesterday
- `generateTradingDataRange` - Generate data for specific date range

## 📊 Data Structures

### TradeData Input Format
```json
{
  "accountId": "ACC001",
  "assetId": "BTC",
  "startBalance": 1000.0,
  "dailyProfit": 50.0,
  "lotSize": 0.1,
  "notes": "Trading note",
  "tradeDate": "2025-09-27"
}
```

### API Response Format
```json
{
  "status": "success|error|partial",
  "message": "Human readable message",
  "timestamp": "2025-09-27T10:30:45.123Z",
  "data": {
    // Response-specific data
  }
}
```

## 🔐 Security Features

### Authentication
- Token-based authentication system
- Password hashing with SHA-256
- User session management

### Access Control
- Account-level access validation
- Admin-only endpoints protection
- Request parameter validation

### Data Validation
- Input sanitization
- Business rule validation
- Data type validation

## 🎯 Usage Examples

### Adding a Single Trade
```javascript
const result = addTrade(
  'ACC001',           // accountId
  'BTC',              // assetId
  1000.0,             // startBalance
  50.0,               // dailyProfit
  0.1,                // lotSize
  'First trade',      // notes (optional)
  '2025-09-27'        // tradeDate (optional)
);
```

### Batch Adding Trades
```javascript
const tradesData = JSON.stringify([
  {
    "accountId": "ACC001",
    "assetId": "BTC",
    "startBalance": 1000.0,
    "dailyProfit": 50.0,
    "lotSize": 0.1,
    "notes": "Trade 1",
    "tradeDate": "2025-09-27"
  },
  {
    "accountId": "ACC001",
    "assetId": "ETH",
    "startBalance": 1050.0,
    "dailyProfit": -20.0,
    "lotSize": 0.2,
    "notes": "Trade 2",
    "tradeDate": "2025-09-28"
  }
]);

const result = addMultipleTrades(tradesData, userToken);
```

### Generating Realistic Trading Data
```javascript
// Generate trading data from last trade to yesterday
const result = generateTradingDataToYesterday('405911362');

// Generate data for specific date range
const rangeResult = generateTradingDataForDateRange(
  '405911362',     // accountId
  '2025-08-03',    // startDate
  '2025-08-31',    // endDate
  1000.0           // initialBalance (optional)
);
```

## 🎲 Data Generation Features

### Realistic Trading Simulation
- **Win Rate**: 60% wins, 40% losses (configurable)
- **Profit Range**: $5-$100 for wins, $5-$100 for losses
- **Lot Size**: 0.01-0.5 (realistic trading sizes)
- **Trading Hours**: 9 AM - 5 PM (realistic market hours)
- **Skip Weekends**: No trades on Saturday/Sunday
- **Realistic Notes**: Contextual trading notes based on win/loss

### Available Functions
```javascript
// Test functions (run in GAS editor)
testGenerateTradingData()          // Generate data to yesterday
testGenerateTradingDataForRange()  // Generate for date range
testTradingPatterns()              // Test win rate patterns
showCurrentTradingDataSummary()    // Show current data state
quickSetupTradingData()            // Complete setup with data generation
```

### API Endpoints for Data Generation
```
GET: ?action=generateTradingData&accountId=405911362&token=your_token
GET: ?action=generateTradingDataRange&accountId=405911362&startDate=2025-08-01&endDate=2025-08-31&token=your_token
```

## 🧪 Testing

The project includes comprehensive test functions:
- Authentication testing
- Password service testing
- Trade operation testing
- System validation testing

## 📝 Configuration

### Google Sheets Setup
Update `CONFIG.SPREADSHEET_ID` in `Config.js` with your spreadsheet ID:
```javascript
SPREADSHEET_ID: 'your-spreadsheet-id-here'
```

### Sheet Names
Configure sheet names in `CONFIG.SHEETS`:
```javascript
SHEETS: {
  TRADING_JOURNAL: 'Trading_Journal',
  ACCOUNTS: 'Accounts',
  ASSETS: 'Assets',
  USER: 'user',
  USER_TOKENS: 'UserTokens'
}
```

## 🚀 Deployment

1. Open Google Apps Script (script.google.com)
2. Create a new project
3. Copy all `.js` files to the project
4. Configure the spreadsheet ID in `Config.js`
5. Deploy as a web app
6. Set permissions appropriately

## 📈 Performance Considerations

- Efficient data retrieval with proper filtering
- Batch operations for multiple records
- Caching mechanisms where appropriate
- Optimized Google Sheets operations

## 🔄 Maintenance

### Regular Tasks
- Monitor system health via admin endpoints
- Validate sheet structures
- Review authentication logs
- Update configurations as needed

### Troubleshooting
- Use system validation endpoints for diagnostics
- Check error logs for detailed debugging information
- Verify sheet permissions and structure

## 📚 Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [JSDoc Documentation](https://jsdoc.app/)
- [Google Sheets API](https://developers.google.com/sheets/api)

---

**Last Updated:** September 27, 2025  
**Version:** 2.0.0 (Refactored)  
**Maintainer:** AI Assistant