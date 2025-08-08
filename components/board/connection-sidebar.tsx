"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { useBoardStore } from "@/lib/store"
import { Usb, Bluetooth, Wifi, AlertCircle, CheckCircle, Zap, RotateCcw, Settings, Activity } from 'lucide-react'

export function ConnectionSidebar() {
  const {
    connectionType,
    connectionStatus,
    connectionError,
    boardState,
    refreshRate,
    setConnectionType,
    setConnectionStatus,
    setConnectionError,
    setRefreshRate,
    selectPin
  } = useBoardStore()

  const [wifiAddress, setWifiAddress] = useState("192.168.1.100:81")

  const connectUSB = async () => {
    setConnectionType('usb')
    setConnectionStatus('connecting')
    setConnectionError(null)

    try {
      const nav = navigator as Navigator & { usb?: any; serial?: any }

      if (nav.usb) {
        const device = await nav.usb.requestDevice({
          filters: [
            { vendorId: 0x2341 }, // Arduino
            { vendorId: 0x10C4 }, // Silicon Labs (ESP32)
          ]
        })

        await device.open()
        setConnectionStatus('connected')
        simulateBoardData()
        return
      }

      if (nav.serial) {
        const port = await nav.serial.requestPort()
        await port.open({ baudRate: 115200 })
        setConnectionStatus('connected')
        simulateBoardData()
        return
      }

      throw new Error('This browser does not support WebUSB or Web Serial. Use Chrome/Edge on HTTPS or localhost.')

    } catch (error) {
      setConnectionStatus('error')
      setConnectionError(error instanceof Error ? error.message : 'USB connection failed')
    }
  }

  const connectBluetooth = async () => {
    setConnectionType('bluetooth')
    setConnectionStatus('connecting')
    setConnectionError(null)

    try {
      const nav = navigator as Navigator & { bluetooth?: any }
      if (!nav.bluetooth) {
        throw new Error('Web Bluetooth not supported')
      }

      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service']
      })

      const server = await device.gatt?.connect()
      setConnectionStatus('connected')
      simulateBoardData()

    } catch (error) {
      setConnectionStatus('error')
      setConnectionError(error instanceof Error ? error.message : 'Bluetooth connection failed')
    }
  }

  const connectWiFi = async () => {
    setConnectionType('wifi')
    setConnectionStatus('connecting')
    setConnectionError(null)

    try {
      const ws = new WebSocket(`ws://${wifiAddress}`)

      ws.onopen = () => {
        setConnectionStatus('connected')
        simulateBoardData()
      }

      ws.onerror = () => {
        setConnectionStatus('error')
        setConnectionError('WiFi connection failed')
      }

    } catch (error) {
      setConnectionStatus('error')
      setConnectionError(error instanceof Error ? error.message : 'WiFi connection failed')
    }
  }

  const disconnect = () => {
    setConnectionStatus('disconnected')
    setConnectionType(null)
    setConnectionError(null)
  }

  const simulateBoardData = () => {
    const { updateBoardState, addWaveformData } = useBoardStore.getState()

    const mockBoardState = {
      boardType: "ARDUINO_UNO",
      pins: [
        { id: "D13", type: "DIGITAL" as const, mode: "OUTPUT" as const, value: "HIGH" as const, isPWM: false },
        { id: "D12", type: "DIGITAL" as const, mode: "INPUT" as const, value: "LOW" as const, isPWM: false },
        { id: "D11", type: "DIGITAL" as const, mode: "OUTPUT" as const, value: "HIGH" as const, isPWM: true, pwmDuty: 75 },
        { id: "A0", type: "ANALOG" as const, mode: "INPUT" as const, value: 512, voltage: 2.5 },
        { id: "A1", type: "ANALOG" as const, mode: "INPUT" as const, value: 256, voltage: 1.25 },
        { id: "D2", type: "DIGITAL" as const, mode: "INPUT" as const, value: "LOW" as const, isPWM: false },
        { id: "D3", type: "DIGITAL" as const, mode: "OUTPUT" as const, value: "LOW" as const, isPWM: false },
      ],
      powerStatus: {
        voltage: 4.8,
        isLow: true
      }
    }

    updateBoardState(mockBoardState)

    setInterval(() => {
      const updatedState = {
        ...mockBoardState,
        pins: mockBoardState.pins.map(pin => {
          if (pin.type === 'ANALOG') {
            return {
              ...pin,
              value: Math.floor(Math.random() * 1024),
              voltage: (Math.random() * 5)
            }
          }
          if (pin.type === 'DIGITAL' && pin.mode === 'INPUT') {
            return {
              ...pin,
              value: Math.random() > 0.5 ? "HIGH" as const : "LOW" as const
            }
          }
          return pin
        })
      }

      updateBoardState(updatedState)

      const timestamp = Date.now()
      updatedState.pins.forEach(pin => {
        if (pin.type === 'ANALOG') {
          addWaveformData(pin.id, [{
            timestamp,
            value: typeof pin.value === 'number' ? pin.value : 0
          }])
        }
      })
    }, refreshRate)
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'connecting':
        return <Activity className="w-4 h-4 text-blue-400 animate-spin" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return null
    }
  }

  const getStatusBadge = () => {
    const variants = {
      disconnected: 'secondary',
      connecting: 'default',
      connected: 'default',
      error: 'destructive'
    } as const

    const colors = {
      disconnected: 'text-gray-400',
      connecting: 'text-blue-400',
      connected: 'text-green-400',
      error: 'text-red-400'
    }

    return (
      <Badge variant="outline" className={`ml-2 border-white/20 ${colors[connectionStatus]}`}>
        {getStatusIcon()}
        <span className="ml-1 capitalize">{connectionStatus}</span>
      </Badge>
    )
  }

  return (
    <div className="h-full border-r border-border p-6 space-y-6 overflow-y-auto bg-background/60">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Zap className="w-5 h-5 mr-2 text-primary" />
            Connection
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connectionStatus === 'connected' ? (
            <div className="space-y-4">
              <div className="p-3 rounded-md border border-green-500/20 bg-green-500/10">
                <p className="text-sm text-emerald-400 font-medium">
                  Connected via {connectionType?.toUpperCase()}
                </p>
                <p className="text-xs text-emerald-300/70 mt-1">
                  {boardState?.boardType || 'Unknown Board'}
                </p>
              </div>
              <Button
                onClick={disconnect}
                variant="outline"
                className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="usb" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="usb" className="data-[state=active]:bg-secondary">
                  <Usb className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="bluetooth" className="data-[state=active]:bg-secondary">
                  <Bluetooth className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="wifi" className="data-[state=active]:bg-secondary">
                  <Wifi className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="usb" className="space-y-4 mt-4">
                <Button
                  onClick={connectUSB}
                  disabled={connectionStatus === 'connecting'}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect via USB'}
                </Button>
              </TabsContent>

              <TabsContent value="bluetooth" className="space-y-4 mt-4">
                <Button
                  onClick={connectBluetooth}
                  disabled={connectionStatus === 'connecting'}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {connectionStatus === 'connecting' ? 'Connecting...' : 'Scan & Connect'}
                </Button>
              </TabsContent>

              <TabsContent value="wifi" className="space-y-4 mt-4">
                <Input
                  placeholder="192.168.1.100:81"
                  value={wifiAddress}
                  onChange={(e) => setWifiAddress(e.target.value)}
                  className=""
                />
                <Button
                  onClick={connectWiFi}
                  disabled={connectionStatus === 'connecting'}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect via WiFi'}
                </Button>
              </TabsContent>
            </Tabs>
          )}

          {connectionError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-sm text-red-400">{connectionError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Board Settings */}
      {connectionStatus === 'connected' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Settings className="w-5 h-5 mr-2 text-primary" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-muted-foreground">Refresh Rate</label>
                <span className="text-sm text-foreground">{refreshRate}ms</span>
              </div>
              <Slider
                value={[refreshRate]}
                onValueChange={(value) => setRefreshRate(value[0])}
                min={50}
                max={1000}
                step={50}
                className="w-full"
              />
            </div>

            <Button variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Board
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pin Overview */}
      {boardState && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Pin Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {boardState.pins.map((pin) => (
                <div
                  key={pin.id}
                  onClick={() => selectPin(pin)}
                  className="flex items-center justify-between p-2 rounded-md bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${pin.type === 'DIGITAL'
                        ? pin.value === 'HIGH' ? 'bg-emerald-400' : 'bg-red-400'
                        : 'bg-primary'
                      }`} />
                    <span className="text-sm font-medium">{pin.id}</span>
                    <Badge variant="outline" className="text-xs">
                      {pin.type}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {pin.type === 'ANALOG'
                      ? `${pin.value}${pin.voltage ? ` (${pin.voltage.toFixed(1)}V)` : ''}`
                      : pin.value
                    }
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
