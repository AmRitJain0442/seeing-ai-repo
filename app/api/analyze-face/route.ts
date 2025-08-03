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
      
      return NextResponse.json({
        faces: [{
          description: "Face detection unavailable - please configure GEMINI_API_KEY",
          confidence: 0,
          position: "unknown",
          attributes: {
            age: "unknown",
            gender: "unknown",
            emotion: "unknown"
          }
        }],
        count: 0,
        fallback: true
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

    const facePrompt = prompt || `
      Analyze this image for faces and people. For each person you detect:
      
      1. Describe their general appearance (without identifying specific individuals)
      2. Approximate age range
      3. Visible emotions or expressions
      4. Position in the image (left, right, center, background, foreground)
      5. What they appear to be doing
      6. Clothing or accessories visible
      7. General physical characteristics (hair color, etc.)
      
      Count the total number of people in the image.
      
      Note: Focus on observable characteristics only, do not attempt to identify specific individuals.
    `

    const result = await model.generateContent([facePrompt, imageData])
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      analysis: text,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in face analysis:', error)
    
    return NextResponse.json({
      error: 'Failed to analyze faces',
      details: error instanceof Error ? error.message : 'Unknown error',
      fallback: "Face recognition unavailable. Please configure GEMINI_API_KEY for face detection."
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Face Analysis API is running',
    endpoints: {
      POST: 'Detect and analyze faces in image',
    },
    requirements: {
      image: 'Base64 encoded image data',
      prompt: 'Optional custom prompt for face analysis'
    }
  })
}
