var SHEET_SCHEMAS = {
    Trading_Journal: {
    "headers": [
      "Transaction_ID",
      "Timestamp",
      "Account ID",
      "Asset ID",
      "เงินต้นเริ่มต้นวัน (USD)",
      "กำไร/ขาดทุนรายวัน (USD)",
      "เงินรวมสิ้นวัน (USD)",
      "Lot Size",
      "หมายเหตุ",
      "Trade Date"
    ],
    "dataTypes": [
      "string",
      "object (Date)",
      "number",
      "number",
      "number",
      "number",
      "number",
      "number",
      "string",
      "object (Date)"
    ]
  }
}

# all sheet 
[
  {
    "sheetName": "Trading_Journal",
    "status": "OK",
    "headers": [
      "Transaction_ID",
      "Timestamp",
      "Account ID",
      "Asset ID",
      "เงินต้นเริ่มต้นวัน (USD)",
      "กำไร/ขาดทุนรายวัน (USD)",
      "เงินรวมสิ้นวัน (USD)",
      "Lot Size",
      "หมายเหตุ",
      "Trade Date"
    ],
    "dataTypes": [
      "string",
      "object (Date)",
      "number",
      "number",
      "number",
      "number",
      "number",
      "number",
      "string",
      "object (Date)"
    ]
  },
  {
    "sheetName": "Assets",
    "status": "OK",
    "headers": [
      "Asset ID",
      "ชื่อสินทรัพย์",
      "ประเภท",
      "หมายเหตุ"
    ],
    "dataTypes": [
      "number",
      "string",
      "string",
      "string"
    ]
  },
  {
    "sheetName": "Accounts",
    "status": "OK",
    "headers": [
      "Account ID",
      "ชื่อบัญชี",
      "ชื่อผู้ใช้/เจ้าของ",
      "เงินต้นเริ่มต้น (USD)"
    ],
    "dataTypes": [
      "number",
      "string",
      "string",
      "number"
    ]
  },
  {
    "sheetName": "UserTokens",
    "status": "OK",
    "headers": [
      "User ID",
      "Token",
      "Created At"
    ],
    "dataTypes": [
      "number",
      "string",
      "object (Date)"
    ]
  },
  {
    "sheetName": "user",
    "status": "OK",
    "headers": [
      "EmpId",
      "FullNameTH",
      "Email",
      "Role",
      "Userstatus",
      "password",
      "requirePasswordChange",
      "tempPassword"
    ],
    "dataTypes": [
      "number",
      "string",
      "string",
      "string",
      "number",
      "string",
      "string",
      "string"
    ]
  }
]

/**
 * Column index mapping for Trading_Journal
 * @readonly
 */
/**
 * Column index mapping for all sheets (auto-generated from headers)
 * @readonly
 * @type {Object.<string, Object<string, number>>}
 */
var COLUMNS = {};
Object.keys(SHEET_SCHEMAS).forEach(function(sheetName) {
  var cols = {};
  var headers = SHEET_SCHEMAS[sheetName].headers;
  headers.forEach(function(h, idx) { cols[h] = idx; });
  COLUMNS[sheetName] = cols;
});