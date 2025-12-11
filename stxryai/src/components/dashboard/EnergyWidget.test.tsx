import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnergyWidget from './EnergyWidget';

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
      render(
        <EnergyWidget
          currentEnergy={75}
          maxEnergy={100}
          isPremium={false}
          variant="full"
        />
      );

      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('/ 100')).toBeInTheDocument();
    });

    it('shows correct energy percentage', () => {
      render(
        <EnergyWidget
          currentEnergy={60}
          maxEnergy={100}
          isPremium={false}
          variant="full"
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle({ width: '60%' });
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
        expect(screen.getByText(/0h 30m/)).toBeInTheDocument();
      });
    });

    it('shows premium unlimited badge', () => {
      render(
        <EnergyWidget
          currentEnergy={100}
          maxEnergy={100}
          isPremium={true}
          variant="full"
        />
      );

      expect(screen.getByText(/Unlimited/i)).toBeInTheDocument();
      expect(screen.queryByText(/Next recharge/i)).not.toBeInTheDocument();
    });

    it('shows upgrade button for free users', () => {
      render(
        <EnergyWidget
          currentEnergy={30}
          maxEnergy={100}
          isPremium={false}
          variant="full"
        />
      );

      expect(screen.getByText(/Upgrade to Premium/i)).toBeInTheDocument();
    });

    it('applies warning color when energy is low', () => {
      render(
        <EnergyWidget
          currentEnergy={15}
          maxEnergy={100}
          isPremium={false}
          variant="full"
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-yellow-500');
    });

    it('applies danger color when energy is critical', () => {
      render(
        <EnergyWidget
          currentEnergy={5}
          maxEnergy={100}
          isPremium={false}
          variant="full"
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-red-500');
    });
  });

  describe('Compact Variant', () => {
    it('renders compact version correctly', () => {
      render(
        <EnergyWidget
          currentEnergy={80}
          maxEnergy={100}
          isPremium={false}
          variant="compact"
        />
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
      const user = userEvent.setup({ delay: null });
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

      const upgradeButton = screen.getByText(/Upgrade to Premium/i);
      await user.click(upgradeButton);

      expect(onUpgrade).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero energy', () => {
      render(
        <EnergyWidget
          currentEnergy={0}
          maxEnergy={100}
          isPremium={false}
          variant="full"
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });

    it('handles full energy', () => {
      render(
        <EnergyWidget
          currentEnergy={100}
          maxEnergy={100}
          isPremium={false}
          variant="full"
        />
      );

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.queryByText(/Next recharge/i)).not.toBeInTheDocument();
    });

    it('handles custom max energy', () => {
      render(
        <EnergyWidget
          currentEnergy={75}
          maxEnergy={150}
          isPremium={false}
          variant="full"
        />
      );

      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('/ 150')).toBeInTheDocument();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle({ width: '50%' });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <EnergyWidget
          currentEnergy={60}
          maxEnergy={100}
          isPremium={false}
          variant="full"
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('upgrade button is keyboard accessible', async () => {
      const user = userEvent.setup({ delay: null });
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

      const upgradeButton = screen.getByText(/Upgrade to Premium/i);
      upgradeButton.focus();
      await user.keyboard('{Enter}');

      expect(onUpgrade).toHaveBeenCalled();
    });
  });
});
