import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const { image, prompt } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Prepare the image data for Gemini
    const imageData = {
      inlineData: {
        data: image,
        mimeType: 'image/jpeg'
      }
    }

    // Create the prompt for vision analysis
    const visionPrompt = prompt || 
      "Describe this image briefly and precisely. Focus on the most important objects, people, or activities visible. Keep the description under 30 words and make it helpful for someone who cannot see the image."

    try {
      // Generate content using the image and prompt
      const result = await model.generateContent([visionPrompt, imageData])
      const response = await result.response
      const description = response.text()

      return NextResponse.json({
        description: description.trim(),
        success: true
      })

    } catch (geminiError: any) {
      console.error('Gemini API Error:', geminiError)
      
      // Provide a fallback response
      return NextResponse.json({
        description: "I can see an image but cannot analyze it right now. Please try again in a moment.",
        success: false,
        error: geminiError.message
      })
    }

  } catch (error: any) {
    console.error('Error processing image:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process image',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
