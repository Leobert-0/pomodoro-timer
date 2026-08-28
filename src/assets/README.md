# App Icon Assets Guide

Store your icon images in one of the following locations depending on your use case:

### 1. Browser Favicon & Web App Icon (Recommended for Vite)
- **Location:** `public/pomodoro-icon.svg` or `public/icon.png`
- **File:** [public/pomodoro-icon.svg](file:///D:/Programming%20projects/pomodoro%20timer/pomodoro-timer/public/pomodoro-icon.svg)
- **Usage:** Referenced automatically in `index.html` via `<link rel="icon" ... />`. You can overwrite or replace this file with your own PNG or SVG icon.

### 2. React Components
- **Location:** `src/assets/`
- **File:** [src/assets/pomodoro-icon.svg](file:///D:/Programming%20projects/pomodoro%20timer/pomodoro-timer/src/assets/pomodoro-icon.svg)
- **Usage:** In your React code:
  ```tsx
  import pomodoroIcon from './assets/pomodoro-icon.svg';
  // or import pomodoroIcon from './assets/icon.png';
  ```

### 3. Mobile / Capacitor Icon Generation (Android)
- **Location:** `resources/`
- Place your 1024x1024 master icon as `resources/icon.png`.
- You can generate all Android mipmap icons using `@capacitor/assets`:
  ```bash
  npx @capacitor/assets generate
  ```
