"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useBoardStore } from "@/lib/store"
import { Activity, BarChart3, Zap } from 'lucide-react'

export function PinDetailsPanel() {
  const { selectedPin, sendCommand, toggleWaveformPin, waveformPins } = useBoardStore()

  if (!selectedPin) return null

  const isWaveformActive = waveformPins.includes(selectedPin.id)

  const handleDigitalToggle = () => {
    const newValue = selectedPin.value === 'HIGH' ? 'LOW' : 'HIGH'
    sendCommand({
      command: 'SET_DIGITAL',
      pinId: selectedPin.id,
      value: newValue
    })
  }

  const handlePWMChange = (value: number[]) => {
    sendCommand({
      command: 'SET_ANALOG_PWM',
      pinId: selectedPin.id,
      value: value[0]
    })
  }

  const handleModeChange = (mode: string) => {
    sendCommand({
      command: 'SET_PIN_MODE',
      pinId: selectedPin.id,
      mode
    })
  }

  const getPinIcon = () => {
    switch (selectedPin.type) {
      case 'ANALOG':
        return <Activity className="w-4 h-4" />
      case 'DIGITAL':
        return selectedPin.isPWM ? <Zap className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />
      default:
        return <BarChart3 className="w-4 h-4" />
    }
  }

  const getValueDisplay = () => {
    if (selectedPin.type === 'ANALOG') {
      return (
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {selectedPin.value}
          </div>
          {selectedPin.voltage && (
            <div className="text-lg text-muted-foreground">
              {selectedPin.voltage.toFixed(2)}V
            </div>
          )}
        </div>
      )
    }
    
    return (
      <div className="space-y-2">
        <div className="text-2xl font-bold">
          {selectedPin.value}
        </div>
        {selectedPin.isPWM && selectedPin.pwmDuty && (
          <div className="text-lg text-muted-foreground">
            {selectedPin.pwmDuty}% PWM
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getPinIcon()}
          Pin {selectedPin.id}
          <Badge variant="outline">{selectedPin.type}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Value */}
        <div>
          <h4 className="text-sm font-medium mb-2">Current Value</h4>
          {getValueDisplay()}
        </div>

        {/* Pin Mode */}
        <div>
          <h4 className="text-sm font-medium mb-2">Mode</h4>
          <Badge variant="secondary">{selectedPin.mode}</Badge>
          
          {selectedPin.mode === 'OUTPUT' && (
            <div className="mt-2 space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleModeChange('INPUT')}
              >
                Set as Input
              </Button>
            </div>
          )}
          
          {selectedPin.mode === 'INPUT' && (
            <div className="mt-2 space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleModeChange('OUTPUT')}
              >
                Set as Output
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleModeChange('INPUT_PULLUP')}
              >
                Enable Pull-up
              </Button>
            </div>
          )}
        </div>

        {/* Controls for Output pins */}
        {selectedPin.mode === 'OUTPUT' && (
          <div className="space-y-4">
            {selectedPin.type === 'DIGITAL' && !selectedPin.isPWM && (
              <div>
                <h4 className="text-sm font-medium mb-2">Digital Control</h4>
                <Button
                  onClick={handleDigitalToggle}
                  variant={selectedPin.value === 'HIGH' ? 'default' : 'outline'}
                  className="w-full"
                >
                  {selectedPin.value === 'HIGH' ? 'Set LOW' : 'Set HIGH'}
                </Button>
              </div>
            )}

            {selectedPin.isPWM && (
              <div>
                <h4 className="text-sm font-medium mb-2">PWM Control</h4>
                <Slider
                  value={[selectedPin.pwmDuty || 0]}
                  onValueChange={handlePWMChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Waveform Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Show Waveform</h4>
            <p className="text-xs text-muted-foreground">
              Monitor this pin in the waveform viewer
            </p>
          </div>
          <Switch
            checked={isWaveformActive}
            onCheckedChange={() => toggleWaveformPin(selectedPin.id)}
          />
        </div>

        {/* Pin Information */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Pin Information</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>Type: {selectedPin.type}</div>
            <div>Mode: {selectedPin.mode}</div>
            {selectedPin.isPWM && <div>PWM Capable: Yes</div>}
            {selectedPin.type === 'ANALOG' && (
              <div>Resolution: 10-bit (0-1023)</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
