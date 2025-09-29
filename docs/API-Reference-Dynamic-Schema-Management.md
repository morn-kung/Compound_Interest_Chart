# API Reference - Dynamic Schema Management

## 📚 Complete API Documentation

This document provides comprehensive API reference for the enhanced Config.js dynamic schema management system.

---

## 🔧 Core Functions

### `loadSchemasFromSheets()`

**Purpose**: Load SHEET_SCHEMAS dynamically from Google Sheets

**Syntax**:
```javascript
loadSchemasFromSheets()
```

**Parameters**: None

**Returns**: 
```javascript
{
  Trading_Journal: { headers: [...], dataTypes: [...] },
  user: { headers: [...], dataTypes: [...] },
  // ... other sheets
}
```

**Process**:
1. Calls `checkSheetDatatypes()` to scan Google Sheets
2. Converts array format to schema object format
3. Updates global `SHEET_SCHEMAS` variable
4. Calls `regenerateColumns()` to update column mappings
5. Logs success/failure message

**Error Handling**:
- Falls back to static SHEET_SCHEMAS on failure
- Logs warning message with error details
- Returns static schemas as fallback

**Example**:
```javascript
try {
  const schemas = loadSchemasFromSheets();
  console.log('Loaded schemas for:', Object.keys(schemas));
} catch (error) {
  console.error('Failed to load schemas:', error);
}
```

---

### `regenerateColumns()`

**Purpose**: Generate COLUMNS mapping from current SHEET_SCHEMAS

**Syntax**:
```javascript
regenerateColumns()
```

**Parameters**: None

**Returns**: None (updates global variables)

**Process**:
1. Clears existing `COLUMNS` object
2. Iterates through `SHEET_SCHEMAS`
3. Creates column index mappings for each sheet
4. Updates `CONFIG.COLUMNS` with structured mappings
5. Provides safe fallback values

**Side Effects**:
- Updates global `COLUMNS` variable
- Updates `CONFIG.COLUMNS` object
- Ensures all expected column constants are available

**Example**:
```javascript
// After updating SHEET_SCHEMAS manually
SHEET_SCHEMAS.user.headers.push('newColumn');
regenerateColumns(); // Update column mappings

// Now you can access the new column
const newColumnIndex = COLUMNS.user['newColumn'];
```

---

### `getSheetSchemas()`

**Purpose**: Get current SHEET_SCHEMAS (static or dynamically loaded)

**Syntax**:
```javascript
getSheetSchemas()
```

**Parameters**: None

**Returns**: 
```javascript
Object.<string, SheetSchema>
```

**Example**:
```javascript
const allSchemas = getSheetSchemas();

// Iterate through all schemas
Object.keys(allSchemas).forEach(sheetName => {
  const schema = allSchemas[sheetName];
  console.log(`${sheetName}: ${schema.headers.length} columns`);
});
```

---

### `getSheetSchema(sheetName)`

**Purpose**: Get schema for a specific sheet

**Syntax**:
```javascript
getSheetSchema(sheetName)
```

**Parameters**:
- `sheetName` (string): Name of the sheet

**Returns**: 
```javascript
SheetSchema | null
```

**SheetSchema Object**:
```javascript
{
  headers: string[],    // Column names
  dataTypes: string[]   // Data types for each column
}
```

**Example**:
```javascript
const userSchema = getSheetSchema('user');
if (userSchema) {
  console.log('User sheet headers:', userSchema.headers);
  console.log('User sheet data types:', userSchema.dataTypes);
} else {
  console.log('User schema not found');
}
```

---

## 🌐 HTTP API Endpoints

### `POST /exec?action=refreshSchemas`

**Purpose**: Refresh SHEET_SCHEMAS from Google Sheets via HTTP

**Authentication**: Required (admin token)

**Request**:
```bash
curl -X POST "https://script.google.com/.../exec" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=refreshSchemas&token=your_admin_token"
```

**Response Success**:
```json
{
  "status": "success",
  "message": "SHEET_SCHEMAS refreshed successfully",
  "schemas": {
    "Trading_Journal": { "headers": [...], "dataTypes": [...] },
    "user": { "headers": [...], "dataTypes": [...] }
  }
}
```

**Response Error**:
```json
{
  "status": "error",
  "message": "Failed to refresh schemas: [error details]"
}
```

---

### `POST /exec?action=getSchemas`

**Purpose**: Get current SHEET_SCHEMAS via HTTP

**Authentication**: Required (admin token)

**Request**:
```bash
curl -X POST "https://script.google.com/.../exec" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=getSchemas&token=your_admin_token"
```

**Response**:
```json
{
  "status": "success",
  "message": "Current SHEET_SCHEMAS retrieved",
  "schemas": {
    "Trading_Journal": {
      "headers": ["Transaction_ID", "Timestamp", ...],
      "dataTypes": ["string", "object (Date)", ...]
    },
    "user": {
      "headers": ["EmpId", "FullNameTH", ...],
      "dataTypes": ["number", "string", ...]
    }
  }
}
```

---

### `POST /exec?action=validateSheetsWithSchemas`

**Purpose**: Validate all sheets against their schemas

**Authentication**: Required (admin token)

**Request**:
```bash
curl -X POST "https://script.google.com/.../exec" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=validateSheetsWithSchemas&token=your_admin_token"
```

**Response**:
```json
{
  "status": "success",
  "message": "Sheet validation completed",
  "results": {
    "user": {
      "exists": true,
      "hasValidHeaders": true,
      "missingHeaders": [],
      "extraHeaders": [],
      "rowCount": 10,
      "columnCount": 8,
      "expectedDataTypes": ["number", "string", ...]
    },
    "Trading_Journal": {
      "exists": true,
      "hasValidHeaders": false,
      "missingHeaders": ["Trade Date"],
      "extraHeaders": ["Unused Column"],
      "rowCount": 100,
      "columnCount": 11
    }
  }
}
```

---

### `POST /exec?action=refreshAndValidate`

**Purpose**: Refresh schemas and validate all sheets in one operation

**Authentication**: Required (admin token)

**Request**:
```bash
curl -X POST "https://script.google.com/.../exec" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=refreshAndValidate&token=your_admin_token"
```

**Response**:
```json
{
  "status": "success",
  "message": "Sheet validation completed",
  "results": {
    // Same as validateSheetsWithSchemas response
  }
}
```

---

## 🔍 Validation Functions

### `validateAllSheetsAgainstSchemas()`

**Purpose**: Validate all sheets against their SHEET_SCHEMAS

**Syntax**:
```javascript
validateAllSheetsAgainstSchemas()
```

**Parameters**: None

**Returns**:
```javascript
{
  status: 'success' | 'error',
  message: string,
  results: {
    [sheetName]: ValidationResult
  }
}
```

**ValidationResult Object**:
```javascript
{
  exists: boolean,              // Sheet exists in Google Sheets
  hasValidHeaders: boolean,     // All expected headers present
  missingHeaders: string[],     // Headers missing from sheet
  extraHeaders: string[],       // Unexpected headers in sheet
  rowCount: number,            // Number of rows in sheet
  columnCount: number,         // Number of columns in sheet
  expectedDataTypes: string[]  // Expected data types from schema
}
```

**Example**:
```javascript
const validation = validateAllSheetsAgainstSchemas();

if (validation.status === 'success') {
  Object.keys(validation.results).forEach(sheetName => {
    const result = validation.results[sheetName];
    
    if (!result.hasValidHeaders) {
      console.warn(`Sheet ${sheetName} has issues:`);
      console.warn('Missing:', result.missingHeaders);
      console.warn('Extra:', result.extraHeaders);
    }
  });
}
```

---

### `validateSheetAgainstSchema(sheetName)`

**Purpose**: Validate a specific sheet against its schema

**Syntax**:
```javascript
validateSheetAgainstSchema(sheetName)
```

**Parameters**:
- `sheetName` (string): Name of the sheet to validate

**Returns**:
```javascript
{
  status: 'success' | 'error',
  message: string,
  validation: ValidationResult | null
}
```

**Example**:
```javascript
const userValidation = validateSheetAgainstSchema('user');

if (userValidation.status === 'success') {
  const result = userValidation.validation;
  console.log(`User sheet validation:`, {
    valid: result.hasValidHeaders,
    missing: result.missingHeaders,
    extra: result.extraHeaders
  });
}
```

---

### `refreshSchemasAndValidate()`

**Purpose**: Refresh schemas from Google Sheets and validate all sheets

**Syntax**:
```javascript
refreshSchemasAndValidate()
```

**Parameters**: None

**Returns**: Same as `validateAllSheetsAgainstSchemas()`

**Process**:
1. Calls `loadSchemasFromSheets()` to refresh schemas
2. Calls `validateAllSheetsAgainstSchemas()` to validate
3. Returns validation results

**Example**:
```javascript
const result = refreshSchemasAndValidate();

console.log('Refresh and validation result:', {
  status: result.status,
  sheetsValidated: Object.keys(result.results || {}).length
});
```

---

## 🛠️ Administrative Functions

### `testSchemaManagement()`

**Purpose**: Comprehensive test of schema management system

**Location**: `AdminSchemaFunctions.js`

**Syntax**:
```javascript
testSchemaManagement()
```

**Returns**:
```javascript
{
  status: 'success' | 'error',
  message: string,
  currentSchemas: Object,
  dynamicSchemas: Object,
  updatedSchemas: Object,
  validationResult: Object
}
```

**Example**:
```javascript
const testResult = testSchemaManagement();
console.log('Schema management test:', testResult.status);
```

---

### `initializeSystem()`

**Purpose**: Initialize system with dynamic schemas and validation

**Location**: `AdminSchemaFunctions.js`

**Syntax**:
```javascript
initializeSystem()
```

**Returns**:
```javascript
{
  status: 'success' | 'warning' | 'error',
  message: string,
  schemas: Object,
  validation: Object,
  issues: Array
}
```

**Example**:
```javascript
const init = initializeSystem();

if (init.status === 'success') {
  console.log('✅ System initialized successfully');
} else if (init.status === 'warning') {
  console.warn('⚠️ System initialized with issues:', init.issues);
}
```

---

### `checkSchemaSync()`

**Purpose**: Check if current schemas match Google Sheets reality

**Location**: `AdminSchemaFunctions.js`

**Syntax**:
```javascript
checkSchemaSync()
```

**Returns**:
```javascript
{
  status: 'success' | 'warning' | 'error',
  message: string,
  inSync: boolean,
  differences: Array,
  currentSchemas: Object,
  freshSchemas: Object
}
```

**Difference Object**:
```javascript
{
  sheet: string,
  type: 'missing_in_config' | 'missing_in_sheets' | 'header_mismatch' | 'datatype_mismatch',
  current?: Array,
  fresh?: Array,
  details?: string
}
```

**Example**:
```javascript
const syncCheck = checkSchemaSync();

if (!syncCheck.inSync) {
  console.warn('Schema sync issues:');
  syncCheck.differences.forEach(diff => {
    console.warn(`${diff.sheet}: ${diff.type}`);
  });
  
  // Optionally refresh schemas
  loadSchemasFromSheets();
}
```

---

### `generateSystemReport()`

**Purpose**: Generate comprehensive system report

**Location**: `AdminSchemaFunctions.js`

**Syntax**:
```javascript
generateSystemReport()
```

**Returns**:
```javascript
{
  status: 'success' | 'error',
  message: string,
  report: {
    timestamp: string,
    schemas: Object,
    schemaSync: Object,
    validation: Object,
    systemHealth: Object
  }
}
```

**Example**:
```javascript
const report = generateSystemReport();

if (report.status === 'success') {
  console.log('System Report Generated:');
  console.log('- Timestamp:', report.report.timestamp);
  console.log('- Schemas loaded:', Object.keys(report.report.schemas).length);
  console.log('- Sync status:', report.report.schemaSync.inSync);
  console.log('- Validation status:', report.report.validation.status);
}
```

---

## 📊 Data Types & Constants

### SheetSchema Type Definition

```javascript
/**
 * @typedef {Object} SheetSchema
 * @property {string[]} headers - List of column names
 * @property {string[]} dataTypes - List of data types for each column
 */
```

### Column Access Constants

After calling `regenerateColumns()`, you can access columns via:

```javascript
// Direct column access
COLUMNS.user['EmpId']           // 0
COLUMNS.user['Email']           // 2
COLUMNS.Trading_Journal['Transaction_ID']  // 0

// Structured access via CONFIG
CONFIG.COLUMNS.USER.EMP_ID      // 0
CONFIG.COLUMNS.USER.EMAIL       // 2
CONFIG.COLUMNS.TRADING_JOURNAL  // { Transaction_ID: 0, ... }
```

### Data Type Values

Supported data types in schemas:
- `"string"` - Text values
- `"number"` - Numeric values  
- `"object (Date)"` - Date objects
- `"object"` - Other objects
- `"boolean"` - Boolean values

---

## ⚡ Performance Considerations

### Function Performance

| Function | Performance | Use Case |
|----------|-------------|----------|
| `getSheetSchemas()` | Fast | Frequent access to schemas |
| `getSheetSchema(name)` | Fast | Single sheet schema access |
| `regenerateColumns()` | Medium | After schema updates |
| `loadSchemasFromSheets()` | Slow | Initial load or refresh |
| `validateAllSheetsAgainstSchemas()` | Slow | Comprehensive validation |

### Best Practices

1. **Cache Results**: Store schema results for repeated use
2. **Batch Operations**: Use `refreshAndValidate()` instead of separate calls
3. **Conditional Refresh**: Only refresh when needed
4. **Error Handling**: Always handle potential failures

```javascript
// Good: Cache schemas for repeated use
const schemas = getSheetSchemas();
Object.keys(schemas).forEach(sheetName => {
  // Use cached schemas
});

// Good: Conditional refresh
if (needsRefresh) {
  loadSchemasFromSheets();
}

// Good: Batch operation
const result = refreshSchemasAndValidate();
```

---

## 🚨 Error Handling

### Common Error Scenarios

1. **Schema Loading Failure**
```javascript
try {
  loadSchemasFromSheets();
} catch (error) {
  console.warn('Using static fallback schemas');
  // System continues with static SHEET_SCHEMAS
}
```

2. **Validation Failure**
```javascript
const validation = validateAllSheetsAgainstSchemas();
if (validation.status === 'error') {
  console.error('Validation failed:', validation.message);
  // Handle validation errors
}
```

3. **Missing Schema**
```javascript
const schema = getSheetSchema('nonexistent');
if (!schema) {
  console.warn('Schema not found for sheet: nonexistent');
  // Handle missing schema
}
```

4. **Column Access Safety**
```javascript
// Safe column access with fallback
const emailIndex = CONFIG.COLUMNS.USER.EMAIL || 2;
const email = userRow[emailIndex];

// Or check before access
if (CONFIG.COLUMNS.USER.EMAIL !== undefined) {
  const email = userRow[CONFIG.COLUMNS.USER.EMAIL];
}
```

---

*API Reference Version: 2.0*  
*Last Updated: September 30, 2025*