"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text, Box, Environment } from "@react-three/drei"
import { useBoardStore } from "@/lib/store"
import { useRef, useState } from "react"
import * as THREE from "three"
import { Zap } from 'lucide-react'

function Pin({
  position,
  pin,
  onClick,
  isSelected
}: {
  position: [number, number, number]
  pin: any
  onClick: () => void
  isSelected: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const getPinColor = () => {
    if (pin.type === 'DIGITAL') {
      if (pin.isPWM) return '#ff6b35'
      return pin.value === 'HIGH' ? '#22c55e' : '#ef4444'
    }
    if (pin.type === 'ANALOG') {
      const intensity = typeof pin.value === 'number' ? pin.value / 1023 : 0
      return `hsl(240, 100%, ${20 + intensity * 60}%)`
    }
    return '#6b7280'
  }

  const getPinHeight = () => {
    if (pin.type === 'ANALOG') {
      const intensity = typeof pin.value === 'number' ? pin.value / 1023 : 0
      return 0.1 + intensity * 0.3
    }
    return pin.value === 'HIGH' ? 0.3 : 0.1
  }

  const getEmissiveIntensity = () => {
    if (hovered || isSelected) return 0.3
    if (pin.type === 'DIGITAL' && pin.value === 'HIGH') return 0.2
    if (pin.isPWM) return 0.15
    return 0
  }

  return (
    <group position={position}>
      {/* Pin Base */}
      <Box
        ref={meshRef}
        args={[0.2, getPinHeight(), 0.2]}
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
          <ringGeometry args={[0.15, 0.2, 16]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Pin Label */}
      <Text
        position={[0, getPinHeight() + 0.2, 0]}
        fontSize={0.08}
        color={isSelected ? "#8b5cf6" : "white"}
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.ttf"
      >
        {pin.id}
      </Text>

      {/* Pin Value */}
      <Text
        position={[0, getPinHeight() + 0.35, 0]}
        fontSize={0.06}
        color={isSelected ? "#8b5cf6" : "#94a3b8"}
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Regular.ttf"
      >
        {pin.type === 'ANALOG'
          ? `${pin.value}${pin.voltage ? ` (${pin.voltage.toFixed(1)}V)` : ''}`
          : pin.value
        }
        {pin.isPWM && ` ${pin.pwmDuty}%`}
      </Text>
    </group>
  )
}

function Board3D() {
  const { boardState, selectPin, selectedPin } = useBoardStore()

  if (!boardState) {
    return (
      <group>
        <Text position={[0, 0, 0]} fontSize={0.3} color="#64748b" anchorX="center" anchorY="middle">
          No board connected
        </Text>
        <Text position={[0, -0.5, 0]} fontSize={0.15} color="#475569" anchorX="center" anchorY="middle">
          Connect a board to view 3D visualization
        </Text>
      </group>
    )
  }

  const boardWidth = 4
  const boardHeight = 2
  const pinsPerRow = Math.ceil(boardState.pins.length / 2)

  return (
    <group>
      {/* Board Base */}
      <Box args={[boardWidth, 0.1, boardHeight]} position={[0, -0.05, 0]}>
        <meshStandardMaterial
          color={boardState.powerStatus.isLow ? '#7f1d1d' : '#1e293b'}
          metalness={0.1}
          roughness={0.8}
          emissive={boardState.powerStatus.isLow ? '#7f1d1d' : '#000000'}
          emissiveIntensity={boardState.powerStatus.isLow ? 0.1 : 0}
        />
      </Box>

      {/* Board Outline Glow */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[boardWidth + 0.1, 0.12, boardHeight + 0.1]} />
        <meshBasicMaterial
          color="#00f5ff"
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>

      {/* Board Label */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.2}
        color="#00f5ff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.ttf"
      >
        {boardState.boardType}
      </Text>

      {/* Power Status */}
      {boardState.powerStatus.isLow && (
        <>
          <Text
            position={[0, 0.25, 0]}
            fontSize={0.1}
            color="#ef4444"
            anchorX="center"
            anchorY="middle"
            font="/fonts/Inter-Bold.ttf"
          >
            ⚠ LOW POWER: {boardState.powerStatus.voltage.toFixed(1)}V
          </Text>

          {/* Pulsing warning effect */}
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[boardWidth + 0.2, 0.15, boardHeight + 0.2]} />
            <meshBasicMaterial
              color="#ef4444"
              transparent
              opacity={0.05}
            />
          </mesh>
        </>
      )}

      {/* Pins */}
      {boardState.pins.map((pin, index) => {
        const row = Math.floor(index / pinsPerRow)
        const col = index % pinsPerRow
        const x = (col - pinsPerRow / 2 + 0.5) * (boardWidth / pinsPerRow)
        const z = row === 0 ? -boardHeight / 2 + 0.3 : boardHeight / 2 - 0.3

        return (
          <Pin
            key={pin.id}
            position={[x, 0, z]}
            pin={pin}
            onClick={() => selectPin(pin)}
            isSelected={selectedPin?.id === pin.id}
          />
        )
      })}
    </group>
  )
}

export function BoardViewer3D() {
  const { connectionStatus } = useBoardStore()

  return (
    <div className="h-full relative">
      <Canvas
        camera={{ position: [6, 6, 6], fov: 50 }}
        className="bg-background"
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.2} color="#8b5cf6" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color="#8b5cf6"
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

      {connectionStatus !== 'connected' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              No Board Connected
            </h3>
            <p className="text-muted-foreground">
              Connect to a board to view the 3D visualization
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
