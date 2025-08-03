"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, MicOff, Volume2, VolumeX, ArrowLeft, MessageSquare, Settings, Play, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface VoiceCommand {
  command: string
  action: string
  timestamp: Date
}

export default function VoiceControlPage() {
  const router = useRouter()
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([])
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.8,
    pitch: 1,
    volume: 1,
    language: 'en-US'
  })

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = voiceSettings.language

      recognition.onstart = () => {
        setIsListening(true)
        setError('')
      }

      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript || interimTranscript)

        if (finalTranscript) {
          processVoiceCommand(finalTranscript)
        }
      }

      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    } else {
      setError('Speech recognition not supported in this browser')
    }

    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [voiceSettings.language])

  // Process voice command
  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true)
    
    const newCommand: VoiceCommand = {
      command: command,
      action: 'Processing...',
      timestamp: new Date()
    }
    
    setCommandHistory(prev => [newCommand, ...prev.slice(0, 9)]) // Keep last 10 commands

    try {
      // Analyze the voice command
      const response = await fetch('/api/process-voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: command,
          context: 'voice_navigation'
        })
      })

      const data = await response.json()
      const responseText = data.response || 'Command processed'
      
      setResponse(responseText)
      speakText(responseText)
      
      // Update command history with result
      setCommandHistory(prev => 
        prev.map((cmd, index) => 
          index === 0 ? { ...cmd, action: responseText } : cmd
        )
      )
      
    } catch (error) {
      console.error('Error processing voice command:', error)
      const errorResponse = 'Sorry, I could not process that command.'
      setResponse(errorResponse)
      speakText(errorResponse)
      
      setCommandHistory(prev => 
        prev.map((cmd, index) => 
          index === 0 ? { ...cmd, action: errorResponse } : cmd
        )
      )
    }
    
    setIsProcessing(false)
  }

  // Start listening
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setError('')
      recognitionRef.current.start()
    }
  }

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  // Text-to-speech
  const speakText = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = voiceSettings.rate
      utterance.pitch = voiceSettings.pitch
      utterance.volume = voiceSettings.volume
      utterance.lang = voiceSettings.language
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      synthRef.current.speak(utterance)
    }
  }

  // Toggle speech
  const toggleSpeech = () => {
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    } else if (response) {
      speakText(response)
    }
  }

  // Pre-defined voice commands
  const quickCommands = [
    "What time is it?",
    "Read the screen",
    "Navigate to camera",
    "Start text reader",
    "Help me navigate",
    "What's around me?",
    "Read this text",
    "Identify this object"
  ]

  const executeQuickCommand = (command: string) => {
    setTranscript(command)
    processVoiceCommand(command)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Voice Navigation</h1>
              <p className="text-gray-400">Control everything with your voice</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Voice Control */}
          <div className="lg:col-span-2 space-y-6">
            {/* Voice Input Section */}
            <Card className="bg-gray-800/50 border-gray-700 text-white">
              <CardContent className="p-6 space-y-4">
                {/* Error Display */}
                {error && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {/* Voice Visualization */}
                <div className="relative">
                  <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-700">
                    <div className="text-center">
                      {isListening ? (
                        <div className="space-y-4">
                          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-red-500 animate-pulse">
                            <Mic className="w-12 h-12 text-red-400" />
                          </div>
                          <div className="flex justify-center space-x-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className="w-2 bg-red-400 rounded-full animate-pulse"
                                style={{
                                  height: Math.random() * 20 + 10,
                                  animationDelay: `${i * 0.1}s`
                                }}
                              />
                            ))}
                          </div>
                          <p className="text-red-300">Listening...</p>
                        </div>
                      ) : isProcessing ? (
                        <div className="space-y-4">
                          <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-blue-500">
                            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          </div>
                          <p className="text-blue-300">Processing command...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-24 h-24 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto border-4 border-gray-600">
                            {isSpeaking ? (
                              <Volume2 className="w-12 h-12 text-gray-400 animate-pulse" />
                            ) : (
                              <MicOff className="w-12 h-12 text-gray-400" />
                            )}
                          </div>
                          <p className="text-gray-400">
                            {isSpeaking ? 'Speaking...' : 'Click to start listening'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transcript Display */}
                {transcript && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">You said:</h4>
                    <p className="text-white">{transcript}</p>
                  </div>
                )}

                {/* Response Display */}
                {response && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Response:</h4>
                    <p className="text-white">{response}</p>
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isProcessing}
                    className={`px-8 py-3 ${
                      isListening 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <Square className="w-5 h-5 mr-2" />
                        Stop Listening
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5 mr-2" />
                        Start Listening
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={toggleSpeech}
                    variant="outline"
                    className="border-gray-600 bg-gray-800 hover:bg-gray-700 px-6 py-3"
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-4 h-4 mr-2" />
                    ) : (
                      <Volume2 className="w-4 h-4 mr-2" />
                    )}
                    {isSpeaking ? 'Mute' : 'Repeat'}
                  </Button>
                </div>

                {/* Instructions */}
                <div className="text-center text-sm text-gray-400">
                  <p>Click "Start Listening" and speak your command clearly.</p>
                  <p>Try commands like "What's around me?" or "Read this text"</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Commands */}
            <Card className="bg-gray-800/50 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Quick Commands
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {quickCommands.map((command, index) => (
                  <Button
                    key={index}
                    onClick={() => executeQuickCommand(command)}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 bg-gray-700/50 hover:bg-gray-600/50 text-left justify-start"
                    disabled={isListening || isProcessing}
                  >
                    <Play className="w-3 h-3 mr-2" />
                    {command}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voice Settings */}
            <Card className="bg-gray-800/50 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Voice Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Speech Rate: {voiceSettings.rate}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.rate}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pitch: {voiceSettings.pitch}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.pitch}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Volume: {voiceSettings.volume}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceSettings.volume}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Command History */}
            <Card className="bg-gray-800/50 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Recent Commands
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                {commandHistory.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">
                    No commands yet. Start by saying something!
                  </p>
                ) : (
                  commandHistory.map((cmd, index) => (
                    <div key={index} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                      <div className="text-sm">
                        <p className="text-white font-medium">"{cmd.command}"</p>
                        <p className="text-gray-400 text-xs mt-1">{cmd.action}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {cmd.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
