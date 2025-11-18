"use client"

import { useState } from 'react'
import { WaveformSidebar } from '@/components/waveforms/waveform-sidebar'
import { WaveformChart } from '@/components/waveforms/waveform-chart'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react'

export default function WaveformsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
                <WaveformSidebar />
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
            <h1 className="text-lg md:text-xl font-semibold">Waveforms</h1>
          </div>

          <div className="hidden sm:block text-xs md:text-sm text-muted-foreground">
            Signal Analysis
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Left Sidebar */}
        <div className={`hidden md:block transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
          <WaveformSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-3 md:p-6 overflow-auto">
          <WaveformChart />
        </div>
      </div>
    </div>
  )
}
