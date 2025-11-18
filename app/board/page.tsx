"use client"

import { useState } from 'react'
import { ConnectionSidebar } from '@/components/board/connection-sidebar'
import { BoardViewer3D } from '@/components/board/board-viewer-3d'
import { PinDetailsPanel } from '@/components/board/pin-details-panel'
import { useBoardStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { PanelLeftClose, PanelLeftOpen, Menu, Info } from 'lucide-react'

export default function BoardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const { selectedPin } = useBoardStore()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-3 md:p-4 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile: Drawer */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[85vw] max-w-[320px]">
                <ConnectionSidebar />
              </SheetContent>
            </Sheet>

            {/* Desktop: Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex text-muted-foreground hover:text-foreground"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </Button>
            <h1 className="text-lg md:text-xl font-semibold">Board view</h1>
          </div>

          <div className="hidden sm:block text-xs md:text-sm text-muted-foreground">
            Real-time GPIO
          </div>

          {/* Mobile: Pin Details Toggle */}
          {selectedPin && (
            <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Info className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-[85vw] max-w-[320px]">
                <PinDetailsPanel />
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Left Sidebar */}
        <div className={`hidden md:block transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
          <ConnectionSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto">
            <BoardViewer3D />
          </div>

          {/* Desktop Pin Details Panel */}
          {selectedPin && (
            <div className="hidden md:block w-80 animate-slide-in-right">
              <PinDetailsPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
