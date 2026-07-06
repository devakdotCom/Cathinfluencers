Place the five optimized leader portraits in this folder with these exact names:

pope.webp
archbishop.webp
priest.webp
operations.webp
cto.webp

Recommended export:
- WebP format
- Square crop (for example 800 x 800 pixels)
- 100 KB to 300 KB per image
- sRGB color profile

Vite copies this folder into dist/leaders during npm run build, and Firebase Hosting
serves the images directly from its CDN. If a file is absent, the app displays its
built-in illustrated fallback.
