"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text, Box, Environment } from "@react-three/drei"
import { useBoardStore, GPIOPin } from "@/lib/store"
import { useRef, useState } from "react"
import * as THREE from "three"

function Pin({
  position,
  pin,
  onClick,
  isSelected
}: {
  position: [number, number, number]
  pin: GPIOPin
  onClick: () => void
  isSelected: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const getPinColor = () => {
    return pin.value === 1 ? '#22c55e' : '#ef4444'
  }

  const getPinHeight = () => {
    return pin.value === 1 ? 0.3 : 0.1
  }

  const getEmissiveIntensity = () => {
    if (hovered || isSelected) return 0.3
    if (pin.value === 1) return 0.2
    return 0
  }

  return (
    <group position={position}>
      {/* Pin Base */}
      <Box
        ref={meshRef}
        args={[0.15, getPinHeight(), 0.15]}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
      >
        <meshStandardMaterial
          color={getPinColor()}
          emissive={getPinColor()}
          emissiveIntensity={getEmissiveIntensity()}
          metalness={0.3}
          roughness={0.4}
        />
      </Box>

      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.12, 0.17, 16]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Pin Number */}
      <Text
        position={[0, getPinHeight() + 0.15, 0]}
        fontSize={0.07}
        color={isSelected ? "#8b5cf6" : "white"}
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.ttf"
      >
        {pin.pin}
      </Text>

      {/* Pin Label */}
      {pin.label && (
        <Text
          position={[0, getPinHeight() + 0.28, 0]}
          fontSize={0.05}
          color={isSelected ? "#a78bfa" : "#94a3b8"}
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Regular.ttf"
        >
          {pin.label}
        </Text>
      )}

      {/* Pin State */}
      <Text
        position={[0, getPinHeight() + 0.4, 0]}
        fontSize={0.06}
        color={pin.value === 1 ? "#22c55e" : "#94a3b8"}
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Regular.ttf"
      >
        {pin.value === 1 ? 'HIGH' : 'LOW'}
      </Text>
    </group>
  )
}

function Board3D() {
  const { boardState, selectPin, selectedPin } = useBoardStore()

  if (!boardState || !boardState.gpio || Object.keys(boardState.gpio).length === 0) {
    return (
      <group>
        <Text position={[0, 0, 0]} fontSize={0.3} color="#64748b" anchorX="center" anchorY="middle">
          No GPIO pins detected
        </Text>
        <Text position={[0, -0.5, 0]} fontSize={0.15} color="#475569" anchorX="center" anchorY="middle">
          Waiting for GPIO data from Raspberry Pi...
        </Text>
      </group>
    )
  }

  const pins = Object.values(boardState.gpio || {}).sort((a, b) => a.pin - b.pin)
  const boardWidth = 5
  const boardHeight = 3

  // Arrange pins in a more realistic dual-row layout (like actual GPIO header)
  const pinsPerSide = Math.ceil(pins.length / 2)

  return (
    <group>
      {/* Board Base */}
      <Box args={[boardWidth, 0.1, boardHeight]} position={[0, -0.05, 0]}>
        <meshStandardMaterial
          color="#15803d"
          metalness={0.1}
          roughness={0.8}
        />
      </Box>

      {/* Board Outline Glow */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[boardWidth + 0.1, 0.12, boardHeight + 0.1]} />
        <meshBasicMaterial
          color="#22c55e"
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>

      {/* Board Label */}
      <Text
        position={[0, 0.7, 0]}
        fontSize={0.2}
        color="#22c55e"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.ttf"
      >
        RASPBERRY PI
      </Text>

      <Text
        position={[0, 0.45, 0]}
        fontSize={0.1}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Regular.ttf"
      >
        GPIO Header (BCM)
      </Text>

      {/* Pins - Dual row layout */}
      {pins.map((pin, index) => {
        const row = index % 2 // 0 for top row, 1 for bottom row
        const col = Math.floor(index / 2)

        // Spread pins along the length of the board
        const spacing = (boardWidth - 1) / Math.max(pinsPerSide - 1, 1)
        const x = -boardWidth / 2 + 0.5 + col * spacing
        const z = row === 0 ? -0.3 : 0.3

        return (
          <Pin
            key={pin.pin}
            position={[x, 0.1, z]}
            pin={pin}
            onClick={() => selectPin(pin)}
            isSelected={selectedPin?.pin === pin.pin}
          />
        )
      })}

      {/* System Info */}
      {boardState.system && (
        <group position={[0, -1.2, 0]}>
          <Text
            position={[-1.5, 0, 0]}
            fontSize={0.08}
            color={boardState.system.cpu_temp_c && boardState.system.cpu_temp_c > 70 ? "#ef4444" : "#94a3b8"}
            anchorX="left"
            anchorY="middle"
            font="/fonts/Inter-Regular.ttf"
          >
            🌡️ {boardState.system.cpu_temp_c?.toFixed(1) || '--'}°C
          </Text>
          <Text
            position={[-0.5, 0, 0]}
            fontSize={0.08}
            color="#94a3b8"
            anchorX="left"
            anchorY="middle"
            font="/fonts/Inter-Regular.ttf"
          >
            💻 {boardState.system.cpu_percent?.toFixed(0) || '--'}%
          </Text>
          <Text
            position={[0.5, 0, 0]}
            fontSize={0.08}
            color="#94a3b8"
            anchorX="left"
            anchorY="middle"
            font="/fonts/Inter-Regular.ttf"
          >
            💾 {boardState.system.disk_used_percent?.toFixed(0) || '--'}%
          </Text>
        </group>
      )}
    </group>
  )
}

export function BoardViewer3D() {
  const { connectionStatus, boardState } = useBoardStore()

  return (
    <div className="h-full relative">
      <Canvas
        camera={{ position: [6, 6, 6], fov: 50 }}
        className="bg-background"
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.2} color="#22c55e" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color="#22c55e"
        />

        <Environment preset="night" />
        <Board3D />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={15}
          minDistance={3}
        />
      </Canvas>

      {/* Status Overlay - Top Right */}
      {connectionStatus === 'connected' && boardState && (
        <div className="absolute top-4 right-4 space-y-2">
          {/* WiFi Status */}
          {boardState.wifi && (
            <div className={`px-3 py-2 rounded-lg backdrop-blur-sm ${boardState.wifi.connected
                ? 'bg-green-500/20 border border-green-500/30'
                : 'bg-gray-500/20 border border-gray-500/30'
              }`}>
              <div className="flex items-center gap-2 text-sm">
                <svg className={`w-4 h-4 ${boardState.wifi.connected ? 'text-green-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <div>
                  {boardState.wifi.connected ? (
                    <>
                      <div className="font-medium text-white">{boardState.wifi.ssid}</div>
                      <div className="text-xs text-gray-300">{boardState.wifi.ip_address}</div>
                      <div className="text-xs text-gray-400">{boardState.wifi.signal_level_dbm} dBm</div>
                    </>
                  ) : (
                    <div className="text-gray-400">WiFi Disconnected</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bluetooth Status */}
          {boardState.bluetooth && (
            <div className={`px-3 py-2 rounded-lg backdrop-blur-sm ${boardState.bluetooth.powered
                ? 'bg-blue-500/20 border border-blue-500/30'
                : 'bg-gray-500/20 border border-gray-500/30'
              }`}>
              <div className="flex items-center gap-2 text-sm">
                <svg className={`w-4 h-4 ${boardState.bluetooth.powered ? 'text-blue-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L6 6h3v8H6l4 4 4-4h-3V6h3l-4-4z" />
                </svg>
                <div className="text-white">
                  {boardState.bluetooth.powered ? (
                    <>
                      <span className="font-medium">Bluetooth</span>
                      {boardState.bluetooth.connected && (
                        <span className="ml-2 text-xs text-green-400">• Connected</span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">Bluetooth Off</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {connectionStatus !== 'connected' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              No Raspberry Pi Connected
            </h3>
            <p className="text-muted-foreground">
              Connect to your Raspberry Pi via WiFi to view GPIO pins
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
