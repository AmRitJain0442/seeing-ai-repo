import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        status: 'error',
        message: 'No API key configured',
        hasKey: false
      })
    }

    if (process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return NextResponse.json({
        status: 'error', 
        message: 'Please replace the placeholder API key with your actual Gemini API key',
        hasKey: false
      })
    }

    // Test if the API key is valid by making a simple request
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    try {
      const result = await model.generateContent(['Test connection'])
      const response = await result.response
      
      return NextResponse.json({
        status: 'success',
        message: 'API key is valid and working',
        hasKey: true,
        keyPreview: process.env.GEMINI_API_KEY.substring(0, 10) + '...'
      })
    } catch (apiError: any) {
      return NextResponse.json({
        status: 'error',
        message: `API key invalid or quota exceeded: ${apiError.message}`,
        hasKey: true,
        keyPreview: process.env.GEMINI_API_KEY.substring(0, 10) + '...'
      })
    }

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: `Configuration error: ${error.message}`,
      hasKey: false
    })
  }
}
