import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { NativeAndErc20Token } from 'src/popup/evm/interfaces/active-account.interface';
import { EVMSmartContractType } from 'src/popup/evm/interfaces/evm-tokens.interface';
import { WalletInfoSectionItem } from 'src/popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section-item/evm-wallet-info-section-item.component';
import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => <span aria-hidden="true" />,
}));

jest.mock(
  'src/popup/evm/pages/home/evm-token-logo/evm-token-logo.component',
  () => ({
    EvmTokenLogo: () => <span aria-hidden="true" />,
  }),
);

describe('EVM WalletInfoSectionItem', () => {
  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
    HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('opens the wallet actions and activates them from the keyboard', async () => {
    const user = userEvent.setup();
    const navigateToWithParams = jest.fn();
    render(
      <WalletInfoSectionItem
        token={
          {
            tokenInfo: {
              symbol: 'ETH',
              type: EVMSmartContractType.NATIVE,
            },
          } as unknown as NativeAndErc20Token
        }
        icon={SVGIcons.BLOCKCHAIN_ETHEREUM}
        mainValue="1.0"
        mainValueLabel="Ethereum"
        mainValueSubLabel="ETH"
        navigateToWithParams={navigateToWithParams}
      />,
    );

    const disclosure = screen.getByRole('button', { name: /Ethereum/ });
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');

    disclosure.focus();
    await user.keyboard('{Enter}');
    expect(disclosure).toHaveAttribute('aria-expanded', 'true');

    const sendButton = await screen.findByRole('button', {
      name: 'popup_html_send_transfer',
    });
    sendButton.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(navigateToWithParams).toHaveBeenCalled());

    disclosure.focus();
    await user.keyboard(' ');
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
  });
});
