"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useBoardStore } from "@/lib/store"
import { Activity, Play, Pause, Trash2, Download, Settings, Zap } from 'lucide-react'

export function WaveformSidebar() {
  const {
    boardState,
    waveformPins,
    toggleWaveformPin,
    connectionStatus
  } = useBoardStore()

  const [isPaused, setIsPaused] = useState(false)
  const [timeScale, setTimeScale] = useState(5000)

  if (!boardState || !boardState.gpio) {
    return (
      <div className="h-full border-r border-border p-6 bg-background/60">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            No Board Connected
          </h3>
          <p className="text-muted-foreground text-sm">
            Connect to a board to analyze waveforms
          </p>
        </div>
      </div>
    )
  }

  const gpioPins = Object.values(boardState.gpio || {}).sort((a, b) => a.pin - b.pin)

  const clearWaveforms = () => {
    console.log('Clearing waveforms')
  }

  const exportData = () => {
    console.log('Exporting waveform data')
  }

  return (
    <div className="h-full border-r border-border p-6 space-y-6 overflow-y-auto bg-background/60">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Zap className="w-5 h-5 mr-2 text-primary" />
            Waveform Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPaused(!isPaused)}
              className="flex-1"
            >
              {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearWaveforms}
              className=""
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={exportData}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </CardContent>
      </Card>

      {/* Time Scale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Settings className="w-5 h-5 mr-2 text-primary" />
            Time Scale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {[1000, 5000, 10000, 30000].map(scale => (
              <Button
                key={scale}
                size="sm"
                variant={timeScale === scale ? "default" : "outline"}
                onClick={() => setTimeScale(scale)}
                className={timeScale === scale ? "" : ""}
              >
                {scale / 1000}s
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pin Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Activity className="w-5 h-5 mr-2 text-primary" />
            Pin Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* GPIO Pins */}
          {gpioPins.length > 0 ? (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">GPIO Pins (BCM)</h4>
              <div className="space-y-2">
                {gpioPins.map(pin => (
                  <div key={pin.pin} className="flex items-center justify-between p-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`gpio-${pin.pin}`}
                        checked={waveformPins.includes(pin.pin)}
                        onCheckedChange={() => toggleWaveformPin(pin.pin)}
                      />
                      <div>
                        <label
                          htmlFor={`gpio-${pin.pin}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          GPIO {pin.pin}
                        </label>
                        {pin.label && (
                          <div className="text-xs text-muted-foreground">
                            {pin.label}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={pin.value === 1 ? 'default' : 'outline'} className={pin.value === 1 ? 'bg-green-500' : ''}>
                      {pin.value === 1 ? 'HIGH' : 'LOW'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No GPIO pins detected yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Waveforms */}
      {waveformPins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Active Waveforms ({waveformPins.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {waveformPins.map((pinNumber, index) => {
                const pin = gpioPins.find(p => p.pin === pinNumber)
                const colors = ['#8b5cf6', '#22c55e', '#eab308', '#f97316', '#06b6d4', '#ef4444']
                return (
                  <div key={pinNumber} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="text-sm font-medium">GPIO {pinNumber}</span>
                      {pin?.label && (
                        <span className="text-xs text-muted-foreground">({pin.label})</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleWaveformPin(pinNumber)}
                      className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
