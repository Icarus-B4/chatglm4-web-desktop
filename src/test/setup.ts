import '@testing-library/jest-dom'

// Mock WebSocket for tests
global.WebSocket = class MockWebSocket {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSING = 2
  static readonly CLOSED = 3

  readonly CONNECTING = 0
  readonly OPEN = 1
  readonly CLOSING = 2
  readonly CLOSED = 3

  url: string
  readyState: number = 0
  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null

  constructor(url: string) {
    this.url = url
    this.readyState = 0
    
    // Simulate connection opening
    setTimeout(() => {
      this.readyState = 1
      if (this.onopen) {
        this.onopen(new Event('open'))
      }
    }, 10)
  }

  send(data: string | ArrayBuffer | Blob | ArrayBufferView): void {
    if (this.readyState !== 1) {
      throw new Error('WebSocket is not open')
    }
    // Mock sending data
  }

  close(code?: number, reason?: string): void {
    this.readyState = 3
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason }))
    }
  }

  addEventListener(type: string, listener: EventListener): void {
    // Mock event listener
  }

  removeEventListener(type: string, listener: EventListener): void {
    // Mock event listener removal
  }

  dispatchEvent(event: Event): boolean {
    return true
  }
} as any

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
