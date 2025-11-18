"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useBoardStore } from "@/lib/store"
import { Activity } from 'lucide-react'

export function PinDetailsPanel() {
  const { selectedPin, toggleWaveformPin, waveformPins } = useBoardStore()

  if (!selectedPin) return null

  const isWaveformActive = waveformPins.includes(selectedPin.pin)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          GPIO Pin {selectedPin.pin}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pin Label */}
        {selectedPin.label && (
          <div>
            <h4 className="text-sm font-medium mb-2">Label</h4>
            <Badge variant="secondary" className="text-sm">{selectedPin.label}</Badge>
          </div>
        )}

        {/* Current Value */}
        <div>
          <h4 className="text-sm font-medium mb-2">Current State</h4>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold">
              {selectedPin.value === 1 ? 'HIGH' : 'LOW'}
            </div>
            <Badge
              variant={selectedPin.value === 1 ? 'default' : 'secondary'}
              className={selectedPin.value === 1 ? 'bg-green-500' : 'bg-gray-500'}
            >
              {selectedPin.value}
            </Badge>
          </div>
        </div>

        {/* Pin Info */}
        <div>
          <h4 className="text-sm font-medium mb-2">Pin Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">BCM Number:</span>
              <span className="font-medium">{selectedPin.pin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">GPIO (Digital Input)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mode:</span>
              <span className="font-medium">Input</span>
            </div>
          </div>
        </div>

        {/* Waveform Monitoring */}
        <div>
          <h4 className="text-sm font-medium mb-2">Monitoring</h4>
          <Button
            onClick={() => toggleWaveformPin(selectedPin.pin)}
            variant={isWaveformActive ? 'default' : 'outline'}
            className="w-full"
          >
            {isWaveformActive ? '📊 Stop Waveform' : '📈 Start Waveform'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            {isWaveformActive
              ? 'Pin state changes are being recorded and displayed in the waveform viewer.'
              : 'Click to start monitoring this pin in the waveform viewer.'
            }
          </p>
        </div>

        {/* Pin Description */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">About GPIO Pins</h4>
          <p className="text-xs text-muted-foreground">
            Raspberry Pi GPIO pins are configured as inputs by default. Connect buttons,
            switches, or sensors to monitor digital state changes in real-time.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
            )}

{
  selectedPin.isPWM && (
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
  )
}
          </div >
        )}

{/* Waveform Toggle */ }
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

{/* Pin Information */ }
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
      </CardContent >
    </Card >
  )
}
