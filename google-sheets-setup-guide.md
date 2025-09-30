# Google Sheets Setup Guide for ASUO Events

## 🎯 Overview
This guide will help you set up Google Sheets to automatically update your ASUO website events without touching any code.

## 📋 Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "ASUO Events" or similar

## 📊 Step 2: Set Up Your Column Headers

Create these columns in the first row (exactly as shown):

| Column | Header | Description | Example |
|--------|--------|-------------|---------|
| A | title | Event name | Flock Party |
| B | org | Organization | ASUO |
| C | category | Event category | social |
| D | tags | Tags (separated by semicolons) | free;music;outdoors |
| E | start_date | Event date | 2025-09-27 |
| F | start_time | Start time | 14:00 |
| G | end_time | End time | 16:00 |
| H | location | Location name | EMU Green |
| I | address | Full address | 1395 University St, Eugene, OR |
| J | summary | Event description | Join us for an epic outdoor party! |
| K | rsvp_url | RSVP link (optional) | https://example.com/rsvp |
| L | is_free | Is event free? | true |
| M | capacity | Max capacity | 1000 |

## 📝 Step 3: Add Your Events

Add your events in rows below the headers. Here's an example:

```
title,org,category,tags,start_date,start_time,end_time,location,address,summary,rsvp_url,is_free,capacity
Flock Party,ASUO,social,"free;music;outdoors",2025-09-27,14:00,16:00,EMU Green,"1395 University St, Eugene, OR",Join us for an epic outdoor party! Music food and fun for all Ducks.,,true,1000
Street Faire,ASUO,clubs,"free;vendors;food",2025-10-15,10:00,16:00,13th Avenue,"13th Avenue, Eugene, OR",Explore local vendors food trucks and student organizations at our annual Street Faire.,,true,2000
```

## 🔗 Step 4: Publish Your Sheet

1. Click **File** → **Share** → **Publish to web**
2. Choose **Entire document** and **Comma-separated values (.csv)**
3. Click **Publish**
4. Copy the published URL (it will look like: `https://docs.google.com/spreadsheets/d/e/.../pub?output=csv`)

## ⚙️ Step 5: Update Your Website

1. Open `index.js` in your website files
2. Find the line that says: `const sheetsUrl = 'https://docs.google.com/spreadsheets/d/e/...'`
3. Replace the URL with your published Google Sheets URL
4. Save the file

## 🎉 Step 6: Test It Out

1. Refresh your website
2. Check the browser console (F12) for any errors
3. Your events should now load from Google Sheets!

## 📱 Step 7: Update Events Regularly

Now you can:
- Add new events by adding rows to your Google Sheet
- Edit existing events by changing the data
- Remove events by deleting rows
- Changes will appear on your website within a few minutes

## 🛠️ Troubleshooting

### Events Not Showing?
1. Check that your Google Sheet is published correctly
2. Make sure the URL in `index.js` matches your published sheet
3. Check the browser console for error messages
4. Verify your column headers match exactly

### Wrong Data Format?
- Dates should be in YYYY-MM-DD format
- Times should be in HH:MM format (24-hour)
- Tags should be separated by semicolons (;)
- Boolean values (is_free) should be "true" or "false"

### Need Help?
- Check the browser console (F12) for detailed error messages
- Make sure your Google Sheet is publicly accessible
- Verify all required columns are present

## 📋 Quick Reference

### Required Columns:
- `title` - Event name
- `org` - Organization
- `category` - social, clubs, academic, wellness
- `tags` - free;music;outdoors (separated by semicolons)
- `start_date` - 2025-09-27
- `start_time` - 14:00
- `end_time` - 16:00
- `location` - Location name
- `address` - Full address
- `summary` - Event description

### Optional Columns:
- `rsvp_url` - Link to RSVP
- `is_free` - true/false
- `capacity` - Number

### Category Options:
- `social` - Parties, social events
- `clubs` - Club fairs, organization events
- `academic` - Study groups, workshops
- `wellness` - Yoga, fitness, mental health

## 🎯 Pro Tips

1. **Keep it simple**: Don't overcomplicate your data
2. **Use consistent formatting**: Stick to the same date/time formats
3. **Test changes**: Always check your website after updating the sheet
4. **Backup your data**: Keep a copy of your events in another sheet
5. **Use tags wisely**: Tags help with search and filtering

---

**Need help?** Check the browser console (F12) for detailed error messages or contact your web developer.
