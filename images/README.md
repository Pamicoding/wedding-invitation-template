# Photos

**English** | [繁體中文](README.zh-TW.md)

The images here are generated placeholders. When you swap in your own photos, keep the same file names.

## Required photos

These are all the photo files the site uses:

| File | Used for | Placeholder size |
| --- | --- | --- |
| hero-photo.jpg | Cover / hero image (CSS background) | 1280 × 1920 |
| welcome-photo.jpg | Welcome section background (CSS background) | 1893 × 1920 |
| story-photo-1.jpg | Love story, first photo | 1920 × 1280 |
| story-photo-2.jpg | Love story, second photo | 1280 × 1920 |
| story-photo-3.jpg | Love story, third photo | 1920 × 1324 |
| story-photo-4.jpg | "相·愛" (Fall in Love) chapter | 1365 × 2048 |
| gallery-1.jpg / gallery-2.jpg | Gallery | 1365 × 2048 |
| calendar-photo.jpg | Calendar background | 1277 × 2048 |
| detail-1.jpg / detail-2.jpg | Detail shots beside the countdown | 1365 × 2048 |
| venue-photo.jpg | Venue section | 2048 × 1365 |
| final-photo.jpg | End of the venue section | 2048 × 1365 |
| rsvp-photo.jpg | RSVP section header | 1365 × 2048 |

## Photo specs

### Size
- **Recommended width**: 1200–2000 px
- **Minimum width**: 800 px
- **Aspect ratio**: 3:2 or 4:3 (landscape), 2:3 (portrait)

### Format
- **Recommended**: JPG
- **Alternative**: PNG (larger files)

### File size
- **Per photo**: compress to under 500 KB
- **Maximum**: 2 MB

### Compression tools
- [TinyPNG](https://tinypng.com/): online compressor
- [Squoosh](https://squoosh.app/): Google's image compressor
- [ImageOptim](https://imageoptim.com/): macOS only

## Choosing photos

1. **Good lighting**: pick bright, sharp photos
2. **Clean composition**: avoid cluttered backgrounds
3. **Natural emotion**: show real feelings and interaction
4. **Consistent style**: keep tones and styles similar across photos

## Missing photos

If a file is missing, the site shows a gray placeholder that reads "照片即將上傳" ("photo coming soon").

The rest of the site keeps working, so you can:
1. Deploy the site first
2. Add photos later, one at a time
3. See each photo as soon as it's uploaded

## Adding photos

1. Rename your photos to the file names above
2. Compress them
3. Put them in this `images/` folder
4. Commit and push to GitHub
5. Wait for GitHub Pages to update (usually 1–5 minutes)

## Sample photos

To try the site out, you can use free stock photos for now:
- [Unsplash](https://unsplash.com/s/photos/wedding)
- [Pexels](https://www.pexels.com/search/wedding/)
- [Pixabay](https://pixabay.com/images/search/wedding/)

Follow each site's license terms, and replace them with your own photos before going live.

## Privacy

⚠️ **Photos pushed to a public GitHub repo are public**: anyone can open them by URL. To protect your photos:
1. Add a watermark
2. Use lower-resolution versions
3. Consider a private image host (e.g. Cloudinary, ImgBB)

## Troubleshooting

**Photos look blurry**
- Check that the original resolution is high enough
- Make sure compression didn't lower quality too much

**Photos don't load**
- Check that the file name matches exactly, including case
- Check that the format is .jpg or .png
- Check that the file is actually in the `images/` folder

**Photos load slowly**
- Compress photos to under 500 KB
- Consider WebP (requires editing the HTML)
