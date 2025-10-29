#!/bin/bash

# Motiv App - Logo & Splash Screen Update Script
echo "🎨 Motiv App Logo & Splash Screen Update Helper"
echo "=============================================="
echo ""

# Check current images
echo "📱 Current Images Location:"
echo "App Icon: assets/images/icon.png (1024x1024px recommended)"
echo "Splash Screen: assets/images/splash-icon.png (200x200px recommended)"
echo "Favicon: assets/images/favicon.png"
echo ""

# Android specific
echo "🤖 Android Images:"
echo "Foreground: assets/images/android-icon-foreground.png"
echo "Background: assets/images/android-icon-background.png" 
echo "Monochrome: assets/images/android-icon-monochrome.png"
echo ""

echo "📋 Instructions:"
echo "1. Replace the images above with your custom logo/icon"
echo "2. Keep the same filenames"
echo "3. Use recommended sizes for best results"
echo "4. After replacing images, run: npx expo start --clear"
echo ""

echo "✨ Quick tips:"
echo "• icon.png: Your main app icon (transparent background)"
echo "• splash-icon.png: Shows while app loads"
echo "• favicon.png: For web version"
echo "• Use PNG format with transparent backgrounds"
echo ""

echo "🔄 After updating images, restart your development server:"
echo "npx expo start --clear"
