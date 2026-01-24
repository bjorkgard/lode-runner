import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { HUD } from './HUD';

describe('HUD Component', () => {
  const defaultProps = {
    level: 1,
    score: 0,
    highScore: 1000,
    lives: 3,
    timer: 0,
    muted: false,
    onToggleMute: vi.fn()
  };

  test('displays level number', () => {
    render(<HUD {...defaultProps} level={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('displays current score', () => {
    render(<HUD {...defaultProps} score={2500} />);
    expect(screen.getByText('2500')).toBeInTheDocument();
  });

  test('displays high score', () => {
    render(<HUD {...defaultProps} highScore={5000} />);
    expect(screen.getByText('5000')).toBeInTheDocument();
  });

  test('displays formatted time in MM:SS format', () => {
    render(<HUD {...defaultProps} timer={65} />);
    expect(screen.getByText('1:05')).toBeInTheDocument();
  });

  test('formats time with leading zero for seconds', () => {
    render(<HUD {...defaultProps} timer={5} />);
    expect(screen.getByText('0:05')).toBeInTheDocument();
  });

  test('formats time correctly for multiple minutes', () => {
    render(<HUD {...defaultProps} timer={125} />);
    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  test('displays correct number of filled hearts for lives', () => {
    const { container } = render(<HUD {...defaultProps} lives={2} />);
    const hearts = container.querySelectorAll('.text-red-500');
    expect(hearts).toHaveLength(2);
  });

  test('displays correct number of empty hearts', () => {
    const { container } = render(<HUD {...defaultProps} lives={1} />);
    const emptyHearts = container.querySelectorAll('.text-gray-600');
    expect(emptyHearts).toHaveLength(2);
  });

  test('displays all hearts filled when lives is 3', () => {
    const { container } = render(<HUD {...defaultProps} lives={3} />);
    const hearts = container.querySelectorAll('.text-red-500');
    expect(hearts).toHaveLength(3);
  });

  test('displays no filled hearts when lives is 0', () => {
    const { container } = render(<HUD {...defaultProps} lives={0} />);
    const hearts = container.querySelectorAll('.text-red-500');
    expect(hearts).toHaveLength(0);
  });

  test('displays unmuted icon when not muted', () => {
    render(<HUD {...defaultProps} muted={false} />);
    expect(screen.getByText('🔊')).toBeInTheDocument();
  });

  test('displays muted icon when muted', () => {
    render(<HUD {...defaultProps} muted={true} />);
    expect(screen.getByText('🔇')).toBeInTheDocument();
  });

  test('calls onToggleMute when mute button is clicked', async () => {
    const user = userEvent.setup();
    const onToggleMute = vi.fn();
    render(<HUD {...defaultProps} onToggleMute={onToggleMute} />);
    
    const muteButton = screen.getByRole('button', { name: /mute audio/i });
    await user.click(muteButton);
    
    expect(onToggleMute).toHaveBeenCalledTimes(1);
  });

  test('mute button has correct aria-label when unmuted', () => {
    render(<HUD {...defaultProps} muted={false} />);
    const muteButton = screen.getByRole('button', { name: 'Mute audio' });
    expect(muteButton).toBeInTheDocument();
  });

  test('mute button has correct aria-label when muted', () => {
    render(<HUD {...defaultProps} muted={true} />);
    const muteButton = screen.getByRole('button', { name: 'Unmute audio' });
    expect(muteButton).toBeInTheDocument();
  });

  test('displays all game information simultaneously', () => {
    render(<HUD {...defaultProps} level={10} score={5000} highScore={10000} lives={2} timer={90} />);
    
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5000')).toBeInTheDocument();
    expect(screen.getByText('10000')).toBeInTheDocument();
    expect(screen.getByText('1:30')).toBeInTheDocument();
  });
});
