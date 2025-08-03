"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Camera, Square, Volume2, VolumeX, ArrowLeft, Scan } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProductScannerPage() {
  const router = useRouter()
  const [isActive, setIsActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [productInfo, setProductInfo] = useState('')
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

  // Capture and analyze product
  const captureAndAnalyzeProduct = async () => {
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
      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData.split(',')[1],
          prompt: "Identify this product. Provide the product name, brand, type, key features, and any visible barcodes or labels. Be specific and helpful for shopping."
        })
      })

      const data = await response.json()
      const info = data.description || 'No product information found'
      setProductInfo(info)
      speakText(info)
      setIsLoading(false)
    } catch (error) {
      console.error('Error analyzing product:', error)
      setError('Failed to analyze product')
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

  // Start product scanning
  const startProductScanning = async () => {
    setIsActive(true)
    await startCamera()
  }

  // Stop product scanning
  const stopProductScanning = () => {
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
    } else if (productInfo) {
      speakText(productInfo)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProductScanning()
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
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Product Identification</h1>
              <p className="text-gray-400">Identify products and get shopping info</p>
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
              
              {/* Scanning Overlay */}
              {isActive && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-green-400 rounded-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                  </div>
                </div>
              )}
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-gray-800/90 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-white">Scanning product...</span>
                  </div>
                </div>
              )}

              {/* Speaking Indicator */}
              {isSpeaking && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-green-500/30">
                  <Volume2 className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-sm text-green-300">Speaking</span>
                </div>
              )}
            </div>

            {/* Product Info Display */}
            {productInfo && (
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Product Information:</h4>
                <p className="text-white whitespace-pre-wrap">{productInfo}</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {!isActive ? (
                <Button
                  onClick={startProductScanning}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-8 py-3 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Starting Camera...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mr-2" />
                      Start Product Scanner
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={captureAndAnalyzeProduct}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3"
                  >
                    <Scan className="w-4 h-4 mr-2" />
                    Scan Product
                  </Button>
                  
                  <Button
                    onClick={stopProductScanning}
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
              <p>Point your camera at a product to identify it.</p>
              <p>Works with barcodes, labels, and product packaging.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
