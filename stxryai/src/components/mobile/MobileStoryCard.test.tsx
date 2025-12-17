import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MobileStoryCard, { MobileStoryStack } from './MobileStoryCard';
import { mockStory, mockStoryArray } from '@/utils/test-utils';

describe('MobileStoryCard', () => {
  const defaultStory = mockStory();

  describe('Standard Variant', () => {
    it('renders story information correctly', () => {
      render(<MobileStoryCard story={defaultStory} variant="standard" />);

      expect(screen.getByText(defaultStory.title)).toBeInTheDocument();
      expect(screen.getByText(`by ${defaultStory.author}`)).toBeInTheDocument();
      expect(screen.getByText(defaultStory.genre)).toBeInTheDocument();
    });

    it('displays rating, reads, and chapters', () => {
      render(<MobileStoryCard story={defaultStory} variant="standard" />);

      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('12.5K')).toBeInTheDocument();
      expect(screen.getByText('15 ch')).toBeInTheDocument();
    });

    it('shows premium badge for premium stories', () => {
      const premiumStory = mockStory({ isPremium: true });

      render(<MobileStoryCard story={premiumStory} variant="standard" />);

      expect(screen.getByText(/Premium/i)).toBeInTheDocument();
    });

    it('does not show premium badge for free stories', () => {
      render(<MobileStoryCard story={defaultStory} variant="standard" />);

      expect(screen.queryByText(/Premium/i)).not.toBeInTheDocument();
    });

    it('calls onTap when card is clicked', async () => {
      const user = userEvent.setup();
      const onTap = jest.fn();

      render(<MobileStoryCard story={defaultStory} variant="standard" onTap={onTap} />);

      const card = screen.getByText(defaultStory.title).closest('div');
      if (card) {
        await user.click(card);
      }

      expect(onTap).toHaveBeenCalledWith(defaultStory);
    });
  });

  describe('Swipeable Variant', () => {
    it('renders story information in swipeable mode', () => {
      render(<MobileStoryCard story={defaultStory} variant="swipeable" />);

      expect(screen.getByText(defaultStory.title)).toBeInTheDocument();
      expect(screen.getByText(`by ${defaultStory.author}`)).toBeInTheDocument();
    });

    it('shows swipe indicators', () => {
      render(<MobileStoryCard story={defaultStory} variant="swipeable" />);

      expect(screen.getByText(/SAVE/i)).toBeInTheDocument();
      expect(screen.getByText(/SKIP/i)).toBeInTheDocument();
    });

    it('displays premium badge prominently in swipeable mode', () => {
      const premiumStory = mockStory({ isPremium: true });

      render(<MobileStoryCard story={premiumStory} variant="swipeable" />);

      expect(screen.getByText(/Premium Story/i)).toBeInTheDocument();
    });
  });

  describe('Number Formatting', () => {
    it('formats numbers in K for thousands', () => {
      const story = mockStory({ reads: 5000 });

      render(<MobileStoryCard story={story} variant="standard" />);

      expect(screen.getByText('5.0K')).toBeInTheDocument();
    });

    it('formats numbers in M for millions', () => {
      const story = mockStory({ reads: 1500000 });

      render(<MobileStoryCard story={story} variant="standard" />);

      expect(screen.getByText('1.5M')).toBeInTheDocument();
    });

    it('shows regular number for values under 1000', () => {
      const story = mockStory({ reads: 999 });

      render(<MobileStoryCard story={story} variant="standard" />);

      expect(screen.getByText('999')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible card structure', () => {
      const { container } = render(<MobileStoryCard story={defaultStory} variant="standard" />);

      // Card should be clickable/tappable
      const card = container.firstChild;
      expect(card).toBeInTheDocument();
    });
  });
});

describe('MobileStoryStack', () => {
  const stories = mockStoryArray(5);

  it('renders the first story card', () => {
    render(<MobileStoryStack stories={stories} />);

    expect(screen.getByText(stories[0].title)).toBeInTheDocument();
  });

  it('shows completion message when all stories are viewed', () => {
    render(<MobileStoryStack stories={[]} />);

    expect(screen.getByText(/All Caught Up!/i)).toBeInTheDocument();
    expect(screen.getByText(/Check back later/i)).toBeInTheDocument();
  });

  it('stacks multiple cards', () => {
    const { container } = render(<MobileStoryStack stories={stories} />);

    // Should render up to 3 stacked cards
    const cards = container.querySelectorAll('[style*="z-index"]');
    expect(cards.length).toBeGreaterThan(0);
  });
});
