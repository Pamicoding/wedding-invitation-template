# Wedding Invitation Template

**English** | [繁體中文](README.zh-TW.md)

A mobile-first, single-page wedding invitation site in plain HTML, CSS and JavaScript. It needs no build step and deploys straight to GitHub Pages.
The RSVP form checks guests against a guest list through Google Apps Script and writes each reply to Google Sheets, so the site has no server of its own.

> The site's UI text is in Traditional Chinese. All personal content is marked with `{{PLACEHOLDER}}` tokens so you can swap in your own.

## Features

- **Guest-list validation**: only invited guests can fill in the form, and guests who have already replied are stopped from replying again
- **Conditional RSVP form**: asks about the ceremony and the dinner separately, then shows plus-one count, meal preference, shared meals and high chairs based on the answers
- **Meal totals**: counts meat and vegetarian meals automatically, ready to confirm with the venue
- **Countdown timer** and an **auto-generated calendar** for the wedding month
- **Demo mode**: before a backend is set up, any name passes validation and submissions are only logged to the console
- **Responsive design**, built for phones first

## Project structure

```
├── index.html          # Main page (content marked with {{PLACEHOLDER}})
├── css/styles.css      # Styles
├── js/script.js        # Interaction logic; the CONFIG block at the top holds the settings
├── images/             # Photos (currently generated placeholders)
└── convert_guests.py   # Converts a CSV guest list to JSON
```

## Quick start

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

The full page works with no setup, and the RSVP form runs in demo mode.

## Customization

### 1. Text: replace the placeholders in `index.html`

| Placeholder | Meaning |
| --- | --- |
| `{{GROOM_NAME}}` / `{{BRIDE_NAME}}` | Groom's / bride's name |
| `{{YYYY.MM.DD}}`, `{{MM.DD}}`, `{{MM/DD}}` | Wedding date in different formats |
| `{{YYYY年M月D日 星期X}}` | Full date in Chinese, e.g. `2050年5月20日 星期五` |
| `{{VENUE_NAME}}` | Venue name |
| `{{VENUE_ADDRESS_URL_ENCODED}}` | URL-encoded venue address for the map; you can also paste a Google Maps embed iframe instead |
| `{{YEAR_MET}}` | Year the couple met |
| `{{STORY_POEM_LINE_1..4}}` | Short poem in the love-story section |
| `{{COUNTDOWN_MESSAGE_LINE_1..3}}` | Text beside the countdown |
| `{{CEREMONY_CHECKIN}}` / `{{CEREMONY_START}}` | Ceremony check-in / start time |
| `{{DINNER_CHECKIN}}` / `{{DINNER_START}}` | Dinner check-in / start time |
| `{{YEAR}}` | Year in the footer |

To check that nothing is left:

```bash
grep -n "{{" index.html
```

### 2. Settings: edit `CONFIG` at the top of `js/script.js`

```javascript
const CONFIG = {
    weddingDate: '2050-05-20T18:00:00',                 // drives the countdown and the calendar
    appsScriptUrl: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',  // leave as-is for demo mode
};
```

### 3. Photos

Replace the placeholder images in `images/` with your own photos and keep the same file names. See [images/README.md](images/README.md) for what each photo is used for and its recommended aspect ratio.

## Google Sheets backend

### Create the spreadsheet

Create a Google Sheet with two tabs:

- **`Guests`**: the guest list, with columns `name | ceremony | message`
  - `ceremony`: `TRUE` if the guest is invited to the ceremony
  - `message`: optional personal message the guest sees after submitting
- **`Responses`**: where replies are stored; put headers in the first row matching the fields in `appendRow` below

### Apps Script

In the spreadsheet, open **Extensions → Apps Script** and paste:

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

### Deploy

1. Choose **Deploy → New deployment → Web app**
2. Set "Execute as" to **Me** and "Who has access" to **Anyone**
3. Put the Web App URL into `CONFIG.appsScriptUrl`

> The form POSTs in `no-cors` mode, so the browser can't read the response and always shows the thank-you message. Check the sheet to confirm replies are arriving.

## Deploy to GitHub Pages

1. Push the project to GitHub
2. Go to **Settings → Pages** and set the source to the `main` branch
3. After a few minutes the site is live at `https://<username>.github.io/<repository>/`

## License and assets

- Fonts: Noto Serif TC, Cormorant Garamond, Great Vibes, Lavishly Yours, Aref Ruqaa Ink and LXGW WenKai TC, all loaded from Google Fonts under the SIL Open Font License
- The images in `images/` are generated placeholders
