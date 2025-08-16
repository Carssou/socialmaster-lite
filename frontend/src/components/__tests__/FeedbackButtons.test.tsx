import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackButtons } from '../FeedbackButtons';

describe('FeedbackButtons', () => {
  const mockOnRating = vi.fn();

  beforeEach(() => {
    mockOnRating.mockClear();
  });

  describe('Rendering', () => {
    it('should render both thumbs up and thumbs down buttons', () => {
      render(<FeedbackButtons rating={null} onRating={mockOnRating} />);
      
      const thumbsUpButton = screen.getByTitle('This insight was helpful');
      const thumbsDownButton = screen.getByTitle('This insight was not helpful');
      
      expect(thumbsUpButton).toBeInTheDocument();
      expect(thumbsDownButton).toBeInTheDocument();
    });

    it('should show correct visual state when no rating is set', () => {
      render(<FeedbackButtons rating={null} onRating={mockOnRating} />);
      
      const thumbsUpButton = screen.getByTitle('This insight was helpful');
      const thumbsDownButton = screen.getByTitle('This insight was not helpful');
      
      expect(thumbsUpButton).toHaveClass('text-gray-400');
      expect(thumbsDownButton).toHaveClass('text-gray-400');
    });

    it('should show thumbs up as active when rating is true', () => {
      render(<FeedbackButtons rating={true} onRating={mockOnRating} />);
      
      const thumbsUpButton = screen.getByTitle('This insight was helpful');
      const thumbsDownButton = screen.getByTitle('This insight was not helpful');
      
      expect(thumbsUpButton).toHaveClass('bg-green-100', 'text-green-700');
      expect(thumbsDownButton).toHaveClass('text-gray-400');
    });

    it('should show thumbs down as active when rating is false', () => {
      render(<FeedbackButtons rating={false} onRating={mockOnRating} />);
      
      const thumbsUpButton = screen.getByTitle('This insight was helpful');
      const thumbsDownButton = screen.getByTitle('This insight was not helpful');
      
      expect(thumbsUpButton).toHaveClass('text-gray-400');
      expect(thumbsDownButton).toHaveClass('bg-red-100', 'text-red-700');
    });

    it('should show disabled state when disabled prop is true', () => {
      render(<FeedbackButtons rating={null} onRating={mockOnRating} disabled={true} />);
      
      const thumbsUpButton = screen.getByTitle('This insight was helpful');
      const thumbsDownButton = screen.getByTitle('This insight was not helpful');
      
      expect(thumbsUpButton).toBeDisabled();
      expect(thumbsDownButton).toBeDisabled();
      expect(thumbsUpButton).toHaveClass('opacity-50', 'cursor-not-allowed');
      expect(thumbsDownButton).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  describe('User Interactions', () => {
    it('should call onRating with true when thumbs up is clicked', async () => {
      const user = userEvent.setup();
      render(<FeedbackButtons rating={null} onRating={mockOnRating} />);
      
      const thumbsUpButton = screen.getByTitle('This insight was helpful');
      await user.click(thumbsUpButton);
      
      expect(mockOnRating).toHaveBeenCalledTimes(1);
      expect(mockOnRating).toHaveBeenCalledWith(true);
    });

    it('should call onRating with false when thumbs down is clicked', async () => {
      const user = userEvent.setup();
      render(<FeedbackButtons rating={null} onRating={mockOnRating} />);
      
      const thumbsDownButton = screen.getByTitle('This insight was not helpful');
      await user.click(thumbsDownButton);
      
      expect(mockOnRating).toHaveBeenCalledTimes(1);
      expect(mockOnRating).toHaveBeenCalledWith(false);
    });

    it('should allow changing from thumbs up to thumbs down', async () => {
      const user = userEvent.setup();
      render(<FeedbackButtons rating={true} onRating={mockOnRating} />);
      
      const thumbsDownButton = screen.getByTitle('This insight was not helpful');
      await user.click(thumbsDownButton);
      
      expect(mockOnRating).toHaveBeenCalledWith(false);
    });

    it('should allow changing from thumbs down to thumbs up', async () => {
      const user = userEvent.setup();
      render(<FeedbackButtons rating={false} onRating={mockOnRating} />);
      
      const thumbsUpButton = screen.getByTitle('This insight was helpful');
      await user.click(thumbsUpButton);
      
      expect(mockOnRating).toHaveBeenCalledWith(true);
    });

    it('should not trigger onRating when disabled', async () => {
      const user = userEvent.setup();
      render(<FeedbackButtons rating={null} onRating={mockOnRating} disabled={true} />);
      
      const thumbsUpButton = screen.getByTitle('This insight was helpful');
      const thumbsDownButton = screen.getByTitle('This insight was not helpful');
      
      await user.click(thumbsUpButton);
      await user.click(thumbsDownButton);
      
      expect(mockOnRating).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button elements', () => {
      render(<FeedbackButtons rating={null} onRating={mockOnRating} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    it('should have descriptive titles for screen readers', () => {
      render(<FeedbackButtons rating={null} onRating={mockOnRating} />);
      
      expect(screen.getByTitle('This insight was helpful')).toBeInTheDocument();
      expect(screen.getByTitle('This insight was not helpful')).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<FeedbackButtons rating={null} onRating={mockOnRating} />);
      
      const thumbsUpButton = screen.getByTitle('This insight was helpful');
      
      // Focus the button and press Enter
      thumbsUpButton.focus();
      await user.keyboard('{Enter}');
      
      expect(mockOnRating).toHaveBeenCalledWith(true);
    });

    it('should be navigable with Tab key', async () => {
      const user = userEvent.setup();
      render(<FeedbackButtons rating={null} onRating={mockOnRating} />);
      
      const thumbsUpButton = screen.getByTitle('This insight was helpful');
      const thumbsDownButton = screen.getByTitle('This insight was not helpful');
      
      // Tab should move focus between buttons
      await user.tab();
      expect(thumbsUpButton).toHaveFocus();
      
      await user.tab();
      expect(thumbsDownButton).toHaveFocus();
    });
  });

  describe('Visual Feedback', () => {
    it('should show hover states on interactive buttons', () => {
      render(<FeedbackButtons rating={null} onRating={mockOnRating} />);
      
      const thumbsUpButton = screen.getByTitle('This insight was helpful');
      const thumbsDownButton = screen.getByTitle('This insight was not helpful');
      
      expect(thumbsUpButton).toHaveClass('hover:text-green-600', 'hover:bg-green-50');
      expect(thumbsDownButton).toHaveClass('hover:text-red-600', 'hover:bg-red-50');
    });

    it('should have transition effects', () => {
      render(<FeedbackButtons rating={null} onRating={mockOnRating} />);
      
      const thumbsUpButton = screen.getByTitle('This insight was helpful');
      const thumbsDownButton = screen.getByTitle('This insight was not helpful');
      
      expect(thumbsUpButton).toHaveClass('transition-colors');
      expect(thumbsDownButton).toHaveClass('transition-colors');
    });

    it('should have proper sizing and spacing', () => {
      render(<FeedbackButtons rating={null} onRating={mockOnRating} />);
      
      const container = screen.getByTitle('This insight was helpful').parentElement;
      const thumbsUpButton = screen.getByTitle('This insight was helpful');
      
      expect(container).toHaveClass('flex', 'items-center', 'gap-1');
      expect(thumbsUpButton).toHaveClass('p-1.5', 'rounded');
      
      // Check SVG icon size
      const svgIcon = thumbsUpButton.querySelector('svg');
      expect(svgIcon).toHaveClass('w-4', 'h-4');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive clicks', async () => {
      const user = userEvent.setup();
      render(<FeedbackButtons rating={null} onRating={mockOnRating} />);
      
      const thumbsUpButton = screen.getByTitle('This insight was helpful');
      
      // Click multiple times rapidly
      await user.click(thumbsUpButton);
      await user.click(thumbsUpButton);
      await user.click(thumbsUpButton);
      
      expect(mockOnRating).toHaveBeenCalledTimes(3);
      expect(mockOnRating).toHaveBeenCalledWith(true);
    });

    it('should handle undefined onRating gracefully', () => {
      // @ts-expect-error Testing edge case
      expect(() => render(<FeedbackButtons rating={null} onRating={undefined} />))
        .not.toThrow();
    });

    it('should handle alternating clicks correctly', async () => {
      const user = userEvent.setup();
      render(<FeedbackButtons rating={null} onRating={mockOnRating} />);
      
      const thumbsUpButton = screen.getByTitle('This insight was helpful');
      const thumbsDownButton = screen.getByTitle('This insight was not helpful');
      
      await user.click(thumbsUpButton);
      await user.click(thumbsDownButton);
      await user.click(thumbsUpButton);
      
      expect(mockOnRating).toHaveBeenCalledTimes(3);
      expect(mockOnRating).toHaveBeenNthCalledWith(1, true);
      expect(mockOnRating).toHaveBeenNthCalledWith(2, false);
      expect(mockOnRating).toHaveBeenNthCalledWith(3, true);
    });
  });
});