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

  const [wifiAddress, setWifiAddress] = useState("10.75.195.61:8000/ws")

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
        return
      }

      // Fallback to Web Serial (supported in Chrome/Edge) when WebUSB is unavailable
      if (nav.serial) {
        const port = await nav.serial.requestPort()
        // Try a common baud rate; real app should allow configuring this
        await port.open({ baudRate: 115200 })
        setConnectionStatus('connected')
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
      // Use wss:// for HTTPS pages, ws:// for HTTP pages
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const ws = new WebSocket(`${protocol}//${wifiAddress}`)

      ws.onopen = () => {
        setConnectionStatus('connected')
        // Initialize board state
        const { updateBoardState } = useBoardStore.getState()
        updateBoardState({
          boardType: 'RASPBERRY_PI',
          gpio: {},
          wifi: null,
          bluetooth: null,
          system: null
        })
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          const { updateGPIO, updateWiFi, updateBluetooth, updateSystem, addWaveformData } = useBoardStore.getState()

          switch (message.type) {
            case 'gpio':
              // Handle GPIO pin update
              updateGPIO(message.data)

              // Add to waveform data for all pins in the update
              const timestamp = Date.now()
              if ('pin' in message.data) {
                // Old format: single pin
                addWaveformData(message.data.pin, [{
                  timestamp,
                  value: message.data.value
                }])
              } else {
                // New format: dictionary of pins
                Object.values(message.data).forEach((pinData: any) => {
                  addWaveformData(pinData.pin, [{
                    timestamp,
                    value: pinData.value
                  }])
                })
              }
              break

            case 'wifi':
              // Handle WiFi status update
              updateWiFi(message.data)
              break

            case 'bluetooth':
              // Handle Bluetooth status update
              updateBluetooth(message.data)
              break

            case 'system':
              // Handle system health update
              updateSystem(message.data)
              break

            default:
              console.warn('Unknown message type:', message.type)
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        setConnectionStatus('error')
        setConnectionError('WiFi connection failed. Make sure the server is running at ws://' + wifiAddress)
        console.error('WebSocket error:', error)
      }

      ws.onclose = () => {
        if (connectionStatus === 'connected') {
          setConnectionStatus('disconnected')
          setConnectionError('Connection closed')
        }
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
                placeholder="10.75.195.61:8000/ws"
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
