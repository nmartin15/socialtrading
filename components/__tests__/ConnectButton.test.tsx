import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConnectButton } from '../ConnectButton'

// Mock wagmi hooks
const mockDisconnect = vi.fn()
const mockConnect = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useDisconnect: () => ({ disconnect: mockDisconnect }),
  useConnect: () => ({ connect: mockConnect }),
}))

vi.mock('wagmi/connectors', () => ({
  injected: vi.fn(() => 'injected-connector'),
}))

describe('ConnectButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render "Connect Wallet" button when not connected', async () => {
    const { useAccount } = await import('wagmi')
    vi.mocked(useAccount).mockReturnValue({
      address: undefined,
      isConnected: false,
    } as any)

    render(<ConnectButton />)

    const button = screen.getByRole('button', { name: /connect wallet/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-blue-600')
  })

  it('should call connect when Connect Wallet button is clicked', async () => {
    const { useAccount } = await import('wagmi')
    vi.mocked(useAccount).mockReturnValue({
      address: undefined,
      isConnected: false,
    } as any)

    render(<ConnectButton />)

    const button = screen.getByRole('button', { name: /connect wallet/i })
    fireEvent.click(button)

    expect(mockConnect).toHaveBeenCalledWith({
      connector: 'injected-connector',
    })
  })

  it('should show wallet address and disconnect button when connected', async () => {
    const { useAccount } = await import('wagmi')
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    render(<ConnectButton />)

    // Should show formatted address
    expect(screen.getByText('0x1234...7890')).toBeInTheDocument()

    // Should show disconnect button
    const disconnectButton = screen.getByRole('button', { name: /disconnect/i })
    expect(disconnectButton).toBeInTheDocument()
    expect(disconnectButton).toHaveClass('bg-red-600')
  })

  it('should call disconnect when Disconnect button is clicked', async () => {
    const { useAccount } = await import('wagmi')
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    render(<ConnectButton />)

    const disconnectButton = screen.getByRole('button', { name: /disconnect/i })
    fireEvent.click(disconnectButton)

    expect(mockDisconnect).toHaveBeenCalledTimes(1)
  })

  it('should display full address in shortened format', async () => {
    const { useAccount } = await import('wagmi')
    const longAddress = '0xabcdefABCDEF1234567890abcdefABCDEF123456'
    vi.mocked(useAccount).mockReturnValue({
      address: longAddress,
      isConnected: true,
    } as any)

    render(<ConnectButton />)

    // formatAddress should show first 6 and last 4 characters
    expect(screen.getByText('0xabcd...3456')).toBeInTheDocument()
    expect(screen.queryByText(longAddress)).not.toBeInTheDocument()
  })

  it('should have proper styling for connected state', async () => {
    const { useAccount } = await import('wagmi')
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    const { container } = render(<ConnectButton />)

    const addressDisplay = screen.getByText('0x1234...7890')
    expect(addressDisplay.parentElement).toHaveClass('bg-gray-800')
  })

  it('should have hover states on buttons', async () => {
    const { useAccount } = await import('wagmi')
    vi.mocked(useAccount).mockReturnValue({
      address: undefined,
      isConnected: false,
    } as any)

    render(<ConnectButton />)

    const button = screen.getByRole('button', { name: /connect wallet/i })
    expect(button).toHaveClass('hover:bg-blue-700')
  })
})

