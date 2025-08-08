"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useBoardStore } from "@/lib/store"
import { Send, RotateCcw, Settings } from 'lucide-react'

export function ControlPanel() {
  const { 
    refreshRate, 
    setRefreshRate, 
    sendCommand, 
    connectionStatus,
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

  const handleResetBoard = () => {
    sendCommand({ command: 'RESET_BOARD' })
  }

  const handleRequestStatus = () => {
    sendCommand({ command: 'REQUEST_FULL_STATUS' })
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
        {/* Quick Actions */}
        <div>
          <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <Button
              onClick={handleRequestStatus}
              disabled={connectionStatus !== 'connected'}
              variant="outline"
              className="w-full"
            >
              Request Pin Status
            </Button>
            <Button
              onClick={handleResetBoard}
              disabled={connectionStatus !== 'connected'}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Board
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
