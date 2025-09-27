# ตัวอย่าง JSON ที่ frontend ควรส่งไป backend (กรณีออก order หลายครั้งในวันเดียวกัน โดยต้องใส่ tradeDate ทุก record):
[
  {
    "accountId": "405911362",
    "assetId": "1",
    "startBalance": 1000,
    "dailyProfit": 2,
    "lotSize": 0.01,
    "notes": "order 1",
    "tradeDate": "2025-09-27"
  },
  {
    "accountId": "405911362",
    "assetId": "1",
    "startBalance": 1002,
    "dailyProfit": 1,
    "lotSize": 0.01,
    "notes": "order 2",
    "tradeDate": "2025-09-27"
  },
  {
    "accountId": "405911362",
    "assetId": "1",
    "startBalance": 1003,
    "dailyProfit": -1,
    "lotSize": 0.01,
    "notes": "order 3",
    "tradeDate": "2025-09-27"
  },
  {
    "accountId": "405911362",
    "assetId": "1",
    "startBalance": 1002,
    "dailyProfit": 0,
    "lotSize": 0.01,
    "notes": "order 4",
    "tradeDate": "2025-09-27"
  },
  {
    "accountId": "405911362",
    "assetId": "1",
    "startBalance": 1002,
    "dailyProfit": 2,
    "lotSize": 0.01,
    "notes": "order 5",
    "tradeDate": "2025-09-27"
  },
  {
    "accountId": "405911362",
    "assetId": "1",
    "startBalance": 1004,
    "dailyProfit": -1,
    "lotSize": 0.01,
    "notes": "order 6",
    "tradeDate": "2025-09-27"
  }
]