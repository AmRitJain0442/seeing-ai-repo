"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Camera, Square, Volume2, VolumeX, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TextReaderPage() {
  const router = useRouter()
  const [isActive, setIsActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [extractedText, setExtractedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Start camera stream
  const startCamera = async () => {
    try {
      setError('')
      setIsLoading(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
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

  // Capture and analyze text
  const captureAndAnalyzeText = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    
    try {
      setIsLoading(true)
      const response = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData.split(',')[1],
          prompt: "Extract and read all visible text from this image. Provide the text exactly as it appears, maintaining formatting and structure."
        })
      })

      const data = await response.json()
      const text = data.text || 'No text found in image'
      setExtractedText(text)
      speakText(text)
      setIsLoading(false)
    } catch (error) {
      console.error('Error analyzing text:', error)
      setError('Failed to analyze text')
      setIsLoading(false)
    }
  }

  // Text-to-speech
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 1
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    }
  }

  // Start text reading
  const startTextReading = async () => {
    setIsActive(true)
    await startCamera()
  }

  // Stop text reading
  const stopTextReading = () => {
    setIsActive(false)
    setError('')
    setIsLoading(false)
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  // Toggle speech
  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else if (extractedText) {
      speakText(extractedText)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTextReading()
    }
  }, [])

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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Smart Text Reading</h1>
              <p className="text-gray-400">Extract and read text from images</p>
            </div>
          </div>
        </div>

        <Card className="bg-gray-800/50 border-gray-700 text-white">
          <CardContent className="p-6 space-y-4">
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
                    <span className="text-white">Reading text...</span>
                  </div>
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

            {/* Extracted Text Display */}
            {extractedText && (
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Extracted Text:</h4>
                <p className="text-white whitespace-pre-wrap">{extractedText}</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {!isActive ? (
                <Button
                  onClick={startTextReading}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-3 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Starting Camera...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mr-2" />
                      Start Text Reader
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={captureAndAnalyzeText}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6 py-3"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Read Text
                  </Button>
                  
                  <Button
                    onClick={stopTextReading}
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

            {/* Instructions */}
            <div className="text-center text-sm text-gray-400">
              <p>Point your camera at text you want to read.</p>
              <p>Click "Read Text" to extract and hear the text aloud.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
