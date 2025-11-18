"use client"

import { useBoardStore } from "@/lib/store"
import { useState } from "react"
import { Cpu, Zap, Power, Minus } from 'lucide-react'

// Raspberry Pi 40-pin GPIO header layout (BCM numbering)
const GPIO_LAYOUT = [
  // [BCM, Physical, Name, Type]
  [null, 1, '3.3V', 'power'],
  [null, 2, '5V', 'power'],
  [2, 3, 'GPIO2', 'gpio'],
  [null, 4, '5V', 'power'],
  [3, 5, 'GPIO3', 'gpio'],
  [null, 6, 'GND', 'ground'],
  [4, 7, 'GPIO4', 'gpio'],
  [14, 8, 'GPIO14', 'gpio'],
  [null, 9, 'GND', 'ground'],
  [15, 10, 'GPIO15', 'gpio'],
  [17, 11, 'GPIO17', 'gpio'],
  [18, 12, 'GPIO18', 'gpio'],
  [27, 13, 'GPIO27', 'gpio'],
  [null, 14, 'GND', 'ground'],
  [22, 15, 'GPIO22', 'gpio'],
  [23, 16, 'GPIO23', 'gpio'],
  [null, 17, '3.3V', 'power'],
  [24, 18, 'GPIO24', 'gpio'],
  [10, 19, 'GPIO10', 'gpio'],
  [null, 20, 'GND', 'ground'],
  [9, 21, 'GPIO9', 'gpio'],
  [25, 22, 'GPIO25', 'gpio'],
  [11, 23, 'GPIO11', 'gpio'],
  [8, 24, 'GPIO8', 'gpio'],
  [null, 25, 'GND', 'ground'],
  [7, 26, 'GPIO7', 'gpio'],
  [0, 27, 'GPIO0', 'special'],
  [1, 28, 'GPIO1', 'special'],
  [5, 29, 'GPIO5', 'gpio'],
  [null, 30, 'GND', 'ground'],
  [6, 31, 'GPIO6', 'gpio'],
  [12, 32, 'GPIO12', 'gpio'],
  [13, 33, 'GPIO13', 'gpio'],
  [null, 34, 'GND', 'ground'],
  [19, 35, 'GPIO19', 'gpio'],
  [16, 36, 'GPIO16', 'gpio'],
  [26, 37, 'GPIO26', 'gpio'],
  [20, 38, 'GPIO20', 'gpio'],
  [null, 39, 'GND', 'ground'],
  [21, 40, 'GPIO21', 'gpio'],
] as const

interface PinRowProps {
  leftPin: typeof GPIO_LAYOUT[number]
  rightPin: typeof GPIO_LAYOUT[number]
  onPinClick: (bcm: number | null) => void
  selectedBcm: number | null
  gpioData: Record<number, { pin: number; value: number; label: string | null }>
}

function PinRow({ leftPin, rightPin, onPinClick, selectedBcm, gpioData }: PinRowProps) {
  const [bcmL, physL, nameL, typeL] = leftPin
  const [bcmR, physR, nameR, typeR] = rightPin

  const getPinColor = (bcm: number | null, type: string) => {
    if (type === 'power') return 'bg-red-500'
    if (type === 'ground') return 'bg-gray-700'
    if (type === 'special') return 'bg-purple-500'
    if (bcm !== null && gpioData[bcm]) {
      return gpioData[bcm].value === 1 ? 'bg-green-500' : 'bg-blue-500'
    }
    return 'bg-gray-600'
  }

  const getPinGlow = (bcm: number | null, type: string) => {
    if (type === 'power') return 'shadow-[0_0_10px_rgba(239,68,68,0.6)]'
    if (bcm !== null && gpioData[bcm]?.value === 1) {
      return 'shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse'
    }
    return ''
  }

  const isClickable = (type: string) => type === 'gpio' || type === 'special'

  return (
    <div className="flex items-center gap-1 md:gap-2 mb-0.5 md:mb-1">
      {/* Left pin */}
      <div className="flex-1 flex items-center justify-end gap-1 md:gap-2">
        <div className="text-right min-w-[50px] md:min-w-[80px]">
          <div className="text-[9px] md:text-xs font-mono text-gray-400">Pin {physL}</div>
          <div className="text-[10px] md:text-sm font-semibold text-white truncate">{nameL}</div>
          {bcmL !== null && gpioData[bcmL]?.label && (
            <div className="hidden sm:block text-xs text-purple-400 truncate">{gpioData[bcmL].label}</div>
          )}
          {bcmL !== null && (
            <div className={`text-[9px] md:text-xs font-mono ${gpioData[bcmL]?.value === 1 ? 'text-green-400' : 'text-blue-400'}`}>
              {gpioData[bcmL]?.value === 1 ? 'HIGH' : gpioData[bcmL]?.value === 0 ? 'LOW' : '--'}
            </div>
          )}
        </div>
        <button
          onClick={() => isClickable(typeL) && bcmL !== null && onPinClick(bcmL)}
          disabled={!isClickable(typeL)}
          className={`w-6 h-6 md:w-8 md:h-8 rounded-full ${getPinColor(bcmL, typeL)} ${getPinGlow(bcmL, typeL)} 
            border-2 ${selectedBcm === bcmL ? 'border-purple-400' : 'border-gray-800'}
            ${isClickable(typeL) ? 'cursor-pointer active:scale-95 md:hover:scale-110' : 'cursor-default'}
            transition-all duration-200 flex items-center justify-center`}
        >
          {typeL === 'power' && <Power className="w-3 h-3 md:w-4 md:h-4 text-white" />}
          {typeL === 'ground' && <Minus className="w-3 h-3 md:w-4 md:h-4 text-white" />}
          {typeL === 'gpio' && bcmL !== null && (
            <span className="text-[8px] md:text-[10px] font-bold text-white">{bcmL}</span>
          )}
        </button>
      </div>

      {/* Center connector */}
      <div className="w-8 h-6 md:w-12 md:h-8 bg-gray-800 border border-gray-700 rounded flex items-center justify-center shrink-0">
        <div className="text-[7px] md:text-[8px] text-gray-600 font-mono">{physL}-{physR}</div>
      </div>

      {/* Right pin */}
      <div className="flex-1 flex items-center gap-1 md:gap-2">
        <button
          onClick={() => isClickable(typeR) && bcmR !== null && onPinClick(bcmR)}
          disabled={!isClickable(typeR)}
          className={`w-6 h-6 md:w-8 md:h-8 rounded-full ${getPinColor(bcmR, typeR)} ${getPinGlow(bcmR, typeR)}
            border-2 ${selectedBcm === bcmR ? 'border-purple-400' : 'border-gray-800'}
            ${isClickable(typeR) ? 'cursor-pointer active:scale-95 md:hover:scale-110' : 'cursor-default'}
            transition-all duration-200 flex items-center justify-center`}
        >
          {typeR === 'power' && <Power className="w-3 h-3 md:w-4 md:h-4 text-white" />}
          {typeR === 'ground' && <Minus className="w-3 h-3 md:w-4 md:h-4 text-white" />}
          {typeR === 'gpio' && bcmR !== null && (
            <span className="text-[8px] md:text-[10px] font-bold text-white">{bcmR}</span>
          )}
        </button>
        <div className="text-left min-w-[50px] md:min-w-[80px]">
          <div className="text-[9px] md:text-xs font-mono text-gray-400">Pin {physR}</div>
          <div className="text-[10px] md:text-sm font-semibold text-white truncate">{nameR}</div>
          {bcmR !== null && gpioData[bcmR]?.label && (
            <div className="hidden sm:block text-xs text-purple-400 truncate">{gpioData[bcmR].label}</div>
          )}
          {bcmR !== null && (
            <div className={`text-[9px] md:text-xs font-mono ${gpioData[bcmR]?.value === 1 ? 'text-green-400' : 'text-blue-400'}`}>
              {gpioData[bcmR]?.value === 1 ? 'HIGH' : gpioData[bcmR]?.value === 0 ? 'LOW' : '--'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function BoardViewer3D() {
  const { connectionStatus, boardState, selectPin, selectedPin } = useBoardStore()

  const handlePinClick = (bcm: number | null) => {
    if (bcm !== null && boardState?.gpio?.[bcm]) {
      selectPin(boardState.gpio[bcm])
    }
  }

  if (connectionStatus !== 'connected') {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <Cpu className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            No Raspberry Pi Connected
          </h3>
          <p className="text-muted-foreground">
            Connect to your Raspberry Pi via WiFi to view GPIO pins
          </p>
        </div>
      </div>
    )
  }

  const gpioData = boardState?.gpio || {}
  const pinPairs: [typeof GPIO_LAYOUT[number], typeof GPIO_LAYOUT[number]][] = []

  // Create pairs (odd pin on left, even pin on right)
  for (let i = 0; i < GPIO_LAYOUT.length; i += 2) {
    pinPairs.push([GPIO_LAYOUT[i], GPIO_LAYOUT[i + 1]])
  }

  return (
    <div className="h-full overflow-auto bg-background p-3 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Board Header */}
        <div className="mb-4 md:mb-6 lg:mb-8 text-center">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
            <Cpu className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">Raspberry Pi GPIO</h2>
          </div>
          <p className="text-xs md:text-sm text-gray-400">40-Pin GPIO with BCM Numbering</p>
        </div>

        {/* Board Container */}
        <div className="bg-gradient-to-br from-green-900/20 to-green-950/40 border-2 border-green-500/30 rounded-lg md:rounded-xl p-3 md:p-6 lg:p-8 shadow-2xl">
          {/* GPIO Header */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg p-3 md:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3 md:mb-4 pb-2 md:pb-3 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                <span className="text-sm md:text-base font-semibold text-white">GPIO</span>
              </div>
              <div className="flex gap-2 md:gap-3 lg:gap-4 text-[10px] md:text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                  <span className="hidden sm:inline text-gray-400">HIGH</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-blue-500"></div>
                  <span className="hidden sm:inline text-gray-400">LOW</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                  <span className="hidden md:inline text-gray-400">PWR</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gray-700"></div>
                  <span className="hidden md:inline text-gray-400">GND</span>
                </div>
              </div>
            </div>

            {/* Pin Rows */}
            {pinPairs.map((pair, index) => (
              <PinRow
                key={index}
                leftPin={pair[0]}
                rightPin={pair[1]}
                onPinClick={handlePinClick}
                selectedBcm={selectedPin?.pin || null}
                gpioData={gpioData}
              />
            ))}
          </div>

          {/* System Info */}
          {boardState?.system && (
            <div className="mt-4 md:mt-6 grid grid-cols-3 gap-2 md:gap-3 lg:gap-4">
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg p-2 md:p-3 lg:p-4">
                <div className="text-[10px] md:text-xs text-gray-400 mb-1">CPU Temp</div>
                <div className={`text-sm md:text-xl lg:text-2xl font-bold ${boardState.system.cpu_temp_c && boardState.system.cpu_temp_c > 70 ? 'text-red-500' : 'text-green-400'}`}>
                  {boardState.system.cpu_temp_c?.toFixed(1) || '--'}°C
                </div>
              </div>
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg p-2 md:p-3 lg:p-4">
                <div className="text-[10px] md:text-xs text-gray-400 mb-1">CPU</div>
                <div className="text-sm md:text-xl lg:text-2xl font-bold text-blue-400">
                  {boardState.system.cpu_percent?.toFixed(0) || '--'}%
                </div>
              </div>
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg p-2 md:p-3 lg:p-4">
                <div className="text-[10px] md:text-xs text-gray-400 mb-1">Disk</div>
                <div className="text-sm md:text-xl lg:text-2xl font-bold text-purple-400">
                  {boardState.system.disk_used_percent?.toFixed(0) || '--'}%
                </div>
              </div>
            </div>
          )}

          {/* Network Status */}
          <div className="mt-3 md:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 lg:gap-4">
            {boardState?.wifi && (
              <div className={`backdrop-blur-sm border rounded-lg p-4 ${boardState.wifi.connected
                ? 'bg-green-900/20 border-green-500/30'
                : 'bg-gray-900/20 border-gray-700'
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  <svg className={`w-5 h-5 ${boardState.wifi.connected ? 'text-green-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="font-semibold text-white">WiFi</span>
                </div>
                {boardState.wifi.connected ? (
                  <>
                    <div className="text-sm text-gray-300">{boardState.wifi.ssid}</div>
                    <div className="text-xs text-gray-400">{boardState.wifi.ip_address}</div>
                    <div className="text-xs text-gray-500">{boardState.wifi.signal_level_dbm} dBm</div>
                  </>
                ) : (
                  <div className="text-sm text-gray-400">Disconnected</div>
                )}
              </div>
            )}

            {boardState?.bluetooth && (
              <div className={`backdrop-blur-sm border rounded-lg p-4 ${boardState.bluetooth.powered
                ? 'bg-blue-900/20 border-blue-500/30'
                : 'bg-gray-900/20 border-gray-700'
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  <svg className={`w-5 h-5 ${boardState.bluetooth.powered ? 'text-blue-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L6 6h3v8H6l4 4 4-4h-3V6h3l-4-4z" />
                  </svg>
                  <span className="font-semibold text-white">Bluetooth</span>
                </div>
                {boardState.bluetooth.powered ? (
                  <>
                    <div className="text-sm text-gray-300">Powered On</div>
                    {boardState.bluetooth.connected && (
                      <div className="text-xs text-green-400">• Device Connected</div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-gray-400">Powered Off</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 md:mt-6 text-center text-[10px] md:text-xs text-gray-500">
          <p className="hidden sm:block">Click on GPIO pins to view details • BCM pin numbers shown inside pins</p>
          <p className="sm:hidden">Tap pins for details</p>
        </div>
      </div>
    </div>
  )
}
