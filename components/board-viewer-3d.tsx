"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text, Box } from "@react-three/drei"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBoardStore } from "@/lib/store"
import { useRef } from "react"
import * as THREE from "three"

function Pin({ 
  position, 
  pin, 
  onClick 
}: { 
  position: [number, number, number]
  pin: any
  onClick: () => void 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const getPinColor = () => {
    if (pin.type === 'DIGITAL') {
      if (pin.isPWM) return '#ff6b35' // Orange for PWM
      return pin.value === 'HIGH' ? '#22c55e' : '#ef4444' // Green for HIGH, Red for LOW
    }
    if (pin.type === 'ANALOG') {
      const intensity = typeof pin.value === 'number' ? pin.value / 1023 : 0
      return `hsl(240, 100%, ${20 + intensity * 60}%)` // Blue gradient based on value
    }
    return '#6b7280' // Gray default
  }

  const getPinHeight = () => {
    if (pin.type === 'ANALOG') {
      const intensity = typeof pin.value === 'number' ? pin.value / 1023 : 0
      return 0.1 + intensity * 0.3 // Height varies with analog value
    }
    return pin.value === 'HIGH' ? 0.3 : 0.1
  }

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[0.2, getPinHeight(), 0.2]}
        onClick={onClick}
        onPointerOver={() => {
          if (meshRef.current) {
            document.body.style.cursor = 'pointer'
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default'
        }}
      >
        <meshStandardMaterial color={getPinColor()} />
      </Box>
      
      <Text
        position={[0, getPinHeight() + 0.2, 0]}
        fontSize={0.1}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {pin.id}
      </Text>
      
      <Text
        position={[0, getPinHeight() + 0.35, 0]}
        fontSize={0.08}
        color="white"
        anchorX="center"
        anchorY="middle"
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
        <Text position={[0, 0, 0]} fontSize={0.2} color="white">
          No board connected
        </Text>
      </group>
    )
  }

  // Create a simple board layout
  const boardWidth = 4
  const boardHeight = 2
  const pinsPerRow = Math.ceil(boardState.pins.length / 2)
  
  return (
    <group>
      {/* Board base */}
      <Box args={[boardWidth, 0.1, boardHeight]} position={[0, -0.05, 0]}>
        <meshStandardMaterial 
          color={boardState.powerStatus.isLow ? '#7f1d1d' : '#1f2937'} 
        />
      </Box>
      
      {/* Board label */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {boardState.boardType}
      </Text>
      
      {/* Power status indicator */}
      {boardState.powerStatus.isLow && (
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.1}
          color="#ef4444"
          anchorX="center"
          anchorY="middle"
        >
          LOW POWER: {boardState.powerStatus.voltage.toFixed(1)}V
        </Text>
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
          />
        )
      })}
      
      {/* Selection indicator */}
      {selectedPin && (
        <group>
          {boardState.pins.map((pin, index) => {
            if (pin.id !== selectedPin.id) return null
            
            const row = Math.floor(index / pinsPerRow)
            const col = index % pinsPerRow
            const x = (col - pinsPerRow / 2 + 0.5) * (boardWidth / pinsPerRow)
            const z = row === 0 ? -boardHeight / 2 + 0.3 : boardHeight / 2 - 0.3
            
            return (
              <Box
                key={`selection-${pin.id}`}
                args={[0.3, 0.02, 0.3]}
                position={[x, -0.01, z]}
              >
                <meshStandardMaterial color="#fbbf24" transparent opacity={0.7} />
              </Box>
            )
          })}
        </group>
      )}
    </group>
  )
}

export function BoardViewer3D() {
  const { connectionStatus } = useBoardStore()
  
  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle>3D Board View</CardTitle>
      </CardHeader>
      <CardContent className="h-[520px] p-0">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 50 }}
          style={{ background: '#0f172a' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Board3D />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
        
        {connectionStatus !== 'connected' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-white text-lg">Connect to a board to view 3D model</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
