# StxryAI Mobile App

> 🚀 A revolutionary interactive storytelling experience for iOS and Android

## Overview

StxryAI Mobile brings the magic of interactive storytelling to your fingertips. Built with Expo and React Native, this app delivers a seamless, beautiful experience across all devices.

## Features

- 📚 **Interactive Stories** - AI-generated branching narratives
- 👨‍👩‍👧‍👦 **Kids Zone** - Safe, age-appropriate content for children
- 🎨 **Beautiful UI** - Nebula design system with smooth animations
- 🔔 **Push Notifications** - Stay updated on new stories
- 📖 **Offline Reading** - Download stories for offline access
- 🎙️ **Voice Narration** - AI-powered text-to-speech
- 🏆 **Achievements** - Gamified reading experience

## Tech Stack

- **Framework**: Expo SDK 52 + React Native 0.76
- **Navigation**: Expo Router 4 (file-based routing)
- **Animations**: React Native Reanimated 3
- **State Management**: Zustand
- **Backend**: Supabase
- **Styling**: Custom design system (Nebula UI)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`) for building

### Installation

```bash
# Clone the repository
cd stxryai-mobile

# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Devices

```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android

# Web browser
npm run web
```

### Building for Production

```bash
# Configure EAS Build (first time only)
eas build:configure

# Build for Android
npm run build:android

# Build for iOS
npm run build:ios

# Build for both platforms
npm run build:all
```

## Project Structure

```
stxryai-mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── library.tsx    # User's library
│   │   ├── create.tsx     # Story creation
│   │   ├── discover.tsx   # Browse stories
│   │   └── profile.tsx    # User profile
│   ├── kids-zone/         # Kids Zone screens
│   ├── story/[id].tsx     # Story reader
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable components
│   │   ├── nebula/       # Nebula UI components
│   │   └── kids/         # Kids Zone components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── services/         # API services
│   ├── stores/           # Zustand stores
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, etc.
└── app.json             # Expo config
```

## Design System

The app uses the **Nebula UI** design system, featuring:

- Dark theme with vibrant accents
- Smooth spring animations
- Haptic feedback
- Glassmorphism effects
- Custom typography (Sora, Instrument Serif)

### Color Palette

- Primary: `#00ffd5` (Cyan)
- Secondary: `#9b5de5` (Violet)
- Accent: `#f15bb5` (Pink)
- Background: `#000000` → `#0f0f1e`

## Kids Zone

A special mode for young readers featuring:

- Age-appropriate content filtering
- Parental controls and PIN protection
- Screen time limits
- Progress tracking for parents
- Fun, bouncy animations

## Environment Variables

Create a `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Publishing to App Stores

### iOS App Store

1. Create an Apple Developer account
2. Configure app in App Store Connect
3. Build with `eas build --platform ios`
4. Submit with `eas submit --platform ios`

### Google Play Store

1. Create a Google Play Developer account
2. Create app in Play Console
3. Build with `eas build --platform android`
4. Submit with `eas submit --platform android`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Proprietary - StxryAI © 2024


