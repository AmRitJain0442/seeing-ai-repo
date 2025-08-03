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
        scene: "Scene understanding unavailable - please configure GEMINI_API_KEY to enable AI-powered scene analysis and navigation assistance.",
        objects: [],
        navigation: "Navigation guidance requires API key configuration.",
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

    const scenePrompt = prompt || `
      Provide a detailed scene analysis for navigation assistance. Include:
      
      1. Overall scene description (indoor/outdoor, type of location)
      2. Key objects and obstacles in the environment
      3. Pathways, doors, stairs, or navigation routes
      4. Potential hazards or things to be aware of
      5. Landmarks or reference points
      6. Lighting conditions
      7. People or activity in the scene
      8. Navigation suggestions for someone with visual impairment
      
      Be specific about spatial relationships and directions (left, right, ahead, behind).
      Focus on practical navigation information.
    `

    const result = await model.generateContent([scenePrompt, imageData])
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      analysis: text,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in scene analysis:', error)
    
    return NextResponse.json({
      error: 'Failed to analyze scene',
      details: error instanceof Error ? error.message : 'Unknown error',
      fallback: "Scene understanding unavailable. Please configure GEMINI_API_KEY for environmental analysis."
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Scene Analysis API is running',
    endpoints: {
      POST: 'Analyze scene for navigation assistance',
    },
    requirements: {
      image: 'Base64 encoded image data',
      prompt: 'Optional custom prompt for scene analysis'
    }
  })
}
