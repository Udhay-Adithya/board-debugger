import { create } from 'zustand'

export type ConnectionType = 'usb' | 'bluetooth' | 'wifi'
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
export type PinType = 'DIGITAL' | 'ANALOG' | 'PWM'
export type PinMode = 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP'
export type PinValue = 'HIGH' | 'LOW' | number

export interface Pin {
  id: string
  type: PinType
  mode: PinMode
  value: PinValue
  isPWM?: boolean
  pwmDuty?: number
  voltage?: number
}

export interface WaveformData {
  timestamp: number
  value: number
}

export interface BoardState {
  boardType: string
  pins: Pin[]
  powerStatus: {
    voltage: number
    isLow: boolean
  }
}

export interface BoardStore {
  // Connection state
  connectionType: ConnectionType | null
  connectionStatus: ConnectionStatus
  connectionError: string | null

  // Board state
  boardState: BoardState | null
  selectedPin: Pin | null

  // Waveform data
  waveformData: Record<string, WaveformData[]>
  waveformPins: string[]

  // Settings
  refreshRate: number
  theme: 'light' | 'dark'

  // Actions
  setConnectionType: (type: ConnectionType | null) => void
  setConnectionStatus: (status: ConnectionStatus) => void
  setConnectionError: (error: string | null) => void
  updateBoardState: (state: BoardState) => void
  selectPin: (pin: Pin | null) => void
  addWaveformData: (pinId: string, data: WaveformData[]) => void
  toggleWaveformPin: (pinId: string) => void
  setRefreshRate: (rate: number) => void
  setTheme: (theme: 'light' | 'dark') => void
  sendCommand: (command: any) => void
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  // Initial state
  connectionType: null,
  connectionStatus: 'disconnected',
  connectionError: null,
  boardState: null,
  selectedPin: null,
  waveformData: {},
  waveformPins: [],
  refreshRate: 100,
  theme: 'light',

  // Actions
  setConnectionType: (type) => set({ connectionType: type }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setConnectionError: (error) => set({ connectionError: error }),

  updateBoardState: (state) => {
    set({ boardState: state })

    // Update selected pin if it exists in new state
    const { selectedPin } = get()
    if (selectedPin) {
      const updatedPin = state.pins.find(p => p.id === selectedPin.id)
      if (updatedPin) {
        set({ selectedPin: updatedPin })
      }
    }
  },

  selectPin: (pin) => set({ selectedPin: pin }),

  addWaveformData: (pinId, data) => {
    const { waveformData } = get()
    const existingData = waveformData[pinId] || []
    const newData = [...existingData, ...data].slice(-1000) // Keep last 1000 points

    set({
      waveformData: {
        ...waveformData,
        [pinId]: newData
      }
    })
  },

  toggleWaveformPin: (pinId) => {
    const { waveformPins } = get()
    const isActive = waveformPins.includes(pinId)

    set({
      waveformPins: isActive
        ? waveformPins.filter(id => id !== pinId)
        : [...waveformPins, pinId]
    })
  },

  setRefreshRate: (rate) => set({ refreshRate: rate }),
  setTheme: (theme) => set({ theme }),

  sendCommand: (command) => {
    // This would send commands to the connected board
    console.log('Sending command:', command)
    // Implementation would depend on connection type
  }
}))
