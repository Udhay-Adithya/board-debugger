"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight, Cpu, Activity, Usb, Bluetooth, Wifi, Eye, Settings, Play, CheckCircle, Star } from 'lucide-react'

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
      <section className="py-16 lg:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Real-time board debugging</p>
            <h1 className="text-4xl lg:text-6xl font-semibold mb-5 leading-[1.1]">
              Precision tools for modern embedded debugging
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-10 leading-relaxed">
              Visualize pins in 3D, stream waveforms, and control GPIOs directly from your browser.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/board">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-7 py-4 text-base font-medium rounded-lg">
                  Launch Debugger
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Button variant="outline" size="lg" className="px-7 py-4 text-base rounded-lg">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>No Installation Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Works in Browser</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Real-time Updates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-semibold mb-3">How it works</h2>
            <p className="text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
              Connect your board through multiple protocols and start debugging immediately
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {connections.map((connection, index) => (
              <Card key={connection.title} className="transition-colors duration-150">
                <CardContent className="p-8 text-center">
                  <div className="mb-5 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-md bg-secondary text-secondary-foreground flex items-center justify-center">
                      <connection.icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-medium mb-2">
                    {connection.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {connection.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-semibold mb-3">Features</h2>
            <p className="text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need for professional board debugging and analysis
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={feature.title} className="transition-colors duration-150">
                <CardContent className="p-8">
                  <div className="w-10 h-10 rounded-md bg-secondary text-secondary-foreground flex items-center justify-center mb-5">
                    <feature.icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-lg font-medium mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-semibold mb-3">What developers say</h2>
            <p className="text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
              Join thousands of developers who trust Board Debugger for their projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.name} className="transition-colors duration-150">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  <div>
                    <div className="font-medium">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
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
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-semibold mb-3">Ready to debug like a pro?</h2>
            <p className="text-base lg:text-lg text-muted-foreground mb-8 leading-relaxed">
              Start visualizing your board's behavior in real-time. No downloads, no setup required.
            </p>

            <Link href="/board">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-5 text-base rounded-lg">
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
