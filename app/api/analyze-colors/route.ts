import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    const { image, prompt } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured, using fallback response')
      
      // Fallback response for color analysis
      return NextResponse.json({
        analysis: "Color analysis unavailable. Please configure GEMINI_API_KEY to use AI-powered color detection. The app will use canvas-based color detection as fallback.",
        colors: [
          { name: "Red", hex: "#FF0000", description: "Primary red color" },
          { name: "Blue", hex: "#0000FF", description: "Primary blue color" },
          { name: "Green", hex: "#00FF00", description: "Primary green color" }
        ]
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const imageData = {
      inlineData: {
        data: image,
        mimeType: "image/jpeg"
      }
    }

    const colorPrompt = prompt || `
      Analyze this image and identify the dominant colors. For each color:
      1. Provide the color name
      2. Estimate the hex code
      3. Describe where this color appears in the image
      4. Provide a brief description of the color's characteristics
      
      Focus on the most prominent 5-7 colors in the image.
    `

    const result = await model.generateContent([colorPrompt, imageData])
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      analysis: text,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in color analysis:', error)
    
    return NextResponse.json({
      error: 'Failed to analyze colors',
      details: error instanceof Error ? error.message : 'Unknown error',
      fallback: "Using canvas-based color detection. For AI-powered analysis, please configure GEMINI_API_KEY."
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Color Analysis API is running',
    endpoints: {
      POST: 'Analyze colors in image',
    },
    requirements: {
      image: 'Base64 encoded image data',
      prompt: 'Optional custom prompt for color analysis'
    }
  })
}
