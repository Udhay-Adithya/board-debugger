"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight, Cpu, Activity, Zap, Usb, Bluetooth, Wifi, Eye, BarChart3, Settings, Play, CheckCircle, Star } from 'lucide-react'

const features = [
  {
    icon: Eye,
    title: "3D Visualization",
    description: "Interactive 3D board models with real-time pin state visualization",
    color: "from-blue-500 to-cyan-400"
  },
  {
    icon: Activity,
    title: "Live Waveforms",
    description: "Real-time signal analysis with advanced charting capabilities",
    color: "from-green-500 to-emerald-400"
  },
  {
    icon: Settings,
    title: "Pin Control",
    description: "Direct GPIO control with intuitive interface and instant feedback",
    color: "from-purple-500 to-pink-400"
  }
]

const connections = [
  {
    icon: Usb,
    title: "USB Connection",
    description: "Direct serial communication via Web USB API",
    step: "01"
  },
  {
    icon: Bluetooth,
    title: "Bluetooth LE",
    description: "Wireless debugging with Web Bluetooth support",
    step: "02"
  },
  {
    icon: Wifi,
    title: "WiFi WebSocket",
    description: "Network-based real-time data streaming",
    step: "03"
  }
]

const testimonials = [
  {
    name: "Alex Chen",
    role: "Embedded Systems Engineer",
    content: "This tool has revolutionized how I debug my Arduino projects. The 3D visualization makes it so much easier to understand what's happening.",
    rating: 5
  },
  {
    name: "Sarah Johnson",
    role: "Electronics Hobbyist",
    content: "Finally, a debugging tool that doesn't require expensive equipment. The real-time waveforms are incredibly detailed.",
    rating: 5
  },
  {
    name: "Mike Rodriguez",
    role: "IoT Developer",
    content: "The WiFi connection feature is a game-changer for remote debugging. Clean interface and powerful features.",
    rating: 5
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-300">Real-time Board Debugging</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text">Unleash Your</span>
              <br />
              <span className="gradient-text-accent">Board's Secrets</span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed">
              Visualize GPIO pins, analyze waveforms, and control your microcontroller
              in real-time without expensive lab equipment.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/board">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 neon-glow">
                  Launch Debugger
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/5 px-8 py-4 text-lg rounded-xl transition-all duration-300">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>No Installation Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Works in Browser</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Real-time Updates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 gradient-text">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect your board through multiple protocols and start debugging immediately
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {connections.map((connection, index) => (
              <Card key={connection.title} className="glass border-white/10 hover:border-white/20 transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
                    <div className="relative w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                      <connection.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {connection.step}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-3 text-white">
                    {connection.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {connection.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 gradient-text">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need for professional board debugging and analysis
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={feature.title} className="glass border-white/10 hover:border-white/20 transition-all duration-500 group hover:scale-105">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-2xl font-semibold mb-4 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 gradient-text">
              What Developers Say
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of developers who trust Board Debugger for their projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.name} className="glass border-white/10 hover:border-white/20 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <p className="text-gray-300 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  <div>
                    <div className="font-semibold text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 gradient-text">
              Ready to Debug Like a Pro?
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Start visualizing your board's behavior in real-time. No downloads, no setup required.
            </p>

            <Link href="/board">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 text-white px-12 py-6 text-xl font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 neon-glow">
                Launch Board Debugger
                <Cpu className="w-6 h-6 ml-3" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
