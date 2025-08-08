"use client"

import { useState } from 'react'
import { WaveformSidebar } from '@/components/waveforms/waveform-sidebar'
import { WaveformChart } from '@/components/waveforms/waveform-chart'
import { Button } from '@/components/ui/button'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

export default function WaveformsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
        <WaveformSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="glass border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-300 hover:text-white"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" />
                )}
              </Button>
              <h1 className="text-2xl font-bold gradient-text-accent">
                Waveform Analysis
              </h1>
            </div>
            
            <div className="text-sm text-gray-400">
              Real-time Signal Visualization
            </div>
          </div>
        </div>

        {/* Waveform Chart */}
        <div className="flex-1 p-6">
          <WaveformChart />
        </div>
      </div>
    </div>
  )
}
