"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Camera, Square, Volume2, VolumeX, ArrowLeft, Pipette, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ColorInfo {
  name: string
  hex: string
  rgb: string
  hsl: string
  description: string
}

export default function ColorDetectionPage() {
  const router = useRouter()
  const [isActive, setIsActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [dominantColors, setDominantColors] = useState<ColorInfo[]>([])
  const [selectedColor, setSelectedColor] = useState<ColorInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [detectionMode, setDetectionMode] = useState<'dominant' | 'point'>('dominant')
  const [clickPosition, setClickPosition] = useState<{x: number, y: number} | null>(null)
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

  // Get color at specific point
  const getColorAtPoint = (x: number, y: number): ColorInfo | null => {
    if (!videoRef.current || !canvasRef.current) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // Get pixel data at the clicked point
    const imageData = ctx.getImageData(x, y, 1, 1)
    const [r, g, b] = imageData.data

    return {
      name: getColorName(r, g, b),
      hex: rgbToHex(r, g, b),
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: rgbToHsl(r, g, b),
      description: `A ${getColorName(r, g, b)} color with RGB values of ${r}, ${g}, ${b}`
    }
  }

  // Analyze dominant colors
  const analyzeDominantColors = async () => {
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
      const response = await fetch('/api/analyze-colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData.split(',')[1],
          prompt: "Identify the dominant colors in this image. List the top 5 most prominent colors with their approximate names and descriptions."
        })
      })

      const data = await response.json()
      
      // Also extract colors using canvas analysis
      const canvasColors = extractCanvasColors(ctx, canvas.width, canvas.height)
      
      setDominantColors(canvasColors)
      
      const colorDescription = `The main colors are: ${canvasColors.map(c => c.name).join(', ')}`
      speakText(colorDescription)
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error analyzing colors:', error)
      
      // Fallback to canvas-only analysis
      const canvasColors = extractCanvasColors(ctx, canvas.width, canvas.height)
      setDominantColors(canvasColors)
      
      const colorDescription = `The main colors are: ${canvasColors.map(c => c.name).join(', ')}`
      speakText(colorDescription)
      
      setIsLoading(false)
    }
  }

  // Extract colors from canvas
  const extractCanvasColors = (ctx: CanvasRenderingContext2D, width: number, height: number): ColorInfo[] => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const colorCounts: {[key: string]: {count: number, r: number, g: number, b: number}} = {}

    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) {
      const r = data[i]
      const g = data[i + 1] 
      const b = data[i + 2]
      
      // Quantize colors to reduce noise
      const qR = Math.floor(r / 32) * 32
      const qG = Math.floor(g / 32) * 32
      const qB = Math.floor(b / 32) * 32
      
      const key = `${qR}-${qG}-${qB}`
      
      if (colorCounts[key]) {
        colorCounts[key].count++
      } else {
        colorCounts[key] = { count: 1, r: qR, g: qG, b: qB }
      }
    }

    // Get top 5 colors
    const sortedColors = Object.values(colorCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return sortedColors.map(color => ({
      name: getColorName(color.r, color.g, color.b),
      hex: rgbToHex(color.r, color.g, color.b),
      rgb: `rgb(${color.r}, ${color.g}, ${color.b})`,
      hsl: rgbToHsl(color.r, color.g, color.b),
      description: `${getColorName(color.r, color.g, color.b)} - appears ${Math.round((color.count / Object.values(colorCounts).reduce((sum, c) => sum + c.count, 0)) * 100)}% of the image`
    }))
  }

  // Handle video click for point color detection
  const handleVideoClick = (event: React.MouseEvent<HTMLVideoElement>) => {
    if (detectionMode !== 'point' || !videoRef.current) return

    const rect = videoRef.current.getBoundingClientRect()
    const scaleX = videoRef.current.videoWidth / rect.width
    const scaleY = videoRef.current.videoHeight / rect.height
    
    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * scaleY

    setClickPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top })

    const color = getColorAtPoint(x, y)
    if (color) {
      setSelectedColor(color)
      speakText(`Color detected: ${color.name}. ${color.description}`)
    }
  }

  // Utility functions
  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }

  const rgbToHsl = (r: number, g: number, b: number): string => {
    r /= 255
    g /= 255
    b /= 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
  }

  const getColorName = (r: number, g: number, b: number): string => {
    const colors = [
      { name: 'Red', r: 255, g: 0, b: 0 },
      { name: 'Green', r: 0, g: 255, b: 0 },
      { name: 'Blue', r: 0, g: 0, b: 255 },
      { name: 'Yellow', r: 255, g: 255, b: 0 },
      { name: 'Orange', r: 255, g: 165, b: 0 },
      { name: 'Purple', r: 128, g: 0, b: 128 },
      { name: 'Pink', r: 255, g: 192, b: 203 },
      { name: 'Brown', r: 165, g: 42, b: 42 },
      { name: 'Black', r: 0, g: 0, b: 0 },
      { name: 'White', r: 255, g: 255, b: 255 },
      { name: 'Gray', r: 128, g: 128, b: 128 },
      { name: 'Cyan', r: 0, g: 255, b: 255 },
      { name: 'Magenta', r: 255, g: 0, b: 255 },
    ]

    let closestColor = colors[0]
    let minDistance = Infinity

    colors.forEach(color => {
      const distance = Math.sqrt(
        Math.pow(r - color.r, 2) + 
        Math.pow(g - color.g, 2) + 
        Math.pow(b - color.b, 2)
      )
      
      if (distance < minDistance) {
        minDistance = distance
        closestColor = color
      }
    })

    return closestColor.name
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

  // Start color detection
  const startColorDetection = async () => {
    setIsActive(true)
    await startCamera()
  }

  // Stop color detection
  const stopColorDetection = () => {
    setIsActive(false)
    setError('')
    setIsLoading(false)
    setClickPosition(null)
    
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
    } else if (selectedColor) {
      speakText(`${selectedColor.name}. ${selectedColor.description}`)
    } else if (dominantColors.length > 0) {
      const colorList = dominantColors.map(c => c.name).join(', ')
      speakText(`The main colors are: ${colorList}`)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopColorDetection()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
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
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Color Detection</h1>
              <p className="text-gray-400">Identify colors instantly</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Section */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700 text-white">
              <CardContent className="p-6 space-y-4">
                {/* Detection Mode Selector */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-300">Detection Mode:</span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setDetectionMode('dominant')}
                      variant={detectionMode === 'dominant' ? 'default' : 'outline'}
                      size="sm"
                      className={detectionMode === 'dominant' 
                        ? 'bg-pink-600 hover:bg-pink-700' 
                        : 'border-gray-600 text-gray-300'
                      }
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Dominant Colors
                    </Button>
                    <Button
                      onClick={() => setDetectionMode('point')}
                      variant={detectionMode === 'point' ? 'default' : 'outline'}
                      size="sm"
                      className={detectionMode === 'point' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'border-gray-600 text-gray-300'
                      }
                    >
                      <Pipette className="w-4 h-4 mr-2" />
                      Point Detection
                    </Button>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {/* Camera View */}
                <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden cursor-crosshair">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    onClick={handleVideoClick}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Point Detection Crosshair */}
                  {detectionMode === 'point' && clickPosition && (
                    <div 
                      className="absolute w-6 h-6 border-2 border-pink-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ 
                        left: clickPosition.x, 
                        top: clickPosition.y 
                      }}
                    >
                      <div className="absolute inset-0 border-2 border-white rounded-full animate-ping opacity-75"></div>
                    </div>
                  )}
                  
                  {/* Loading Indicator */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-gray-800/90 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-white">Analyzing colors...</span>
                      </div>
                    </div>
                  )}

                  {/* Speaking Indicator */}
                  {isSpeaking && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-pink-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-pink-500/30">
                      <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" />
                      <span className="text-sm text-pink-300">Speaking</span>
                    </div>
                  )}

                  {/* Instructions Overlay */}
                  {isActive && detectionMode === 'point' && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-white text-sm text-center">
                        Click anywhere on the video to detect the color at that point
                      </p>
                    </div>
                  )}
                </div>

                {/* Selected Color Display */}
                {selectedColor && detectionMode === 'point' && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Selected Color:</h4>
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-gray-600"
                        style={{ backgroundColor: selectedColor.hex }}
                      ></div>
                      <div className="flex-1">
                        <h5 className="text-lg font-semibold text-white">{selectedColor.name}</h5>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p>Hex: {selectedColor.hex}</p>
                          <p>RGB: {selectedColor.rgb}</p>
                          <p>HSL: {selectedColor.hsl}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {!isActive ? (
                    <Button
                      onClick={startColorDetection}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 px-8 py-3 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Starting Camera...
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5 mr-2" />
                          Start Color Detection
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      {detectionMode === 'dominant' && (
                        <Button
                          onClick={analyzeDominantColors}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-3"
                        >
                          <Palette className="w-4 h-4 mr-2" />
                          Analyze Colors
                        </Button>
                      )}
                      
                      <Button
                        onClick={stopColorDetection}
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
                  <p>
                    {detectionMode === 'dominant' 
                      ? 'Point camera at objects and click "Analyze Colors" to identify dominant colors.'
                      : 'Click anywhere on the video to detect the exact color at that point.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Color Palette Section */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Color Palette
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {dominantColors.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">
                    {detectionMode === 'dominant' 
                      ? 'No colors analyzed yet. Click "Analyze Colors" to detect dominant colors.'
                      : 'Click on the video to detect colors at specific points.'
                    }
                  </p>
                ) : (
                  dominantColors.map((color, index) => (
                    <div key={index} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg border-2 border-gray-500 flex-shrink-0"
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white">{color.name}</h4>
                          <div className="text-xs text-gray-400 space-y-1">
                            <p>{color.hex}</p>
                            <p>{color.rgb}</p>
                            <p className="truncate">{color.hsl}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => speakText(`${color.name}. ${color.description}`)}
                          variant="ghost"
                          size="sm"
                          className="text-pink-400 hover:text-pink-300 hover:bg-pink-900/20 flex-shrink-0"
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
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
