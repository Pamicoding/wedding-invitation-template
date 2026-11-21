# 婚禮邀請網站模板

[English](README.md) | **繁體中文**

以手機為主的單頁婚禮邀請網站，純 HTML / CSS / JavaScript，不需要建置工具，可以直接部署到 GitHub Pages。
RSVP 表單透過 Google Apps Script 驗證賓客名單，並把回覆寫進 Google Sheets。

## 功能

- **賓客名單驗證**：只有名單上的賓客能填表，已回覆過的賓客會被擋下
- **條件式 RSVP 表單**：證婚和晚宴分開詢問，再依回答展開攜伴人數、葷素、共食、兒童椅等欄位
- **餐點統計**：自動計算葷食和素食總數，方便和餐廳確認
- **倒數計時**與**自動產生的當月日曆**
- **Demo 模式**：還沒設定後端時，任何姓名都能試填表單，資料只會印在 console
- **響應式設計**，以手機版為主

## 專案結構

```
├── index.html          # 主頁面（文字內容以 {{PLACEHOLDER}} 標示）
├── css/styles.css      # 樣式
├── js/script.js        # 互動邏輯，最上方的 CONFIG 是設定區
├── images/             # 照片（目前放的是佔位圖）
└── convert_guests.py   # 把 CSV 賓客名單轉成 JSON 的工具
```

## 快速開始

```bash
python3 -m http.server 8000
# 打開 http://localhost:8000
```

不需要任何設定就能看到完整頁面，RSVP 表單會以 Demo 模式運作。

## 自訂內容

### 1. 文字：替換 `index.html` 裡的佔位符

| 佔位符 | 說明 |
| --- | --- |
| `{{GROOM_NAME}}` / `{{BRIDE_NAME}}` | 新郎 / 新娘姓名 |
| `{{YYYY.MM.DD}}`、`{{MM.DD}}`、`{{MM/DD}}`、`{{YYYY年M月D日 星期X}}` | 婚禮日期的各種格式 |
| `{{VENUE_NAME}}` | 場地名稱 |
| `{{VENUE_ADDRESS_URL_ENCODED}}` | 地圖用的地址（URL encode 過），也可以直接換成 Google Maps 的嵌入 iframe |
| `{{YEAR_MET}}` | 相識的年份 |
| `{{STORY_POEM_LINE_1..4}}` | 愛情故事區的短詩 |
| `{{COUNTDOWN_MESSAGE_LINE_1..3}}` | 倒數計時旁的文字 |
| `{{CEREMONY_CHECKIN}}` / `{{CEREMONY_START}}` | 證婚的報到 / 開始時間 |
| `{{DINNER_CHECKIN}}` / `{{DINNER_START}}` | 晚宴的報到 / 開始時間 |
| `{{YEAR}}` | footer 的年份 |

可以用下面的指令確認是否都替換完了：

```bash
grep -n "{{" index.html
```

### 2. 設定：修改 `js/script.js` 最上方的 `CONFIG`

```javascript
const CONFIG = {
    weddingDate: '2050-05-20T18:00:00',                 // 倒數計時和日曆都依這個日期產生
    appsScriptUrl: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',  // 保留預設值就是 Demo 模式
};
```

### 3. 照片

把 `images/` 裡的佔位圖換成你的照片，檔名維持不變。每張照片的用途和建議比例請見 [images/README.zh-TW.md](images/README.zh-TW.md)。

## 設定 Google Sheets 後端

### 3.1 建立試算表

建立一份 Google 試算表，裡面要有兩個工作表：

- **`Guests`**：賓客名單，欄位依序是 `name | ceremony | message`
  - `ceremony`：`TRUE` 代表有邀請參加證婚
  - `message`：選填，賓客送出表單後會看到這段個人化訊息
- **`Responses`**：存放回覆，第一列放下方 `appendRow` 裡對應的欄位標題

### 3.2 Apps Script

在試算表選「擴充功能 → Apps Script」，貼上以下程式碼：

```javascript
function doGet(e) {
  const name = (e.parameter.name || '').trim();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const guests = ss.getSheetByName('Guests').getDataRange().getValues().slice(1);
  const guest = guests.find(row => String(row[0]).trim() === name);

  if (!guest) return json({ found: false });

  const responded = ss.getSheetByName('Responses').getDataRange().getValues()
    .slice(1).some(row => String(row[1]).trim() === name);

  return json({
    found: true,
    ceremony: guest[1] === true || String(guest[1]).toUpperCase() === 'TRUE',
    message: guest[2] || '',
    alreadySubmitted: responded,
  });
}

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Responses').appendRow([
    d.timestamp, d.name,
    d.attendCeremony, d.plusCeremonyOne, d.bringCeremonyCount,
    d.attendDinner, d.plusDinnerOne, d.bringDinnerCount,
    d.selfDiet, d.guestMeatCount, d.guestVegCount, d.guestSharedCount,
    d.totalMeatMeals, d.totalVegMeals, d.highChairCount,
    d.email, d.message,
  ]);
  return json({ result: 'success' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 3.3 部署

1. 選「部署 → 新增部署作業 → 網頁應用程式」
2. 執行身分選「我」，存取權選「所有人」
3. 把產生的 Web App URL 填進 `CONFIG.appsScriptUrl`

> 前端用 `no-cors` 送出 POST，所以瀏覽器拿不到回應內容，送出後一律顯示感謝訊息。請到 Sheets 確認資料有沒有寫進去。

## 部署到 GitHub Pages

1. 把專案推到 GitHub
2. 到 Settings → Pages，Source 選 `main` 分支
3. 幾分鐘後網站會出現在 `https://<username>.github.io/<repository>/`

## 授權與素材

- 字型：Noto Serif TC、Cormorant Garamond、Great Vibes、Lavishly Yours、Aref Ruqaa Ink、LXGW WenKai TC，全部透過 Google Fonts 載入，使用 SIL Open Font License
- `images/` 裡的圖片都是程式產生的佔位圖
