# SEEING AI - Vision Assistant

A Next.js application that provides AI-powered vision assistance using camera input and Google's Gemini AI.

## Features

- **Real-time Camera Vision**: Captures images every 5 seconds from your device camera
- **AI Image Analysis**: Uses Google Gemini AI to describe what's in the image
- **Text-to-Speech**: Automatically converts descriptions to audio
- **Accessibility Focused**: Designed for users who need visual assistance

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and add your Gemini API key:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Click the "Start Vision Tools" button on the homepage
2. Allow camera permissions when prompted
3. Click "Start Vision Analysis" in the modal
4. Point your camera at objects you want described
5. The app will capture images every 5 seconds and provide audio descriptions

## Camera Features

- **Auto-capture**: Takes a photo every 5 seconds
- **AI Description**: Each image is analyzed by Gemini AI
- **Speech Output**: Descriptions are automatically spoken aloud
- **Manual Controls**: Stop/start analysis and mute/unmute speech
- **Capture Counter**: Shows how many images have been processed

## Browser Requirements

- **Camera Access**: Requires permission to access device camera
- **Speech Synthesis**: Uses browser's built-in text-to-speech
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## Privacy Notes

- Images are sent to Google's Gemini AI service for analysis
- No images are stored permanently on our servers
- Camera access is only active when vision analysis is running

## Troubleshooting

### Camera Not Working

- Check browser permissions for camera access
- Ensure you're using HTTPS (required for camera access)
- Try refreshing the page and allowing permissions again

### Speech Not Working

- Check browser support for Web Speech API
- Ensure device volume is turned up
- Try different browsers if issues persist

### API Errors

- Verify your Gemini API key is correct
- Check that you have API quota remaining
- Ensure environment variables are properly loaded

## Development

### File Structure

- `app/page.tsx` - Main homepage component
- `components/CameraVision.tsx` - Camera and vision analysis component
- `app/api/analyze-image/route.ts` - API endpoint for Gemini integration
- `.env.local` - Environment variables (not in version control)

### Building for Production

```bash
pnpm run build
pnpm run start
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
