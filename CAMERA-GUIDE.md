# Quick Start Guide - Camera Vision Feature

## How to Use the Camera Vision Assistant

### Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Configure the API Key

1. Open the `.env.local` file in your project root
2. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   GEMINI_API_KEY=AIzaSyC-your-actual-api-key-here
   ```
3. Save the file

### Step 3: Test the Feature

1. Make sure the dev server is running (`pnpm run dev`)
2. Open http://localhost:3001 in your browser
3. Click the "Start Vision Tools" button
4. Allow camera permissions when prompted
5. Click "Start Vision Analysis"
6. Point your camera at objects to get descriptions

## Features:

- ✅ Captures images every 5 seconds automatically
- ✅ Sends images to Gemini AI for analysis
- ✅ Converts descriptions to speech automatically
- ✅ Shows capture count and status indicators
- ✅ Manual controls to stop/start and mute/unmute

## Browser Requirements:

- Camera access permission
- Microphone/speakers for audio output
- Modern browser (Chrome, Firefox, Safari, Edge)

## Privacy:

- Images are processed by Google's Gemini AI
- No images are stored on our servers
- Camera only active during analysis sessions
