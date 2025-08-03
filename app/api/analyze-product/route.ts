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
        products: [{
          name: "Product identification unavailable",
          description: "Please configure GEMINI_API_KEY to use AI-powered product recognition.",
          category: "Configuration needed",
          barcode: null,
          price: null,
          brand: "N/A"
        }],
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

    const productPrompt = prompt || `
      Analyze this image and identify any products, items, or objects. For each item you identify:
      
      1. Product name and brand (if visible)
      2. Category (food, electronics, clothing, etc.)
      3. Description of the product
      4. Any visible barcodes or product codes
      5. Price if visible on packaging/labels
      6. Key features or characteristics
      7. Condition (new, used, etc.)
      
      If you see multiple products, list them all.
      If no clear products are visible, describe what objects you can see.
    `

    const result = await model.generateContent([productPrompt, imageData])
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      analysis: text,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in product analysis:', error)
    
    return NextResponse.json({
      error: 'Failed to analyze product',
      details: error instanceof Error ? error.message : 'Unknown error',
      fallback: "Product identification unavailable. Please configure GEMINI_API_KEY for product recognition."
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Product Analysis API is running',
    endpoints: {
      POST: 'Identify products in image',
    },
    requirements: {
      image: 'Base64 encoded image data',
      prompt: 'Optional custom prompt for product identification'
    }
  })
}
