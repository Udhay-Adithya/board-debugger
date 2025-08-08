"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBoardStore } from "@/lib/store"
import { Usb, Bluetooth, Wifi, AlertCircle, CheckCircle } from 'lucide-react'

export function ConnectionManager() {
  const {
    connectionType,
    connectionStatus,
    connectionError,
    setConnectionType,
    setConnectionStatus,
    setConnectionError
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
        // Start mock data simulation
        simulateBoardData()
        return
      }

      // Fallback to Web Serial (supported in Chrome/Edge) when WebUSB is unavailable
      if (nav.serial) {
        const port = await nav.serial.requestPort()
        // Try a common baud rate; real app should allow configuring this
        await port.open({ baudRate: 115200 })
        setConnectionStatus('connected')
        simulateBoardData()
        return
      }

      // Neither API available
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
      
      // Start mock data simulation
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

  // Mock data simulation for demonstration
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
    
    // Simulate real-time data updates
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
      
      // Add waveform data
      const timestamp = Date.now()
      updatedState.pins.forEach(pin => {
        if (pin.type === 'ANALOG') {
          addWaveformData(pin.id, [{
            timestamp,
            value: typeof pin.value === 'number' ? pin.value : 0
          }])
        }
      })
    }, 100)
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
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

    return (
      <Badge variant={variants[connectionStatus]} className="ml-2">
        {getStatusIcon()}
        <span className="ml-1 capitalize">{connectionStatus}</span>
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Connection
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {connectionStatus === 'connected' ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connected via {connectionType?.toUpperCase()}
            </p>
            <Button onClick={disconnect} variant="outline" className="w-full">
              Disconnect
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="usb" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="usb">
                <Usb className="w-4 h-4 mr-1" />
                USB
              </TabsTrigger>
              <TabsTrigger value="bluetooth">
                <Bluetooth className="w-4 h-4 mr-1" />
                BLE
              </TabsTrigger>
              <TabsTrigger value="wifi">
                <Wifi className="w-4 h-4 mr-1" />
                WiFi
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="usb" className="space-y-4">
              <Button 
                onClick={connectUSB} 
                disabled={connectionStatus === 'connecting'}
                className="w-full"
              >
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect via USB'}
              </Button>
            </TabsContent>
            
            <TabsContent value="bluetooth" className="space-y-4">
              <Button 
                onClick={connectBluetooth}
                disabled={connectionStatus === 'connecting'}
                className="w-full"
              >
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Scan & Connect'}
              </Button>
            </TabsContent>
            
            <TabsContent value="wifi" className="space-y-4">
              <Input
                placeholder="192.168.1.100:81"
                value={wifiAddress}
                onChange={(e) => setWifiAddress(e.target.value)}
              />
              <Button 
                onClick={connectWiFi}
                disabled={connectionStatus === 'connecting'}
                className="w-full"
              >
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect via WiFi'}
              </Button>
            </TabsContent>
          </Tabs>
        )}
        
        {connectionError && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{connectionError}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
