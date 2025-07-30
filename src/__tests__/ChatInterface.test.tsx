import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import ChatInterface from '../components/ChatInterface'

// Mock useWebSocket hook
jest.mock('../hooks/useWebSocket', () => ({
  __esModule: true,
  default: () => ({
    sendMessage: jest.fn(),
    lastMessage: null,
  }),
}))

describe('ChatInterface Component', () => {
  it('should render chat input', () => {
    render(<ChatInterface />)

    const chatInput = screen.getByPlaceholderText('Nachricht eingeben...')
    expect(chatInput).toBeInTheDocument()
  })

  it('should send a message when Enter is pressed', async () => {
    const sendMessage = jest.fn()
    jest.mock('../hooks/useWebSocket', () => ({
      __esModule: true,
      default: () => ({
        sendMessage,
        lastMessage: null,
      }),
    }))

    render(<ChatInterface />)

    const chatInput = screen.getByPlaceholderText('Nachricht eingeben...')
    await userEvent.type(chatInput, 'Hallo, wie geht es dir?{enter}')

    expect(sendMessage).toHaveBeenCalledWith('Hallo, wie geht es dir?')
  })
})

