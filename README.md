# ASUO Website

Official website for the Associated Students of the University of Oregon (ASUO).

## Features

- Responsive design for all devices
- Dynamic event loading from Google Sheets
- Interactive blob cursor (desktop only)
- Modern, accessible UI with ASUO branding

## Deployment

This site is designed to work with GitHub Pages. Simply push the files to your repository and enable GitHub Pages in the repository settings.

### GitHub Pages Setup

1. Push all files to your GitHub repository
2. Go to Settings → Pages
3. Select your branch (usually `main` or `master`)
4. Select `/ (root)` as the source folder
5. Click Save

Your site will be available at: `https://[your-username].github.io/[repository-name]`

## File Structure

- `index.html` - Main homepage
- `index.css` - Main stylesheet
- `index.js` - Main JavaScript functionality
- `blob-cursor.css` & `blob-cursor.js` - Interactive cursor (homepage only)
- `*.html` - Individual page files
- `*.css` - Page-specific stylesheets
- `*.jpg`, `*.png` - Images and assets

## External Dependencies

- Google Sheets (for event data)
- Font Awesome (CDN)
- Google Fonts (CDN)

## Notes

- Events are loaded dynamically from a Google Sheet
- The blob cursor only appears on desktop devices (hidden on mobile)
- All images should be optimized before deployment

