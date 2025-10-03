# MVC Refactoring Documentation

## Overview

ระบบ Google Apps Script ได้รับการ refactor จากโครงสร้าง monolithic ไปเป็น MVC (Model-View-Controller) architecture เพื่อความสะอาดและง่ายต่อการบำรุงรักษา

## 📁 New Directory Structure

```
src/
├── Code.js (legacy - keep for compatibility)
├── Code_MVC.js (new MVC entry point)
├── Config.js
├── Services_*.js (legacy services - keep for compatibility)
│
├── controllers/          # 🎮 Controllers Layer
│   ├── BaseController.js    # Foundation controller class
│   ├── AuthController.js    # Authentication handling
│   ├── TradingController.js # Trading operations
│   ├── AccountController.js # Account management
│   └── AssetController.js   # Asset management
│
├── models/               # 📊 Models Layer
│   ├── BaseModel.js        # Foundation model class with CRUD
│   ├── UserModel.js        # User data access
│   ├── TradingModel.js     # Trading data access
│   ├── AccountModel.js     # Account data access
│   └── AssetModel.js       # Asset data access
│
├── types/                # 📋 Type Definitions
│   ├── ApiResponse.js      # Standardized API responses
│   └── TypeDefinitions.js  # JSDoc type definitions
│
├── utils/                # 🔧 Utility Functions
│   └── UtilityFunctions.js # Common helper functions
│
└── validators/           # ✅ Validation Layer
    └── ValidationService.js # Data validation functions
```

## 🏗️ Architecture Components

### 1. Controllers Layer (`controllers/`)

**BaseController.js** - Foundation class providing:
- Parameter extraction utilities
- Validation helpers
- Authentication methods
- Error handling patterns

**Specific Controllers:**
- **AuthController** - Login, register, password management
- **TradingController** - Trading operations, statistics, portfolio
- **AccountController** - Account CRUD, performance, transfers
- **AssetController** - Asset management, price updates, search

### 2. Models Layer (`models/`)

**BaseModel.js** - Foundation class providing:
- Google Sheets CRUD operations
- Data validation utilities
- Error handling
- Common database patterns

**Specific Models:**
- **UserModel** - User authentication and management
- **TradingModel** - Trading records and statistics
- **AccountModel** - Account operations and access control
- **AssetModel** - Asset management and usage tracking

### 3. Types Layer (`types/`)

**ApiResponse.js** - Standardized response format:
- `success()` - Successful operations
- `error()` - Error responses
- `partial()` - Partial success
- `validationError()` - Validation failures
- `authError()` - Authentication failures

**TypeDefinitions.js** - JSDoc type definitions for better IDE support

### 4. Utils Layer (`utils/`)

**UtilityFunctions.js** - Common utilities:
- UUID generation
- Data processing
- Number parsing
- Date formatting
- HTTP response helpers

### 5. Validators Layer (`validators/`)

**ValidationService.js** - Data validation:
- Required parameter validation
- Business rule validation
- Data format validation
- Sheet structure validation

## 🔄 Migration Guide

### Entry Point Changes

**Old Code.js:**
```javascript
function doPost(e) {
  // Direct business logic handling
  if (action === 'login') {
    // Inline authentication logic...
  }
}
```

**New Code_MVC.js:**
```javascript
function doPost(e) {
  initializeControllers();
  return handlePostRequest(e);
}

function handlePostRequest(e) {
  switch (action) {
    case 'login':
      response = authController.handleLogin({
        username: getParam('username'),
        password: getParam('password')
      });
      break;
  }
}
```

### Controller Usage Pattern

```javascript
class TradingController extends BaseController {
  constructor() {
    super();
    this.tradingModel = new TradingModel();
    this.accountModel = new AccountModel();
  }

  handleAddTrade(data) {
    // 1. Validate parameters
    const validationResult = this.validateRequiredParams(data, ['username', 'account_id']);
    if (!validationResult.isValid) {
      return ApiResponse.validationError(validationResult.message);
    }

    // 2. Check permissions
    if (!this.accountModel.userHasAccess(data.username, data.account_id)) {
      return ApiResponse.error('Access denied', 403);
    }

    // 3. Business logic
    const result = this.tradingModel.addTrade(data);
    
    // 4. Standardized response
    if (result.success) {
      return ApiResponse.success({
        message: 'Trade added successfully',
        trade_id: result.rowIndex
      });
    } else {
      return ApiResponse.error('Failed to add trade: ' + result.error);
    }
  }
}
```

## 📊 Benefits Achieved

### 1. **Separation of Concerns**
- ✅ Controllers handle HTTP requests
- ✅ Models handle data access
- ✅ Services handle business logic
- ✅ Validators handle data validation

### 2. **Code Reusability**
- ✅ BaseModel provides common CRUD operations
- ✅ BaseController provides common request handling
- ✅ ApiResponse ensures consistent responses
- ✅ Utility functions reduce code duplication

### 3. **Maintainability**
- ✅ Clear file organization
- ✅ Standardized error handling
- ✅ Consistent validation patterns
- ✅ TypeScript-like documentation with JSDoc

### 4. **Security Improvements**
- ✅ Centralized authentication checks
- ✅ Consistent permission validation
- ✅ Standardized input sanitization
- ✅ Proper error message handling

### 5. **Testing & Debugging**
- ✅ Isolated components for unit testing
- ✅ Consistent error logging
- ✅ Clear request/response flow
- ✅ Standardized validation messages

## 🔧 Implementation Notes

### Backward Compatibility

- **Legacy Code.js** เก็บไว้เพื่อ compatibility
- **Legacy Services** ยังคงทำงานได้ปกติ
- **Admin endpoints** ยังใช้ legacy functions
- **Gradual migration** สามารถทำได้ทีละส่วน

### Performance Considerations

- **Lazy loading** controllers เมื่อต้องการใช้งาน
- **Efficient validation** ด้วย early return patterns
- **Minimal memory footprint** ด้วย proper object management
- **Google Apps Script optimization** ตาม best practices

### Error Handling Strategy

```javascript
// Consistent error response format
{
  "status": "error",
  "message": "User-friendly error message",
  "code": 400,
  "timestamp": "2025-10-03T00:00:00.000Z",
  "details": { /* additional context */ }
}
```

### Validation Strategy

```javascript
// Consistent validation pattern
const validationResult = this.validateRequiredParams(data, ['param1', 'param2']);
if (!validationResult.isValid) {
  return ApiResponse.validationError(validationResult.message);
}
```

## 🚀 Next Steps

### Phase 1: Core Implementation ✅
- [x] Create MVC foundation
- [x] Implement all Controllers
- [x] Implement all Models
- [x] Create utilities and validators
- [x] Refactor entry point

### Phase 2: Migration & Testing
- [ ] Test all endpoints with MVC
- [ ] Migrate legacy services gradually  
- [ ] Update documentation
- [ ] Performance optimization

### Phase 3: Advanced Features
- [ ] Add caching layer
- [ ] Implement rate limiting
- [ ] Add comprehensive logging
- [ ] Create admin dashboard

## 📚 Usage Examples

### Authentication
```javascript
// POST /exec?action=login
{
  "username": "user@example.com",
  "password": "secure_password"
}
```

### Trading Operations
```javascript
// POST /exec?action=addTrade
{
  "username": "user@example.com",
  "account_id": "ACC001",
  "asset": "BTCUSD",
  "amount": "0.1",
  "action": "BUY",
  "price": "50000"
}
```

### Account Management
```javascript
// GET /exec?action=getAccounts&username=user@example.com
// Response: List of user's accounts with statistics
```

---

**Created:** 2025-10-03  
**Status:** Implementation Complete ✅  
**Next Review:** After testing phase completion