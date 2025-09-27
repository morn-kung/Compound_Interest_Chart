# 📊 Trading Journal & Compound Calculator

## 🎯 Project Overview

A comprehensive web application for managing trading journals with compound interest calculations, featuring user authentication, real-time data synchronization with Google Sheets, and interactive dashboards.

---

## 🏗️ Architecture

### Frontend (HTML/JavaScript)
- **Single Page Application** with tabbed interface
- **Authentication System** with account-based access
- **Real-time Dashboard** with trading statistics
- **Compound Interest Calculator** with interactive charts
- **Trading Record Form** with dynamic entry management

### Backend (Google Apps Script)
- **RESTful API** endpoints for data operations
- **Modular Service Architecture** with separated concerns
- **Google Sheets Integration** as database
- **UUID-based Transaction Tracking**
- **Comprehensive Error Handling**

---

## 📁 File Structure

```
📦 Trading Journal Project
├── 🌐 Frontend
│   ├── index.html                 # Main application interface
│   └── thunder-client-collection.json  # API testing collection
│
├── ⚙️ Backend (Google Apps Script)
│   ├── Code.js                    # Main entry points (doGet, doPost)
│   ├── Config.js                  # Configuration & constants
│   ├── Utils.js                   # Utility functions
│   ├── AccountService.js          # Account operations
│   ├── AssetService.js           # Asset operations
│   ├── TradingService.js         # Trading operations
│   └── TestFunctions.js          # Testing & debugging functions
│
├── 📋 Data Sheets (Google Sheets)
│   ├── Trading_Journal           # Main trading records
│   ├── Accounts                  # User account information
│   ├── Assets                    # Trading assets catalog
│   └── user                      # User authentication data
│
└── 📚 Documentation
    ├── structure.md              # This file
    ├── info.md                   # Data samples & examples
    ├── user.md                   # User data structure
    └── debug_script.js           # Debug utilities
```

---

## 🔧 Backend Services Architecture

### 🎛️ **Code.js** - Main Entry Points
```javascript
doPost(e)    // Handle trading record submissions
doGet(e)     // Handle data retrieval requests
```

### ⚙️ **Config.js** - Configuration Management
```javascript
CONFIG = {
  SPREADSHEET_ID: "...",
  SHEETS: { ... },
  MESSAGES: { ... },
  DEFAULTS: { ... }
}
```

### 🛠️ **Utils.js** - Utility Functions
```javascript
createUUID()              // Generate unique identifiers
createJSONResponse()      // Standardized API responses
convertSheetDataToJSON()  // Data transformation
validateRequiredParams()  // Input validation
safeParseFloat()         // Safe number parsing
```

### 👤 **AccountService.js** - Account Management
```javascript
getAccounts()            // Retrieve all accounts
getAccountById()         // Get specific account
validateAccountExists()  // Account validation
getAccountSummary()      // Account with statistics
```

### 💰 **AssetService.js** - Asset Management
```javascript
getAssets()              // Retrieve all assets
getAssetById()           // Get specific asset
validateAssetExists()    // Asset validation
getAssetsByType()        // Filter by asset type
getAssetStatistics()     // Asset trading stats
```

### 📈 **TradingService.js** - Trading Operations
```javascript
getTradingHistory()      // Get trading records
addTrade()              // Add new trading record
getTradingStatistics()   // Calculate trading metrics
getRecentTrades()       // Get latest trades
```

### 🧪 **TestFunctions.js** - Testing Suite
```javascript
runAllTests()           // Comprehensive test suite
testGetFunctions()      // Test all GET endpoints
testAddNewTrade()       // Test POST functionality
quickTest()             // Basic connectivity test
```

---

## 🗄️ Database Schema

### 📊 **Trading_Journal** Sheet
| Column | Type | Description |
|--------|------|-------------|
| Transaction_ID | String | UUID primary key |
| Timestamp | DateTime | Record creation time |
| Account ID | String | User account identifier |
| Asset ID | String | Trading asset identifier |
| เงินต้นเริ่มต้นวัน (USD) | Number | Starting balance |
| กำไร/ขาดทุนรายวัน (USD) | Number | Daily profit/loss |
| เงินรวมสิ้นวัน (USD) | Number | Ending balance |
| Lot Size | Number | Trading lot size |
| หมายเหตุ | String | Notes/comments |

### 👥 **Accounts** Sheet
| Column | Type | Description |
|--------|------|-------------|
| Account ID | String | Unique account identifier |
| ชื่อบัญชี | String | Account name |
| ชื่อผู้ใช้/เจ้าของ | String | Account owner name |
| เงินต้นเริ่มต้น (USD) | Number | Initial capital |

### 💎 **Assets** Sheet
| Column | Type | Description |
|--------|------|-------------|
| Asset ID | String | Unique asset identifier |
| ชื่อสินทรัพย์ | String | Asset name |
| ประเภท | String | Asset type (Crypto/Forex) |
| หมายเหตุ | String | Asset notes |

### 🔐 **User** Sheet
| Column | Type | Description |
|--------|------|-------------|
| EmpId | String | Employee ID |
| FullNameTH | String | Full name in Thai |
| Email | String | Email address |
| Role | String | User role (admin/user) |
| Userstatus | Number | Account status (1=active) |
| password | String | Hashed password |

---

## 🌐 API Endpoints

### 📖 **GET Requests**
```
GET {BASE_URL}?action=getAccounts
Response: { status: "success", accounts: [...], count: n }

GET {BASE_URL}?action=getAssets  
Response: { status: "success", assets: [...], count: n }

GET {BASE_URL}?action=getTradingHistory&accountId={id}
Response: { status: "success", trades: [...], accountId: "...", count: n }
```

### 📝 **POST Requests**
```
POST {BASE_URL}
Content-Type: application/x-www-form-urlencoded
Body:
  accountId=405911362
  assetId=1
  startBalance=1000.00
  dailyProfit=25.50
  lotSize=0.05
  notes=Trading notes

Response: { status: "success", message: "...", id: "uuid" }
```

---

## 🎨 Frontend Features

### 🔐 **Authentication System**
- **Account Selection** from Google Sheets
- **Password Protection** with demo authentication
- **Session Management** with logout functionality
- **User-specific Data** filtering

### 📊 **Dashboard Tab**
- **Account Summary** (name, initial capital, trade count)
- **Trading Performance** (total P&L, current balance, win rate)
- **Trading History Table** with sortable columns
- **Real-time Statistics** calculation

### 🚀 **Compound Calculator Tab**
- **Interactive Chart** using Chart.js
- **Customizable Parameters** (capital, duration, exchange rate)
- **Real-time Calculations** with 1% daily growth simulation
- **Multi-currency Support** (USD/THB)

### ✍️ **Trading Recorder Tab**
- **Dynamic Form Entries** with add/remove functionality
- **Auto-calculation** of ending balances
- **Cascading Balance Updates** for multiple entries
- **Batch Submission** with individual error handling
- **Visual Feedback** for successful/failed submissions

---

## 🧪 Testing & Development

### **Thunder Client Collection**
Pre-configured API tests for all endpoints with:
- **Environment Variables** for easy URL management
- **Automated Tests** for response validation
- **Sample Data** for different scenarios
- **Error Handling** verification

### **Built-in Test Functions**
```javascript
runAllTests()        // Complete test suite
testGetFunctions()   // GET endpoint tests
testDoPost()         // POST functionality tests  
testUtilityFunctions() // Helper function tests
```

### **Debug Utilities**
```javascript
debugSheetData()     // Sheet structure analysis
quickTest()          // Basic connectivity check
logError()           // Structured error logging
```

---

## 🚀 Deployment Guide

### **1. Google Sheets Setup**
1. Create new Google Sheets with required sheet names
2. Set up proper column headers
3. Configure sharing permissions

### **2. Google Apps Script Deployment**
1. Create new Apps Script project
2. Copy all `.js` files to the project
3. Update `SPREADSHEET_ID` in Config.js
4. Deploy as Web App with proper permissions

### **3. Frontend Configuration**
1. Update `APPS_SCRIPT_URL` in index.html
2. Test authentication system
3. Verify data synchronization

### **4. Testing & Validation**
1. Run `runAllTests()` in Apps Script
2. Use Thunder Client for API testing
3. Test all frontend functionality
4. Verify error handling scenarios

---

## 🔧 Configuration

### **Environment Variables**
```javascript
// In Config.js
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
  SHEETS: {
    TRADING_JOURNAL: 'Trading_Journal',
    ACCOUNTS: 'Accounts', 
    ASSETS: 'Assets',
    USER: 'user'
  }
}

// In index.html
const APPS_SCRIPT_URL = 'YOUR_DEPLOYED_WEB_APP_URL_HERE';
```

### **Authentication Settings**
```javascript
// Demo authentication (in frontend)
password: 'demo123'  // Change for production use

// Hash generation (in backend)
emailPrefix + empId → SHA-256 hash
```

---

## 📈 Performance & Scalability

### **Optimization Features**
- **Lazy Loading** of data on tab activation
- **Efficient Filtering** using native Array methods
- **Minimal API Calls** with smart caching
- **Error Boundaries** preventing cascade failures

### **Scalability Considerations**
- **Modular Architecture** for easy feature additions
- **Service Separation** for independent maintenance
- **Configurable Limits** for data processing
- **Extensible Authentication** system

---

## 🛡️ Security & Best Practices

### **Data Protection**
- **Input Validation** on all user inputs
- **SQL Injection Prevention** (N/A for Sheets)
- **XSS Protection** through proper encoding
- **Error Information Filtering** in production

### **Code Quality**
- **Consistent Error Handling** across all functions
- **Comprehensive Logging** for debugging
- **Parameter Validation** for all public functions
- **JSDoc Documentation** for maintainability

---

## 📝 Future Enhancements

### **Planned Features**
- [ ] Advanced charting with multiple timeframes
- [ ] Export functionality (PDF/Excel reports)
- [ ] Mobile-responsive design improvements
- [ ] Advanced filtering and search capabilities
- [ ] Backup and restore functionality
- [ ] Multi-language support
- [ ] Advanced user roles and permissions
- [ ] Integration with external trading APIs

### **Technical Improvements**
- [ ] Frontend framework migration (React/Vue)
- [ ] Database migration to dedicated solution
- [ ] Real-time data synchronization
- [ ] Progressive Web App (PWA) features
- [ ] Advanced caching mechanisms
- [ ] Automated testing pipeline

---

## 📞 Support & Maintenance

### **Troubleshooting**
- Use `debugSheetData()` for sheet structure issues
- Check `runAllTests()` results for functionality verification
- Review execution logs in Google Apps Script
- Validate Thunder Client tests for API connectivity

### **Common Issues**
- **Permission Errors**: Check Google Sheets sharing settings
- **Data Not Loading**: Verify SPREADSHEET_ID and sheet names
- **Authentication Issues**: Confirm password settings
- **API Errors**: Validate Apps Script deployment status

---

*Last Updated: September 27, 2025*
*Version: 1.0.0*
*Author: AI Assistant with User Collaboration*