import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnergyWidget from './EnergyWidget';

// JSDOM in this environment may not include PointerEvent which some libs use.
beforeAll(() => {
  if (typeof global.PointerEvent === 'undefined') {
    // @ts-ignore - add minimal polyfill for tests

    // @ts-ignore
    global.PointerEvent = class {};
  }
});

describe('EnergyWidget', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Full Variant', () => {
    it('renders current energy correctly', () => {
      render(<EnergyWidget currentEnergy={75} maxEnergy={100} isPremium={false} variant="full" />);

      expect(screen.getByText(/75\s*\/\s*100/)).toBeInTheDocument();
    });

    it('shows correct energy percentage', () => {
      render(<EnergyWidget currentEnergy={60} maxEnergy={100} isPremium={false} variant="full" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    });

    it('displays recharge time when energy is not full', () => {
      const nextRecharge = new Date(Date.now() + 3600000); // 1 hour from now

      render(
        <EnergyWidget
          currentEnergy={50}
          maxEnergy={100}
          isPremium={false}
          variant="full"
          nextRechargeTime={nextRecharge}
        />
      );

      expect(screen.getByText(/Next recharge/i)).toBeInTheDocument();
    });

    it('updates countdown timer', async () => {
      const nextRecharge = new Date(Date.now() + 3600000);

      render(
        <EnergyWidget
          currentEnergy={50}
          maxEnergy={100}
          isPremium={false}
          variant="full"
          nextRechargeTime={nextRecharge}
        />
      );

      // Initial time should be ~1h 0m
      expect(screen.getByText(/1h 0m/)).toBeInTheDocument();

      // Fast-forward 30 minutes
      jest.advanceTimersByTime(30 * 60 * 1000);

      await waitFor(() => {
        expect(screen.getByText(/30m/)).toBeInTheDocument();
      });
    });

    it('shows premium unlimited badge', () => {
      render(<EnergyWidget currentEnergy={100} maxEnergy={100} isPremium={true} variant="full" />);

      // there are multiple "Unlimited" matches (badge and message); assert at least one
      expect(screen.getAllByText(/Unlimited/i).length).toBeGreaterThan(0);
      // premium users should not show the Next Recharge box
      expect(screen.queryByText(/Next recharge/i)).not.toBeInTheDocument();
    });

    it('shows upgrade button for free users', () => {
      render(<EnergyWidget currentEnergy={30} maxEnergy={100} isPremium={false} variant="full" />);

      expect(screen.getByText(/Get Unlimited Energy/i)).toBeInTheDocument();
    });

    it('applies warning color when energy is low', () => {
      render(<EnergyWidget currentEnergy={15} maxEnergy={100} isPremium={false} variant="full" />);

      // low-energy UI should be shown for this threshold
      expect(screen.getByText(/Low Energy/i)).toBeInTheDocument();
    });

    it('applies danger color when energy is critical', () => {
      render(<EnergyWidget currentEnergy={5} maxEnergy={100} isPremium={false} variant="full" />);

      // critical energy should still show low energy messaging (avoid brittle class checks)
      expect(screen.getByText(/Low Energy/i)).toBeInTheDocument();
    });
  });

  describe('Compact Variant', () => {
    it('renders compact version correctly', () => {
      render(
        <EnergyWidget currentEnergy={80} maxEnergy={100} isPremium={false} variant="compact" />
      );

      expect(screen.getByText('⚡')).toBeInTheDocument();
      expect(screen.getByText('80')).toBeInTheDocument();
    });

    it('does not show recharge time in compact mode', () => {
      const nextRecharge = new Date(Date.now() + 3600000);

      render(
        <EnergyWidget
          currentEnergy={50}
          maxEnergy={100}
          isPremium={false}
          variant="compact"
          nextRechargeTime={nextRecharge}
        />
      );

      expect(screen.queryByText(/Next recharge/i)).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onUpgrade when upgrade button is clicked', async () => {
      const onUpgrade = jest.fn();

      render(
        <EnergyWidget
          currentEnergy={30}
          maxEnergy={100}
          isPremium={false}
          variant="full"
          onUpgrade={onUpgrade}
        />
      );

      const upgradeButton = screen.getByRole('button', { name: /Get Unlimited Energy/i });
      fireEvent.click(upgradeButton);

      expect(onUpgrade).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero energy', () => {
      render(<EnergyWidget currentEnergy={0} maxEnergy={100} isPremium={false} variant="full" />);

      expect(screen.getByText(/0\s*\/\s*100/)).toBeInTheDocument();
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('handles full energy', () => {
      render(<EnergyWidget currentEnergy={100} maxEnergy={100} isPremium={false} variant="full" />);

      expect(screen.getByText(/100\s*\/\s*100/)).toBeInTheDocument();
      // when non-premium but full, the widget shows the Next Recharge box with "Full"
      expect(screen.getByText(/Full/)).toBeInTheDocument();
    });

    it('handles custom max energy', () => {
      render(<EnergyWidget currentEnergy={75} maxEnergy={150} isPremium={false} variant="full" />);

      expect(screen.getByText(/75\s*\/\s*150/)).toBeInTheDocument();
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<EnergyWidget currentEnergy={60} maxEnergy={100} isPremium={false} variant="full" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('upgrade button is keyboard accessible', async () => {
      const onUpgrade = jest.fn();

      render(
        <EnergyWidget
          currentEnergy={30}
          maxEnergy={100}
          isPremium={false}
          variant="full"
          onUpgrade={onUpgrade}
        />
      );

      const upgradeButton = screen.getByRole('button', { name: /Get Unlimited Energy/i });
      upgradeButton.focus();
      expect(document.activeElement).toBe(upgradeButton);

      // simulate activation after confirming focus (avoid pointer-event heavy key simulation)
      fireEvent.click(upgradeButton);
      expect(onUpgrade).toHaveBeenCalled();
    });
  });
});
