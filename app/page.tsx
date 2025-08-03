"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Eye,
  FileText,
  ShoppingCart,
  Users,
  Camera,
  Mic,
  Volume2,
  Palette,
  ArrowRight,
  Star,
  Lightbulb,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CameraVision from "@/components/CameraVision"

export default function HomePage() {
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [spotlightOn, setSpotlightOn] = useState(true)
  const [showCameraVision, setShowCameraVision] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const toggleSpotlight = () => {
    setSpotlightOn(!spotlightOn)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden relative">
      {/* Spotlight Effect - Only active when spotlight is on */}
      {spotlightOn && (
        <div
          className="fixed inset-0 pointer-events-none z-50"
          style={{
            background: `radial-gradient(circle 200px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, transparent 40%, rgba(0,0,0,0.95) 100%)`,
            transition: "background 0.1s ease-out",
          }}
        />
      )}

      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-bounce delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Eye className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Be My Eyes
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-300 hover:text-blue-400 font-medium transition-colors">
                Features
              </a>
              <a href="#about" className="text-gray-300 hover:text-blue-400 font-medium transition-colors">
                About
              </a>
              <a href="#contact" className="text-gray-300 hover:text-blue-400 font-medium transition-colors">
                Contact
              </a>
            </nav>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
                <Star className="w-4 h-4 mr-2" />
                AI-Powered Vision Assistant
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Your Digital
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Vision
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
                Experience the world through advanced AI technology. Be My Eyes transforms your smartphone into a
                powerful vision assistant, providing instant access to visual information through intelligent
                recognition and natural voice interaction.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 shadow-xl"
                  onClick={() => setShowCameraVision(true)}
                >
                  <Camera className="w-5 h-5 mr-2" aria-hidden="true" />
                  Start Vision Tools
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 border-2 border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm"
                >
                  <Volume2 className="w-5 h-5 mr-2" aria-hidden="true" />
                  Try Voice Features
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>

              {/* Flipping Card Container */}
              <div className="relative group perspective-1000">
                <div className="relative w-full h-96 transform-style-preserve-3d transition-transform duration-700 group-hover:rotate-y-180">
                  {/* Front of Card */}
                  <div className="absolute inset-0 w-full h-full backface-hidden bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700">
                    <img
                      src="/images/hero-interface.webp"
                      alt="Person with visual impairment using a white cane for navigation, walking confidently along a modern sidewalk with glass storefronts, demonstrating independence and mobility"
                      className="w-full h-full object-cover rounded-2xl shadow-2xl"
                    />
                    <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-4 shadow-xl">
                      <div className="flex items-center space-x-2 text-white">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Vision AI Active</span>
                      </div>
                    </div>

                    {/* Hover Indicator */}
                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-6 h-6 border-2 border-white/50 rounded-full border-dashed animate-spin"></div>
                    </div>
                  </div>

                  {/* Back of Card */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/30 flex items-center justify-center">
                    <div className="text-center space-y-6">
                      {/* Decorative Quote Marks */}
                      <div className="text-6xl text-purple-300/30 font-serif leading-none">"</div>

                      {/* Main Quote */}
                      <blockquote className="text-2xl md:text-3xl font-light text-white leading-relaxed max-w-md mx-auto">
                        A lot of beautiful things are hidden from the people who cannot see
                      </blockquote>

                      {/* Closing Quote Mark */}
                      <div className="text-6xl text-purple-300/30 font-serif leading-none rotate-180">"</div>

                      {/* Decorative Elements */}
                      <div className="flex justify-center space-x-2 mt-6">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-200"></div>
                      </div>

                      {/* Subtitle */}
                      <p className="text-purple-200/80 text-sm font-medium tracking-wide">
                        Our mission is to reveal the world's beauty to everyone
                      </p>
                    </div>

                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-300 rounded-full blur-2xl"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spotlight Instructions - Only show when spotlight is on */}
      {spotlightOn && (
        <section className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Eye className="w-4 h-4 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-yellow-400">Vision Assistance Experience</h3>
              </div>
              <p className="text-gray-300">
                Move your cursor around to reveal content with our interactive flashlight effect. Experience how Be My
                Eyes illuminates information in low-vision scenarios.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Spotlight Off Instructions - Only show when spotlight is off */}
      {!spotlightOn && (
        <section className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-green-500/10 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-green-300" />
                </div>
                <h3 className="text-lg font-semibold text-green-300">Complete Accessibility View</h3>
              </div>
              <p className="text-gray-200">
                All content is now fully visible! This represents how Be My Eyes makes visual information accessible
                through AI assistance. Toggle the spotlight below to return to interactive mode.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Powerful Vision Assistance Features
            </h3>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Discover how Be My Eyes transforms visual challenges into opportunities for independence and connection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Text Recognition */}
            <Card className="group relative bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  {/* CHANGE THIS IMAGE: Replace with your own feature image */}
                  <img
                    src="/placeholder.jpg"
                    alt="Text recognition in action"
                    className="w-12 h-12 rounded-lg object-cover opacity-70"
                  />
                </div>
                <CardTitle className="text-xl text-white">Smart Text Reading</CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Instantly read any text from documents, signs, menus, and labels with advanced OCR technology. Get
                  real-time voice feedback as you point your camera at text.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Button
                  onClick={() => router.push('/text-reader')}
                  variant="outline"
                  className="w-full bg-gray-700/50 border-gray-600 hover:bg-blue-600/20 hover:border-blue-500 text-white"
                >
                  Start Text Reader
                </Button>
              </CardContent>
            </Card>

            {/* Product Scanner */}
            <Card className="group relative bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-green-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ShoppingCart className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  {/* CHANGE THIS IMAGE: Replace with your own feature image */}
                  <img
                    src="/placeholder.jpg"
                    alt="Product identification scanner"
                    className="w-12 h-12 rounded-lg object-cover opacity-70"
                  />
                </div>
                <CardTitle className="text-xl text-white">Product Identification</CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Identify products, barcodes, and currency with precision. Shop independently with audio-guided
                  scanning that helps you find and identify items with confidence.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Button
                  onClick={() => router.push('/product-scanner')}
                  variant="outline"
                  className="w-full bg-gray-700/50 border-gray-600 hover:bg-green-600/20 hover:border-green-500 text-white"
                >
                  Scan Products
                </Button>
              </CardContent>
            </Card>

            {/* Person Recognition */}
            <Card className="group relative bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  {/* CHANGE THIS IMAGE: Replace with your own feature image */}
                  <img
                    src="/placeholder.jpg"
                    alt="Person recognition feature"
                    className="w-12 h-12 rounded-lg object-cover opacity-70"
                  />
                </div>
                <CardTitle className="text-xl text-white">Face Recognition</CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Recognize friends, family, and colleagues with personalized face recognition. Get social context with
                  emotion detection to enhance your interactions and connections.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Button
                  onClick={() => router.push('/face-recognition')}
                  variant="outline"
                  className="w-full bg-gray-700/50 border-gray-600 hover:bg-purple-600/20 hover:border-purple-500 text-white"
                >
                  Manage People
                </Button>
              </CardContent>
            </Card>

            {/* Scene Description */}
            <Card className="group relative bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-orange-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Camera className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  {/* CHANGE THIS IMAGE: Replace with your own feature image */}
                  <img
                    src="/placeholder.jpg"
                    alt="AI scene description"
                    className="w-12 h-12 rounded-lg object-cover opacity-70"
                  />
                </div>
                <CardTitle className="text-xl text-white">Scene Understanding</CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Get rich, detailed descriptions of your environment. Understand spatial relationships, identify
                  objects, and navigate spaces with comprehensive AI-powered scene analysis.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Button
                  onClick={() => router.push('/scene-understanding')}
                  variant="outline"
                  className="w-full bg-gray-700/50 border-gray-600 hover:bg-orange-600/20 hover:border-orange-500 text-white"
                >
                  Describe Scene
                </Button>
              </CardContent>
            </Card>

            {/* Voice Assistant */}
            <Card className="group relative bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-red-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Mic className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  {/* CHANGE THIS IMAGE: Replace with your own feature image */}
                  <img
                    src="/placeholder.jpg"
                    alt="Voice assistant interface"
                    className="w-12 h-12 rounded-lg object-cover opacity-70"
                  />
                </div>
                <CardTitle className="text-xl text-white">Voice Navigation</CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Control all features hands-free with natural voice commands. Get intelligent audio feedback and
                  navigate the app entirely through voice interaction.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Button
                  onClick={() => router.push('/voice-control')}
                  variant="outline"
                  className="w-full bg-gray-700/50 border-gray-600 hover:bg-red-600/20 hover:border-red-500 text-white"
                >
                  Voice Control
                </Button>
              </CardContent>
            </Card>

            {/* Color Identifier */}
            <Card className="group relative bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-pink-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Palette className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  {/* CHANGE THIS IMAGE: Replace with your own feature image */}
                  <img
                    src="/placeholder.jpg"
                    alt="Color identification tool"
                    className="w-12 h-12 rounded-lg object-cover opacity-70"
                  />
                </div>
                <CardTitle className="text-xl text-white">Color Detection</CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Identify colors instantly for clothing coordination, object identification, and environmental
                  awareness. Get precise color names and descriptions in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Button
                  onClick={() => router.push('/color-detection')}
                  variant="outline"
                  className="w-full bg-gray-700/50 border-gray-600 hover:bg-pink-600/20 hover:border-pink-500 text-white"
                >
                  Detect Colors
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Spotlight Toggle Button at the bottom */}
      <div className="relative z-50 flex justify-center pb-8">
        <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700 shadow-2xl">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-400 mb-2">Vision Assistance Mode</p>
            <p className="text-xs text-gray-500">
              {spotlightOn ? "Vision Mode Active - Navigate with cursor" : "Full Accessibility View"}
            </p>
          </div>

          {/* Simple Toggle Button */}
          <div className="flex justify-center">
            <button
              onClick={toggleSpotlight}
              className={`relative px-8 py-4 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50 ${
                spotlightOn
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-lg shadow-yellow-500/30"
                  : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white shadow-lg shadow-green-500/30"
              }`}
              aria-label={spotlightOn ? "Turn off spotlight" : "Turn on spotlight"}
            >
              <div className="flex items-center space-x-2">
                {spotlightOn ? (
                  <>
                    <Eye className="w-5 h-5" />
                    <span>Disable Vision Mode</span>
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-5 h-5" />
                    <span>Enable Vision Mode</span>
                  </>
                )}
              </div>
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              Click to{" "}
              {spotlightOn
                ? "Experience how Be My Eyes assists with visual navigation"
                : "Try the interactive vision assistance experience"}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto text-center bg-gray-800/30 backdrop-blur-md rounded-3xl p-12 border border-gray-700">
          <h3 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Ready to See the World Differently?
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join millions of users who have discovered independence and confidence with Be My Eyes. Your personal AI
            vision assistant is ready to help you navigate the world.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-12 py-4 shadow-2xl"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/90 backdrop-blur-md border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Eye className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <h4 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Be My Eyes
                </h4>
              </div>
              <p className="text-gray-400 max-w-md">
                Empowering independence through AI-powered vision assistance. Making the visual world accessible to
                everyone, everywhere, every day.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4 text-white">Vision Tools</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Text Reading
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Product Scanner
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Scene Description
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Voice Control
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4 text-white">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Accessibility
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Be My Eyes. All rights reserved. Illuminating possibilities through technology.</p>
          </div>
        </div>
      </footer>

      {/* Camera Vision Modal */}
      {showCameraVision && (
        <CameraVision onClose={() => setShowCameraVision(false)} />
      )}
    </div>
  )
}
