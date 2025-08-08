"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useBoardStore } from "@/lib/store"
import { Activity, BarChart3, Zap, X, Power, Settings } from 'lucide-react'

export function PinDetailsPanel() {
  const { selectedPin, sendCommand, toggleWaveformPin, waveformPins, selectPin } = useBoardStore()

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
        return <Activity className="w-5 h-5 text-blue-400" />
      case 'DIGITAL':
        return selectedPin.isPWM ? <Zap className="w-5 h-5 text-orange-400" /> : <BarChart3 className="w-5 h-5 text-green-400" />
      default:
        return <BarChart3 className="w-5 h-5 text-gray-400" />
    }
  }

  const getValueDisplay = () => {
    if (selectedPin.type === 'ANALOG') {
      return (
        <div className="space-y-2">
          <div className="text-4xl font-bold gradient-text-accent">
            {selectedPin.value}
          </div>
          {selectedPin.voltage && (
            <div className="text-xl text-gray-300">
              {selectedPin.voltage.toFixed(2)}V
            </div>
          )}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(typeof selectedPin.value === 'number' ? selectedPin.value : 0) / 1023 * 100}%` }}
            />
          </div>
        </div>
      )
    }
    
    return (
      <div className="space-y-2">
        <div className={`text-4xl font-bold ${selectedPin.value === 'HIGH' ? 'text-green-400' : 'text-red-400'}`}>
          {selectedPin.value}
        </div>
        {selectedPin.isPWM && selectedPin.pwmDuty && (
          <div className="text-xl text-gray-300">
            {selectedPin.pwmDuty}% PWM
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full glass border-l border-white/10 p-6 space-y-6 overflow-y-auto animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getPinIcon()}
          <div>
            <h2 className="text-2xl font-bold text-white">Pin {selectedPin.id}</h2>
            <Badge variant="outline" className="border-white/20 text-cyan-400">
              {selectedPin.type}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectPin(null)}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Current Value */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white">Current Value</CardTitle>
        </CardHeader>
        <CardContent>
          {getValueDisplay()}
        </CardContent>
      </Card>

      {/* Pin Mode */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-white">
            <Settings className="w-4 h-4 mr-2" />
            Pin Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Current Mode:</span>
            <Badge variant="secondary" className="bg-white/10 text-white">
              {selectedPin.mode}
            </Badge>
          </div>
          
          {selectedPin.mode === 'OUTPUT' && (
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleModeChange('INPUT')}
                className="w-full border-white/20 text-gray-300 hover:bg-white/5"
              >
                Switch to Input
              </Button>
            </div>
          )}
          
          {selectedPin.mode === 'INPUT' && (
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleModeChange('OUTPUT')}
                className="w-full border-white/20 text-gray-300 hover:bg-white/5"
              >
                Switch to Output
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleModeChange('INPUT_PULLUP')}
                className="w-full border-white/20 text-gray-300 hover:bg-white/5"
              >
                Enable Pull-up
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controls for Output pins */}
      {selectedPin.mode === 'OUTPUT' && (
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-white">
              <Power className="w-4 h-4 mr-2" />
              Pin Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPin.type === 'DIGITAL' && !selectedPin.isPWM && (
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Digital Output</label>
                <Button
                  onClick={handleDigitalToggle}
                  className={`w-full transition-all duration-300 ${
                    selectedPin.value === 'HIGH' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300' 
                      : 'bg-gradient-to-r from-red-500 to-rose-400 hover:from-red-400 hover:to-rose-300'
                  }`}
                >
                  {selectedPin.value === 'HIGH' ? 'Set LOW' : 'Set HIGH'}
                </Button>
              </div>
            )}

            {selectedPin.isPWM && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-300">PWM Duty Cycle</label>
                  <span className="text-sm text-cyan-400">{selectedPin.pwmDuty || 0}%</span>
                </div>
                <Slider
                  value={[selectedPin.pwmDuty || 0]}
                  onValueChange={handlePWMChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Waveform Toggle */}
      <Card className="glass border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-white">Show Waveform</h4>
              <p className="text-xs text-gray-400">
                Monitor this pin in the waveform viewer
              </p>
            </div>
            <Switch
              checked={isWaveformActive}
              onCheckedChange={() => toggleWaveformPin(selectedPin.id)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pin Information */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white">Pin Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Type:</span>
              <span className="text-white ml-2">{selectedPin.type}</span>
            </div>
            <div>
              <span className="text-gray-400">Mode:</span>
              <span className="text-white ml-2">{selectedPin.mode}</span>
            </div>
            {selectedPin.isPWM && (
              <div>
                <span className="text-gray-400">PWM:</span>
                <span className="text-green-400 ml-2">Capable</span>
              </div>
            )}
            {selectedPin.type === 'ANALOG' && (
              <div>
                <span className="text-gray-400">Resolution:</span>
                <span className="text-white ml-2">10-bit (0-1023)</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
