"use client"

import { useState } from 'react'
import { ConnectionSidebar } from '@/components/board/connection-sidebar'
import { BoardViewer3D } from '@/components/board/board-viewer-3d'
import { PinDetailsPanel } from '@/components/board/pin-details-panel'
import { useBoardStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

export default function BoardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { selectedPin } = useBoardStore()

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
        <ConnectionSidebar />
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
                Board View
              </h1>
            </div>
            
            <div className="text-sm text-gray-400">
              Real-time GPIO Monitoring
            </div>
          </div>
        </div>

        {/* 3D Board Viewer */}
        <div className="flex-1 flex">
          <div className="flex-1">
            <BoardViewer3D />
          </div>
          
          {/* Pin Details Panel */}
          {selectedPin && (
            <div className="w-80 animate-slide-in-right">
              <PinDetailsPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
