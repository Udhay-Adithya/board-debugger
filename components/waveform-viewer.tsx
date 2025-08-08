"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useBoardStore } from "@/lib/store"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useState } from "react"
import { Play, Pause, Trash2 } from 'lucide-react'

export function WaveformViewer() {
  const { 
    boardState, 
    waveformData, 
    waveformPins, 
    toggleWaveformPin 
  } = useBoardStore()
  
  const [isPaused, setIsPaused] = useState(false)
  const [timeScale, setTimeScale] = useState(5000) // 5 seconds

  if (!boardState) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Waveform Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Connect to a board to view waveforms
          </p>
        </CardContent>
      </Card>
    )
  }

  const analogPins = boardState.pins.filter(pin => pin.type === 'ANALOG')
  const digitalPins = boardState.pins.filter(pin => pin.type === 'DIGITAL')

  // Prepare chart data
  const now = Date.now()
  const startTime = now - timeScale
  
  const chartData: any[] = []
  const timePoints = new Set<number>()
  
  // Collect all time points
  waveformPins.forEach(pinId => {
    const data = waveformData[pinId] || []
    data.forEach(point => {
      if (point.timestamp >= startTime) {
        timePoints.add(point.timestamp)
      }
    })
  })
  
  // Create chart data points
  Array.from(timePoints).sort().forEach(timestamp => {
    const dataPoint: any = { timestamp }
    
    waveformPins.forEach(pinId => {
      const data = waveformData[pinId] || []
      const point = data.find(p => p.timestamp === timestamp)
      if (point) {
        dataPoint[pinId] = point.value
      }
    })
    
    chartData.push(dataPoint)
  })

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff']

  const clearWaveforms = () => {
    // This would clear the waveform data
    console.log('Clearing waveforms')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Waveform Viewer
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearWaveforms}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Pin Selection */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Select pins to monitor:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[...analogPins, ...digitalPins].map(pin => (
                <div key={pin.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={pin.id}
                    checked={waveformPins.includes(pin.id)}
                    onCheckedChange={() => toggleWaveformPin(pin.id)}
                  />
                  <label
                    htmlFor={pin.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {pin.id} ({pin.type})
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Time Scale Controls */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Time Scale:</span>
            {[1000, 5000, 10000, 30000].map(scale => (
              <Button
                key={scale}
                size="sm"
                variant={timeScale === scale ? "default" : "outline"}
                onClick={() => setTimeScale(scale)}
              >
                {scale / 1000}s
              </Button>
            ))}
          </div>

          {/* Chart */}
          {waveformPins.length > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp"
                    type="number"
                    scale="time"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleTimeString()
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => {
                      const date = new Date(value as number)
                      return date.toLocaleTimeString()
                    }}
                  />
                  <Legend />
                  {waveformPins.map((pinId, index) => (
                    <Line
                      key={pinId}
                      type="monotone"
                      dataKey={pinId}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <p className="text-muted-foreground">Select pins to view their waveforms</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
