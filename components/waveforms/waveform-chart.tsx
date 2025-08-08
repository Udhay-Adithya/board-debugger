"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBoardStore } from "@/lib/store"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Activity, TrendingUp } from 'lucide-react'

export function WaveformChart() {
  const { 
    boardState, 
    waveformData, 
    waveformPins,
    connectionStatus 
  } = useBoardStore()

  if (connectionStatus !== 'connected') {
    return (
      <Card className="h-full glass border-white/10">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Board Connected
            </h3>
            <p className="text-gray-300">
              Connect to a board to view real-time waveforms
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (waveformPins.length === 0) {
    return (
      <Card className="h-full glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <TrendingUp className="w-6 h-6 mr-2 text-cyan-400" />
            Waveform Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No Pins Selected
            </h3>
            <p className="text-gray-300">
              Select pins from the sidebar to view their waveforms
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data
  const now = Date.now()
  const timeScale = 5000 // 5 seconds
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

  const colors = ['#00f5ff', '#00d4aa', '#ffc658', '#ff7300', '#00ff00', '#ff00ff']

  return (
    <Card className="h-full glass border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-cyan-400" />
            Real-time Waveforms
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>Time Scale: 5s</span>
            <span>•</span>
            <span>{waveformPins.length} Active</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-5rem)]">
        <div className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                {colors.map((color, index) => (
                  <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.1)"
                horizontal={true}
                vertical={true}
              />
              
              <XAxis 
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleTimeString([], { 
                    hour12: false, 
                    minute: '2-digit', 
                    second: '2-digit' 
                  })
                }}
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
              />
              
              <YAxis 
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
                domain={[0, 1023]}
              />
              
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}
                labelStyle={{ color: '#00f5ff' }}
                labelFormatter={(value) => {
                  const date = new Date(value as number)
                  return `Time: ${date.toLocaleTimeString()}`
                }}
                itemStyle={{ color: '#ffffff' }}
              />
              
              <Legend 
                wrapperStyle={{ color: '#ffffff' }}
                iconType="line"
              />
              
              {waveformPins.map((pinId, index) => {
                const pin = boardState?.pins.find(p => p.id === pinId)
                const color = colors[index % colors.length]
                
                return (
                  <Line
                    key={pinId}
                    type="monotone"
                    dataKey={pinId}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                    name={`${pinId} (${pin?.type || 'Unknown'})`}
                    fill={`url(#gradient${index})`}
                    activeDot={{ 
                      r: 4, 
                      fill: color,
                      stroke: '#ffffff',
                      strokeWidth: 2
                    }}
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
