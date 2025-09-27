function getSpreadsheetSafely()
3:04:51 PM	Info	Using active spreadsheet: Compound_Interest
function getAllSheetNames()
3:03:33 PM	Info	Found 6 sheets: 5 configured, 1 unconfigured
function getAllSheetNames()
3:05:11 PM	Info	Using active spreadsheet: Compound_Interest

function getAllSheetNames()

3:05:41 PM	Notice	Execution started
3:05:43 PM	Info	Found 6 sheets: 5 configured, 1 unconfigured
3:05:44 PM	Info	Using active spreadsheet: Compound_Interest
3:05:45 PM	Error	Error logged: { function: 'compareConfiguredWithActualSheets',
  error: 'TypeError: Cannot read properties of undefined (reading \'spreadsheetName\')',
  stack: 'TypeError: Cannot read properties of undefined (reading \'spreadsheetName\')\n    at compareConfiguredWithActualSheets (Services_System:185:33)\n    at __GS_INTERNAL_top_function_call__.gs:1:8',
  context: {},
  timestamp: '2025-09-27T08:05:45.057Z' }
3:05:45 PM	Notice	Execution completed


function getAccounts()
3:06:27 PM	Notice	Execution started
3:06:27 PM	Error	Error opening spreadsheet: { [Exception: Unexpected error while getting the method or property openById on object SpreadsheetApp.] name: 'Exception' }
3:06:27 PM	Error	Error getting sheet Accounts: [Error: ไม่สามารถเข้าถึง Google Sheets ได้]
3:06:27 PM	Error	Error logged: { function: 'getAccounts',
  error: 'Error: ไม่สามารถเข้าถึง Google Sheets ได้',
  stack: 'Error: ไม่สามารถเข้าถึง Google Sheets ได้\n    at getSpreadsheet (Config:82:11)\n    at getSheet (Config:93:25)\n    at getAccounts (AccountService:12:19)\n    at __GS_INTERNAL_top_function_call__.gs:1:8',
  context: {},
  timestamp: '2025-09-27T08:06:27.865Z' }
3:06:28 PM	Notice	Execution completed