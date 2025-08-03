"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Camera, Square, Volume2, VolumeX, ArrowLeft, UserPlus, UserCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Person {
  id: string
  name: string
  description: string
  imageData: string
}

export default function FaceRecognitionPage() {
  const router = useRouter()
  const [isActive, setIsActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [recognitionResult, setRecognitionResult] = useState('')
  const [savedPeople, setSavedPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [newPersonName, setNewPersonName] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Load saved people from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedPeople')
    if (saved) {
      setSavedPeople(JSON.parse(saved))
    }
  }, [])

  // Save people to localStorage
  const savePeopleToStorage = (people: Person[]) => {
    localStorage.setItem('savedPeople', JSON.stringify(people))
    setSavedPeople(people)
  }

  // Start camera stream
  const startCamera = async () => {
    try {
      setError('')
      setIsLoading(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', // Front camera for face recognition
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

  // Capture and recognize face
  const captureAndRecognizeFace = async () => {
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
      const response = await fetch('/api/analyze-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData.split(',')[1],
          savedPeople: savedPeople,
          prompt: "Analyze this face and describe the person's appearance, estimated age, gender, and any notable features. If this matches any saved person, identify them."
        })
      })

      const data = await response.json()
      const result = data.description || 'No face detected'
      setRecognitionResult(result)
      speakText(result)
      setIsLoading(false)
    } catch (error) {
      console.error('Error analyzing face:', error)
      setError('Failed to analyze face')
      setIsLoading(false)
    }
  }

  // Add new person
  const addNewPerson = async () => {
    if (!newPersonName.trim() || !videoRef.current || !canvasRef.current) return

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
      const response = await fetch('/api/analyze-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData.split(',')[1],
          prompt: "Describe this person's facial features in detail for future recognition purposes."
        })
      })

      const data = await response.json()
      const description = data.description || 'Person description unavailable'
      
      const newPerson: Person = {
        id: Date.now().toString(),
        name: newPersonName.trim(),
        description: description,
        imageData: imageData
      }

      const updatedPeople = [...savedPeople, newPerson]
      savePeopleToStorage(updatedPeople)
      
      setNewPersonName('')
      setShowAddPerson(false)
      speakText(`Added ${newPerson.name} to your contacts`)
      setIsLoading(false)
    } catch (error) {
      console.error('Error adding person:', error)
      setError('Failed to add person')
      setIsLoading(false)
    }
  }

  // Delete person
  const deletePerson = (id: string) => {
    const updatedPeople = savedPeople.filter(person => person.id !== id)
    savePeopleToStorage(updatedPeople)
    speakText('Person removed from contacts')
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

  // Start face recognition
  const startFaceRecognition = async () => {
    setIsActive(true)
    await startCamera()
  }

  // Stop face recognition
  const stopFaceRecognition = () => {
    setIsActive(false)
    setError('')
    setIsLoading(false)
    setShowAddPerson(false)
    
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
    } else if (recognitionResult) {
      speakText(recognitionResult)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopFaceRecognition()
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
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Face Recognition</h1>
              <p className="text-gray-400">Recognize people and manage contacts</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Section */}
          <div className="lg:col-span-2">
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
                    className="w-full h-full object-cover scale-x-[-1]" // Mirror for front camera
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Face Detection Overlay */}
                  {isActive && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-48 h-64 border-2 border-purple-400 rounded-full opacity-50"></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Loading Indicator */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-gray-800/90 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-white">Analyzing face...</span>
                      </div>
                    </div>
                  )}

                  {/* Speaking Indicator */}
                  {isSpeaking && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-purple-500/30">
                      <Volume2 className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span className="text-sm text-purple-300">Speaking</span>
                    </div>
                  )}
                </div>

                {/* Recognition Result */}
                {recognitionResult && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Recognition Result:</h4>
                    <p className="text-white whitespace-pre-wrap">{recognitionResult}</p>
                  </div>
                )}

                {/* Add Person Form */}
                {showAddPerson && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Add New Person:</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter person's name"
                        value={newPersonName}
                        onChange={(e) => setNewPersonName(e.target.value)}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
                      />
                      <Button onClick={addNewPerson} disabled={!newPersonName.trim() || isLoading}>
                        <UserPlus className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => setShowAddPerson(false)} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {!isActive ? (
                    <Button
                      onClick={startFaceRecognition}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-8 py-3 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Starting Camera...
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5 mr-2" />
                          Start Face Recognition
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={captureAndRecognizeFace}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-3"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Recognize
                      </Button>
                      
                      <Button
                        onClick={() => setShowAddPerson(true)}
                        disabled={isLoading || showAddPerson}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-4 py-3"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Person
                      </Button>
                      
                      <Button
                        onClick={stopFaceRecognition}
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
                  <p>Position your face in the camera view for recognition.</p>
                  <p>Add people to build your personal contact database.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Saved People Section */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Saved People ({savedPeople.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {savedPeople.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">
                    No people saved yet. Use "Add Person" to start building your contact database.
                  </p>
                ) : (
                  savedPeople.map((person) => (
                    <div key={person.id} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                      <div className="flex items-center gap-3">
                        <img
                          src={person.imageData}
                          alt={person.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-purple-400"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{person.name}</h4>
                          <p className="text-xs text-gray-400 line-clamp-2">{person.description}</p>
                        </div>
                        <Button
                          onClick={() => deletePerson(person.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          ×
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
