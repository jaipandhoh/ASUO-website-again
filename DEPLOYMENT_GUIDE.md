# Deployment Guide - Handling Large Files

## Problem
GitHub has a **100MB file size limit** for individual files. If you're getting "file too large" errors, follow these steps:

## Solution 1: Exclude Large Images Temporarily

The most likely large files are:
- Director photos (JPG files like `Prissila Moreno.jpg`, `Jai Pandhoh.jpg`, etc.)
- Media day photos (`asuo media day 3-16.jpg`, etc.)

### Steps:
1. **Temporarily exclude images** by uncommenting these lines in `.gitignore`:
   ```
   *.jpg
   *.png
   !2024-ASUO-Seal-BLK.png
   ```
   (This keeps the logo but excludes other images)

2. **Push the code first** (without images)

3. **Optimize images** using a tool like:
   - [TinyPNG](https://tinypng.com/) - Compresses JPG/PNG
   - [Squoosh](https://squoosh.app/) - Google's image optimizer
   - ImageMagick or similar tools

4. **After optimization**, remove the image exclusion and add optimized images

## Solution 2: Use Git LFS (Large File Storage)

If you need to keep large files:

```bash
# Install Git LFS (if not already installed)
git lfs install

# Track large image files
git lfs track "*.jpg"
git lfs track "*.png"

# Add .gitattributes
git add .gitattributes

# Then commit and push normally
```

## Solution 3: Host Images Externally

Upload images to:
- Google Drive (and link publicly)
- Imgur
- Cloudinary
- Or any image hosting service

Then update your HTML to use the external URLs instead of local files.

## Quick Fix - Exclude All Images Now

If you need to deploy immediately, add this to `.gitignore`:

```
# Temporarily exclude all images
*.jpg
*.png
!2024-ASUO-Seal-BLK.png
```

Then optimize and add images back later.

