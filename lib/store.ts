import { create } from 'zustand'

export type ConnectionType = 'usb' | 'bluetooth' | 'wifi'
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// Raspberry Pi GPIO Pin
export interface GPIOPin {
  pin: number
  value: number  // 0 or 1
  label: string | null
}

// WiFi Status
export interface WiFiStatus {
  connected: boolean
  ssid: string | null
  ip_address: string | null
  signal_level_dbm: number | null
}

// Bluetooth Status
export interface BluetoothStatus {
  powered: boolean
  connected: boolean
}

// System Health
export interface SystemHealth {
  cpu_temp_c: number | null
  cpu_percent: number
  disk_used_percent: number
}

export interface WaveformData {
  timestamp: number
  value: number
}

// Raspberry Pi Board State
export interface BoardState {
  boardType: 'RASPBERRY_PI'
  gpio: Record<string, GPIOPin>
  wifi: WiFiStatus | null
  bluetooth: BluetoothStatus | null
  system: SystemHealth | null
}

export interface BoardStore {
  // Connection state
  connectionType: ConnectionType | null
  connectionStatus: ConnectionStatus
  connectionError: string | null

  // Board state
  boardState: BoardState | null
  selectedPin: GPIOPin | null

  // Waveform data
  waveformData: Record<string, WaveformData[]>
  waveformPins: number[]

  // Settings
  refreshRate: number
  theme: 'light' | 'dark'

  // Actions
  setConnectionType: (type: ConnectionType | null) => void
  setConnectionStatus: (status: ConnectionStatus) => void
  setConnectionError: (error: string | null) => void
  updateBoardState: (state: BoardState) => void
  updateGPIO: (gpioData: GPIOPin | Record<string, GPIOPin>) => void
  updateWiFi: (wifi: WiFiStatus) => void
  updateBluetooth: (bluetooth: BluetoothStatus) => void
  updateSystem: (system: SystemHealth) => void
  selectPin: (pin: GPIOPin | null) => void
  addWaveformData: (pinNumber: number, data: WaveformData[]) => void
  toggleWaveformPin: (pinNumber: number) => void
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
    if (selectedPin && state.gpio[selectedPin.pin.toString()]) {
      set({ selectedPin: state.gpio[selectedPin.pin.toString()] })
    }
  },

  updateGPIO: (gpioData) => {
    const { boardState } = get()
    if (boardState) {
      // Handle both old format (single pin) and new format (dictionary of pins)
      let updatedGpio: Record<string, GPIOPin>

      if ('pin' in gpioData) {
        // Old format: single pin object
        updatedGpio = {
          ...boardState.gpio,
          [gpioData.pin.toString()]: gpioData
        }
      } else {
        // New format: dictionary of pins
        updatedGpio = gpioData
      }

      set({
        boardState: {
          ...boardState,
          gpio: updatedGpio
        }
      })

      // Update selected pin if it exists in the new data
      const { selectedPin } = get()
      if (selectedPin) {
        const pinKey = selectedPin.pin.toString()
        if (updatedGpio[pinKey]) {
          set({ selectedPin: updatedGpio[pinKey] })
        }
      }
    }
  },

  updateWiFi: (wifi) => {
    const { boardState } = get()
    if (boardState) {
      set({
        boardState: {
          ...boardState,
          wifi
        }
      })
    }
  },

  updateBluetooth: (bluetooth) => {
    const { boardState } = get()
    if (boardState) {
      set({
        boardState: {
          ...boardState,
          bluetooth
        }
      })
    }
  },

  updateSystem: (system) => {
    const { boardState } = get()
    if (boardState) {
      set({
        boardState: {
          ...boardState,
          system
        }
      })
    }
  },

  selectPin: (pin) => set({ selectedPin: pin }),

  addWaveformData: (pinNumber, data) => {
    const { waveformData } = get()
    const pinKey = pinNumber.toString()
    const existingData = waveformData[pinKey] || []
    const newData = [...existingData, ...data].slice(-1000) // Keep last 1000 points

    set({
      waveformData: {
        ...waveformData,
        [pinKey]: newData
      }
    })
  },

  toggleWaveformPin: (pinNumber) => {
    const { waveformPins } = get()
    const isActive = waveformPins.includes(pinNumber)

    set({
      waveformPins: isActive
        ? waveformPins.filter(id => id !== pinNumber)
        : [...waveformPins, pinNumber]
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
