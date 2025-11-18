"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBoardStore } from "@/lib/store"
import { Activity, TrendingUp, Zap } from 'lucide-react'
import { useEffect, useRef } from 'react'

export function WaveformChart() {
  const {
    boardState,
    waveformData,
    waveformPins,
    connectionStatus
  } = useBoardStore()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

  // Digital signal visualization for binary GPIO data
  useEffect(() => {
    if (!canvasRef.current || waveformPins.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const width = canvas.width
      const height = canvas.height
      const now = Date.now()
      const timeWindow = 10000 // 10 seconds
      const startTime = now - timeWindow

      // Clear canvas
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 1

      // Vertical time grid lines (every 1 second)
      for (let i = 0; i <= 10; i++) {
        const x = (width * i) / 10
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()

        // Time labels
        ctx.fillStyle = '#666'
        ctx.font = '10px Inter'
        ctx.fillText(`${i}s`, x + 2, height - 5)
      }

      // Draw each pin's waveform
      const pinHeight = (height - 40) / waveformPins.length
      const colors = ['#8b5cf6', '#22c55e', '#eab308', '#f97316', '#06b6d4', '#ef4444']

      waveformPins.forEach((pinNumber, index) => {
        const pin = boardState?.gpio?.[pinNumber]
        const data = waveformData[pinNumber] || []
        const color = colors[index % colors.length]
        const yBase = 20 + index * pinHeight
        const yHigh = yBase + pinHeight * 0.2
        const yLow = yBase + pinHeight * 0.8

        // Draw horizontal grid line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
        ctx.beginPath()
        ctx.moveTo(0, yBase)
        ctx.lineTo(width, yBase)
        ctx.stroke()

        // Draw pin label
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px Inter'
        ctx.fillText(`GPIO ${pinNumber}`, 10, yBase + 15)

        if (pin?.label) {
          ctx.fillStyle = '#999'
          ctx.font = '10px Inter'
          ctx.fillText(pin.label, 10, yBase + 28)
        }

        // Draw HIGH/LOW reference lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.setLineDash([2, 2])
        ctx.beginPath()
        ctx.moveTo(100, yHigh)
        ctx.lineTo(width, yHigh)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(100, yLow)
        ctx.lineTo(width, yLow)
        ctx.stroke()
        ctx.setLineDash([])

        // Draw HIGH/LOW labels
        ctx.fillStyle = '#22c55e'
        ctx.font = '10px Inter'
        ctx.fillText('HIGH', width - 40, yHigh + 3)
        ctx.fillStyle = '#ef4444'
        ctx.fillText('LOW', width - 40, yLow + 3)

        // Draw waveform as digital steps
        const filteredData = data.filter(p => p.timestamp >= startTime)

        if (filteredData.length > 0) {
          ctx.strokeStyle = color
          ctx.lineWidth = 2
          ctx.beginPath()

          let lastY = filteredData[0].value === 1 ? yHigh : yLow
          let lastX = 100

          filteredData.forEach((point, i) => {
            const x = 100 + ((point.timestamp - startTime) / timeWindow) * (width - 100)
            const y = point.value === 1 ? yHigh : yLow

            if (i === 0) {
              ctx.moveTo(lastX, lastY)
            }

            // Draw vertical transition
            if (y !== lastY) {
              ctx.lineTo(x, lastY)
              ctx.lineTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }

            lastX = x
            lastY = y
          })

          // Extend to current time
          ctx.lineTo(width, lastY)
          ctx.stroke()

          // Draw state change markers
          ctx.fillStyle = color
          filteredData.forEach((point) => {
            const x = 100 + ((point.timestamp - startTime) / timeWindow) * (width - 100)
            const y = point.value === 1 ? yHigh : yLow

            ctx.beginPath()
            ctx.arc(x, y, 3, 0, Math.PI * 2)
            ctx.fill()
          })

          // Current state indicator
          const currentValue = filteredData[filteredData.length - 1]?.value || 0
          const currentY = currentValue === 1 ? yHigh : yLow
          ctx.fillStyle = color
          ctx.shadowBlur = 10
          ctx.shadowColor = color
          ctx.beginPath()
          ctx.arc(width - 10, currentY, 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
      })

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [waveformData, waveformPins, boardState])

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement
        if (parent) {
          canvasRef.current.width = parent.clientWidth
          canvasRef.current.height = parent.clientHeight
        }
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (connectionStatus !== 'connected') {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Activity className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              No Board Connected
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Connect to a board to view waveforms
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (waveformPins.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="flex items-center text-base md:text-xl">
            <Zap className="w-5 h-5 md:w-6 md:h-6 mr-2 text-primary" />
            <span className="hidden sm:inline">Digital Signal Analyzer</span>
            <span className="sm:hidden">Signals</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-full flex items-center justify-center p-4">
          <div className="text-center">
            <Activity className="w-12 h-12 md:w-16 md:h-16 mx-auto text-muted-foreground mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-semibold mb-2">
              No Pins Selected
            </h3>
            <p className="text-sm md:text-base text-muted-foreground px-4">
              Select GPIO pins from the sidebar
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="p-3 md:p-6">
        <CardTitle className="flex items-center justify-between text-base md:text-xl">
          <div className="flex items-center">
            <Zap className="w-5 h-5 md:w-6 md:h-6 mr-2 text-primary" />
            <span className="hidden sm:inline">Digital Signal Timeline</span>
            <span className="sm:hidden">Signals</span>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4 text-xs md:text-sm text-muted-foreground">
            <span className="hidden sm:inline">Window: 10s</span>
            <span className="hidden sm:inline">•</span>
            <span>{waveformPins.length} Active</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)] md:h-[calc(100%-5rem)] p-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ imageRendering: 'crisp-edges' }}
        />
      </CardContent>
    </Card>
  )
}
