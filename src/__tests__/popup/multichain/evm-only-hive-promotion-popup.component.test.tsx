import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { EvmOnlyHivePromotionPopupComponent } from 'src/popup/multichain/pages/evm-only-hive-promotion-popup/evm-only-hive-promotion-popup.component';

describe('evm-only-hive-promotion-popup.component tests:\n', () => {
  it('renders the promotion copy and available actions', () => {
    render(
      <EvmOnlyHivePromotionPopupComponent
        onCreateHiveAccount={jest.fn()}
        onMaybeLater={jest.fn()}
        onDontShowAgain={jest.fn()}
      />,
    );

    expect(screen.getByText('Discover Hive with Keychain')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Discover Hive ecosystem' }),
    ).toHaveAttribute('src', '/assets/images/discover-hive-cta.png');
    expect(
      screen.getByText(
        'You already use Keychain for EVM. Hive gives you fast feeless transactions, social apps, games, and account-based identity.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Create Hive account')).toBeInTheDocument();
    expect(screen.getByText('Maybe later')).toBeInTheDocument();
    expect(screen.getByText('Don’t show again')).toBeInTheDocument();
  });

  it('calls the matching handler for each action', async () => {
    const onCreateHiveAccount = jest.fn();
    const onMaybeLater = jest.fn();
    const onDontShowAgain = jest.fn();

    render(
      <EvmOnlyHivePromotionPopupComponent
        onCreateHiveAccount={onCreateHiveAccount}
        onMaybeLater={onMaybeLater}
        onDontShowAgain={onDontShowAgain}
      />,
    );

    await userEvent.click(
      screen.getByTestId('evm-only-hive-promotion-create-account'),
    );
    await userEvent.click(
      screen.getByTestId('evm-only-hive-promotion-maybe-later'),
    );
    await userEvent.click(
      screen.getByTestId('evm-only-hive-promotion-dont-show-again'),
    );

    expect(onCreateHiveAccount).toHaveBeenCalledTimes(1);
    expect(onMaybeLater).toHaveBeenCalledTimes(1);
    expect(onDontShowAgain).toHaveBeenCalledTimes(1);
  });
});
