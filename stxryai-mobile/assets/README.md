# Assets Directory

This directory contains all static assets for the StxryAI mobile app.

## Required Assets

### Fonts (`fonts/`)
The following font files are referenced in the app but are optional (system fonts will be used as fallback):
- `BricolageGrotesque-Regular.ttf`
- `BricolageGrotesque-Bold.ttf`
- `Sora-Regular.ttf`
- `Sora-SemiBold.ttf`
- `Sora-Bold.ttf`
- `InstrumentSerif-Regular.ttf`
- `InstrumentSerif-Italic.ttf`

### Images
- `icon.png` - App icon (1024x1024)
- `splash.png` - Splash screen image
- `adaptive-icon.png` - Android adaptive icon
- `favicon.png` - Web favicon
- `notification-icon.png` - Notification icon

## Adding Assets

1. Place font files in the `fonts/` subdirectory
2. Place image files in the root `assets/` directory
3. Run `npx expo prebuild` if you've added native assets

## Font Sources

You can download the fonts from:
- Bricolage Grotesque: [Google Fonts](https://fonts.google.com/specimen/Bricolage+Grotesque)
- Sora: [Google Fonts](https://fonts.google.com/specimen/Sora)
- Instrument Serif: [Google Fonts](https://fonts.google.com/specimen/Instrument+Serif)

