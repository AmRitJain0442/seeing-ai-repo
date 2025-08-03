"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Square, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react'

interface CameraVisionProps {
  onClose: () => void
}

export default function CameraVision({ onClose }: CameraVisionProps) {
  const [isActive, setIsActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [lastDescription, setLastDescription] = useState('')
  const [captureCount, setCaptureCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiStatus, setApiStatus] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Start camera stream
  const startCamera = async () => {
    try {
      setError('')
      setIsLoading(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Error accessing camera:', error)
      setError('Unable to access camera. Please check permissions.')
      setIsLoading(false)
    }
  }

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Capture image from video
  const captureImage = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    return canvas.toDataURL('image/jpeg', 0.8)
  }

  // Send image to Gemini API
  const analyzeImage = async (imageData: string) => {
    try {
      setIsLoading(true)
      // Remove the data URL prefix
      const base64Image = imageData.split(',')[1]

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          prompt: "Describe this image in a short, precise way. Focus on the most important objects, people, or activities visible. Keep it under 30 words."
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze image')
      }

      const data = await response.json()
      setIsLoading(false)
      return data.description
    } catch (error) {
      console.error('Error analyzing image:', error)
      setIsLoading(false)
      return 'Unable to process image at this time.'
    }
  }

  // Convert text to speech
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    }
  }

  // Test API connection
  const testApiConnection = async () => {
    try {
      const response = await fetch('/api/test-api')
      const data = await response.json()
      setApiStatus(data.message)
    } catch (error) {
      setApiStatus('Failed to test API connection')
    }
  }

  // Start the vision analysis process
  const startVisionAnalysis = async () => {
    setIsActive(true)
    setCaptureCount(0)
    await startCamera()

    // Wait a moment for camera to initialize
    setTimeout(() => {
      intervalRef.current = setInterval(async () => {
        const imageData = captureImage()
        if (imageData) {
          setCaptureCount(prev => prev + 1)
          const description = await analyzeImage(imageData)
          setLastDescription(description)
          speakText(description)
        }
      }, 5000) // Capture every 5 seconds
    }, 2000)
  }

  // Stop the vision analysis process
  const stopVisionAnalysis = () => {
    setIsActive(false)
    setError('')
    setIsLoading(false)
    stopCamera()
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setCaptureCount(0)
  }

  // Toggle speech
  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else if (lastDescription) {
      speakText(lastDescription)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
      window.speechSynthesis.cancel()
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-900 border-gray-700 text-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-6 h-6 text-blue-400" />
              Vision Assistant
            </CardTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Camera View */}
          <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-gray-800/90 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white">Processing...</span>
                </div>
              </div>
            )}
            
            {/* Status Indicator */}
            {isActive && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-300">
                  Active • {captureCount} captures
                </span>
              </div>
            )}

            {/* Speaking Indicator */}
            {isSpeaking && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-blue-500/30">
                <Volume2 className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-sm text-blue-300">Speaking</span>
              </div>
            )}
          </div>

          {/* API Status */}
          {apiStatus && (
            <div className={`rounded-lg p-3 text-sm ${
              apiStatus.includes('success') || apiStatus.includes('valid') 
                ? 'bg-green-900/20 border border-green-500/30 text-green-300'
                : 'bg-yellow-900/20 border border-yellow-500/30 text-yellow-300'
            }`}>
              <p>{apiStatus}</p>
            </div>
          )}

          {/* Description Display */}
          {lastDescription && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Latest Description:</h4>
              <p className="text-white">{lastDescription}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col items-center gap-4">
            {/* Test API Button */}
            <Button
              onClick={testApiConnection}
              variant="outline"
              size="sm"
              className="border-gray-600 bg-gray-800 hover:bg-gray-700 text-xs"
            >
              Test API Connection
            </Button>

            <div className="flex items-center justify-center gap-4">
              {!isActive ? (
                <Button
                  onClick={startVisionAnalysis}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Starting Camera...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mr-2" />
                      Start Vision Analysis
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={stopVisionAnalysis}
                    variant="destructive"
                    className="px-6 py-3"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop
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
                </>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-gray-400">
            <p>Point your camera at what you want described.</p>
            <p>Images are captured every 5 seconds and described aloud.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
