# Capacitor Master Assets

Place your master source images here:

- **`icon.png`** (or `icon-only.png`): Master icon image (recommended size: **1024 x 1024 px**, PNG format).
- **`icon-foreground.png`** & **`icon-background.png`** *(optional)*: For adaptive Android icons.
- **`splash.png`** *(optional)*: Master splash screen (recommended size: **2732 x 2732 px**, PNG format).

---

### Generate Android APK Icons Automatically

Run the following command from the `pomodoro-timer` directory:

```bash
npx @capacitor/assets generate --android
```

This will automatically resize and copy all necessary icon densities into [android/app/src/main/res/](file:///D:/Programming%20projects/pomodoro%20timer/pomodoro-timer/android/app/src/main/res).
