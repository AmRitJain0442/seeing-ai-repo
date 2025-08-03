import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    const { command, context } = await request.json()

    if (!command) {
      return NextResponse.json(
        { error: 'No voice command provided' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured, using fallback response')
      
      // Basic command processing without AI
      const processedCommand = processBasicCommand(command)
      return NextResponse.json({
        response: processedCommand.response,
        action: processedCommand.action,
        confidence: 0.5,
        fallback: true
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const voicePrompt = `
      Process this voice command for a visual assistance app: "${command}"
      
      Context: ${context || 'SEEING AI application - helping with visual tasks'}
      
      Determine:
      1. The user's intent and what they want to accomplish
      2. The appropriate action to take
      3. A helpful response to speak back to the user
      4. Any parameters needed for the action
      
      Available actions include:
      - navigate_to: Go to a specific feature (camera, text-reader, product-scanner, etc.)
      - take_photo: Capture an image for analysis
      - repeat_last: Repeat the last spoken information
      - help: Provide assistance
      - settings: Adjust app settings
      - stop: Stop current action
      
      Respond in JSON format with: response, action, parameters, confidence
    `

    const result = await model.generateContent(voicePrompt)
    const response = await result.response
    const text = response.text()

    // Try to parse as JSON, fallback to text response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(text)
    } catch {
      parsedResponse = {
        response: text,
        action: 'speak',
        confidence: 0.8
      }
    }

    return NextResponse.json({
      ...parsedResponse,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in voice command processing:', error)
    
    const fallbackCommand = processBasicCommand(command)
    return NextResponse.json({
      error: 'Failed to process voice command',
      details: error instanceof Error ? error.message : 'Unknown error',
      fallback: fallbackCommand,
      response: fallbackCommand.response,
      action: fallbackCommand.action
    }, { status: 500 })
  }
}

// Basic command processing without AI
function processBasicCommand(command: string) {
  const lowerCommand = command.toLowerCase()
  
  if (lowerCommand.includes('help')) {
    return {
      response: "I can help you navigate the SEEING AI app. Say 'camera' to take photos, 'text reader' to scan text, or 'settings' to adjust preferences.",
      action: 'speak'
    }
  } else if (lowerCommand.includes('camera') || lowerCommand.includes('photo') || lowerCommand.includes('picture')) {
    return {
      response: "Opening camera for image capture.",
      action: 'take_photo'
    }
  } else if (lowerCommand.includes('text') || lowerCommand.includes('read')) {
    return {
      response: "Opening text reader.",
      action: 'navigate_to',
      parameters: { page: 'text-reader' }
    }
  } else if (lowerCommand.includes('product') || lowerCommand.includes('scan')) {
    return {
      response: "Opening product scanner.",
      action: 'navigate_to',
      parameters: { page: 'product-scanner' }
    }
  } else if (lowerCommand.includes('face') || lowerCommand.includes('person')) {
    return {
      response: "Opening face recognition.",
      action: 'navigate_to',
      parameters: { page: 'face-recognition' }
    }
  } else if (lowerCommand.includes('scene') || lowerCommand.includes('environment')) {
    return {
      response: "Opening scene understanding.",
      action: 'navigate_to',
      parameters: { page: 'scene-understanding' }
    }
  } else if (lowerCommand.includes('color')) {
    return {
      response: "Opening color detection.",
      action: 'navigate_to',
      parameters: { page: 'color-detection' }
    }
  } else if (lowerCommand.includes('stop') || lowerCommand.includes('cancel')) {
    return {
      response: "Stopping current action.",
      action: 'stop'
    }
  } else if (lowerCommand.includes('repeat') || lowerCommand.includes('again')) {
    return {
      response: "Repeating last information.",
      action: 'repeat_last'
    }
  } else {
    return {
      response: "I didn't understand that command. Try saying 'help' for available options, or speak commands like 'open camera' or 'read text'.",
      action: 'speak'
    }
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Voice Command API is running',
    endpoints: {
      POST: 'Process voice commands for app control',
    },
    requirements: {
      command: 'Voice command text to process',
      context: 'Optional context about current app state'
    },
    availableActions: [
      'navigate_to', 'take_photo', 'repeat_last', 'help', 'settings', 'stop', 'speak'
    ]
  })
}
