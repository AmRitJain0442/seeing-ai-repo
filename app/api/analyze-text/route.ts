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
        text: "OCR text extraction unavailable. Please configure GEMINI_API_KEY to use AI-powered text recognition. This feature can extract text from images, documents, signs, and handwritten notes.",
        confidence: 0,
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

    const textPrompt = prompt || `
      Extract all visible text from this image. This includes:
      - Printed text (books, signs, documents, labels)
      - Handwritten text
      - Text on screens or displays
      - Numbers and symbols
      
      Provide the extracted text exactly as it appears, maintaining formatting where possible.
      If no text is found, respond with "No text detected in image."
    `

    const result = await model.generateContent([textPrompt, imageData])
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      text: text,
      confidence: 0.95, // Gemini typically has high confidence
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in text analysis:', error)
    
    return NextResponse.json({
      error: 'Failed to extract text',
      details: error instanceof Error ? error.message : 'Unknown error',
      fallback: "Text extraction unavailable. Please configure GEMINI_API_KEY for OCR functionality."
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Text Analysis API is running',
    endpoints: {
      POST: 'Extract text from image using OCR',
    },
    requirements: {
      image: 'Base64 encoded image data',
      prompt: 'Optional custom prompt for text extraction'
    }
  })
}
