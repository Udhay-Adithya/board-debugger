"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useBoardStore } from "@/lib/store"
import { Send, Settings, Cpu, HardDrive, Thermometer, Wifi, Bluetooth } from 'lucide-react'

export function ControlPanel() {
  const {
    refreshRate,
    setRefreshRate,
    sendCommand,
    connectionStatus,
    boardState,
    theme,
    setTheme
  } = useBoardStore()

  const [customCommand, setCustomCommand] = useState("")

  const handleSendCommand = () => {
    if (!customCommand.trim()) return

    try {
      const command = JSON.parse(customCommand)
      sendCommand(command)
      setCustomCommand("")
    } catch (error) {
      console.error('Invalid JSON command:', error)
    }
  }

  const formatSignalStrength = (dbm: number | null) => {
    if (dbm === null) return 'N/A'
    if (dbm >= -50) return 'Excellent'
    if (dbm >= -60) return 'Good'
    if (dbm >= -70) return 'Fair'
    return 'Poor'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Control Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Health - Raspberry Pi */}
        {boardState?.boardType === 'RASPBERRY_PI' && boardState.system && (
          <div>
            <h4 className="text-sm font-medium mb-3">System Health</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">CPU Temperature</span>
                </div>
                <span className="text-sm font-medium">
                  {boardState.system.cpu_temp_c !== null
                    ? `${boardState.system.cpu_temp_c.toFixed(1)}°C`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">CPU Usage</span>
                </div>
                <span className="text-sm font-medium">{boardState.system.cpu_percent.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Disk Usage</span>
                </div>
                <span className="text-sm font-medium">{boardState.system.disk_used_percent.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Network Status - WiFi & Bluetooth */}
        {boardState?.boardType === 'RASPBERRY_PI' && (boardState.wifi || boardState.bluetooth) && (
          <div>
            <h4 className="text-sm font-medium mb-3">Network Status</h4>
            <div className="space-y-3">
              {boardState.wifi && (
                <div className="p-2 bg-muted/50 rounded-md space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className={`w-4 h-4 ${boardState.wifi.connected ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium">WiFi</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${boardState.wifi.connected ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-600'}`}>
                      {boardState.wifi.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  {boardState.wifi.connected && (
                    <div className="text-xs text-muted-foreground space-y-0.5 pl-6">
                      <div>SSID: {boardState.wifi.ssid || 'Unknown'}</div>
                      <div>IP: {boardState.wifi.ip_address || 'Unknown'}</div>
                      <div>Signal: {formatSignalStrength(boardState.wifi.signal_level_dbm)} ({boardState.wifi.signal_level_dbm} dBm)</div>
                    </div>
                  )}
                </div>
              )}
              {boardState.bluetooth && (
                <div className="p-2 bg-muted/50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bluetooth className={`w-4 h-4 ${boardState.bluetooth.powered ? 'text-blue-500' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium">Bluetooth</span>
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${boardState.bluetooth.powered ? 'bg-blue-500/20 text-blue-600' : 'bg-gray-500/20 text-gray-600'}`}>
                        {boardState.bluetooth.powered ? 'Powered' : 'Off'}
                      </span>
                      {boardState.bluetooth.connected && (
                        <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-600">
                          Device Connected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Board Info */}
        {boardState && (
          <div>
            <h4 className="text-sm font-medium mb-3">Board Information</h4>
            <div className="p-2 bg-muted/50 rounded-md space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Board Type:</span>
                <span className="font-medium">Raspberry Pi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Pins:</span>
                <span className="font-medium">{Object.keys(boardState.gpio).length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <Button
              onClick={() => sendCommand({ command: 'REQUEST_FULL_STATUS' })}
              disabled={connectionStatus !== 'connected'}
              variant="outline"
              className="w-full"
            >
              Refresh Status
            </Button>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Settings</h4>

          {/* Refresh Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm">Data Refresh Rate</label>
              <span className="text-sm text-muted-foreground">{refreshRate}ms</span>
            </div>
            <Slider
              value={[refreshRate]}
              onValueChange={(value) => setRefreshRate(value[0])}
              min={50}
              max={1000}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>50ms</span>
              <span>1000ms</span>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Dark Mode</label>
              <p className="text-xs text-muted-foreground">Toggle dark/light theme</p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </div>

        {/* Custom Commands */}
        <div>
          <h4 className="text-sm font-medium mb-3">Send Custom Command</h4>
          <div className="space-y-2">
            <Textarea
              placeholder='{"command": "SET_DIGITAL", "pinId": "D13", "value": "HIGH"}'
              value={customCommand}
              onChange={(e) => setCustomCommand(e.target.value)}
              rows={4}
              className="font-mono text-sm"
            />
            <Button
              onClick={handleSendCommand}
              disabled={connectionStatus !== 'connected' || !customCommand.trim()}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Command
            </Button>
          </div>
        </div>

        {/* Connection Info */}
        {connectionStatus === 'connected' && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Connection Info</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div>Status: Connected</div>
              <div>Refresh Rate: {refreshRate}ms</div>
              <div>Data Flow: Real-time</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
