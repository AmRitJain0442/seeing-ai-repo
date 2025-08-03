"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Square, Volume2, VolumeX, ArrowLeft, Eye, MapPin, Navigation } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SceneUnderstandingPage() {
  const router = useRouter()
  const [isActive, setIsActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [sceneDescription, setSceneDescription] = useState('')
  const [navigationInfo, setNavigationInfo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [analysisMode, setAnalysisMode] = useState<'scene' | 'navigation'>('scene')
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

  // Capture and analyze scene
  const captureAndAnalyzeScene = async () => {
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
      
      const prompt = analysisMode === 'scene' 
        ? "Describe this scene in detail. Include objects, people, activities, spatial relationships, lighting, and overall environment. Be comprehensive and helpful for someone who cannot see."
        : "Analyze this scene for navigation purposes. Describe paths, obstacles, doorways, stairs, hazards, and safe walking areas. Focus on mobility and navigation guidance."

      const response = await fetch('/api/analyze-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData.split(',')[1],
          prompt: prompt
        })
      })

      const data = await response.json()
      const description = data.description || 'Unable to analyze scene'
      
      if (analysisMode === 'scene') {
        setSceneDescription(description)
      } else {
        setNavigationInfo(description)
      }
      
      speakText(description)
      setIsLoading(false)
    } catch (error) {
      console.error('Error analyzing scene:', error)
      setError('Failed to analyze scene')
      setIsLoading(false)
    }
  }

  // Start continuous scene analysis
  const startContinuousAnalysis = async () => {
    setIsActive(true)
    await startCamera()

    // Start continuous analysis every 10 seconds
    setTimeout(() => {
      intervalRef.current = setInterval(async () => {
        if (streamRef.current && streamRef.current.active) {
          await captureAndAnalyzeScene()
        }
      }, 10000) // Every 10 seconds
    }, 2000)
  }

  // Stop continuous analysis
  const stopContinuousAnalysis = () => {
    setIsActive(false)
    setError('')
    setIsLoading(false)
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
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

  // Toggle speech
  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      const textToSpeak = analysisMode === 'scene' ? sceneDescription : navigationInfo
      if (textToSpeak) {
        speakText(textToSpeak)
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopContinuousAnalysis()
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
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Scene Understanding</h1>
              <p className="text-gray-400">Comprehensive environment analysis</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Analysis Mode Selector */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300">Analysis Mode:</span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setAnalysisMode('scene')}
                    variant={analysisMode === 'scene' ? 'default' : 'outline'}
                    size="sm"
                    className={analysisMode === 'scene' 
                      ? 'bg-orange-600 hover:bg-orange-700' 
                      : 'border-gray-600 text-gray-300'
                    }
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Scene Description
                  </Button>
                  <Button
                    onClick={() => setAnalysisMode('navigation')}
                    variant={analysisMode === 'navigation' ? 'default' : 'outline'}
                    size="sm"
                    className={analysisMode === 'navigation' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'border-gray-600 text-gray-300'
                    }
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Navigation Guidance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Camera Section */}
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
                
                {/* Analysis Overlay */}
                {isActive && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-4 border-2 border-orange-400 rounded-lg opacity-30">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-400"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-400"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-400"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-400"></div>
                    </div>
                    
                    {/* Mode Indicator */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-orange-500/30">
                      {analysisMode === 'scene' ? (
                        <Eye className="w-4 h-4 text-orange-400" />
                      ) : (
                        <Navigation className="w-4 h-4 text-blue-400" />
                      )}
                      <span className="text-sm text-orange-300">
                        {analysisMode === 'scene' ? 'Scene Mode' : 'Navigation Mode'}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Loading Indicator */}
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-gray-800/90 rounded-lg p-4 flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-white">Analyzing scene...</span>
                    </div>
                  </div>
                )}

                {/* Speaking Indicator */}
                {isSpeaking && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-orange-500/30">
                    <Volume2 className="w-4 h-4 text-orange-400 animate-pulse" />
                    <span className="text-sm text-orange-300">Speaking</span>
                  </div>
                )}
              </div>

              {/* Analysis Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Scene Description */}
                {sceneDescription && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Scene Description:
                    </h4>
                    <p className="text-white text-sm whitespace-pre-wrap">{sceneDescription}</p>
                  </div>
                )}

                {/* Navigation Info */}
                {navigationInfo && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Navigation className="w-4 h-4" />
                      Navigation Guidance:
                    </h4>
                    <p className="text-white text-sm whitespace-pre-wrap">{navigationInfo}</p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {!isActive ? (
                  <Button
                    onClick={startContinuousAnalysis}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 px-8 py-3 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Starting Camera...
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5 mr-2" />
                        Start Scene Analysis
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={captureAndAnalyzeScene}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-3"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Analyze Now
                    </Button>
                    
                    <Button
                      onClick={stopContinuousAnalysis}
                      variant="destructive"
                      className="px-4 py-3"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                    
                    <Button
                      onClick={toggleSpeech}
                      variant="outline"
                      className="border-gray-600 bg-gray-800 hover:bg-gray-700 px-4 py-3"
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
                <p>Choose your analysis mode and point the camera at your environment.</p>
                <p>Scene mode provides detailed descriptions, Navigation mode focuses on mobility guidance.</p>
                <p className="mt-1 text-xs">Continuous analysis runs every 10 seconds when active.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
