import '@testing-library/jest-dom';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { customRender, screen, waitFor } from 'src/__tests__/utils-for-testing/setups/render';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { copyTextWithToast } from 'src/common-ui/toast/copy-toast.utils';
import { EvmAccountSource } from 'src/popup/evm/interfaces/wallet.interface';
import { EvmAccountsComponent } from 'src/popup/evm/pages/home/settings/evm-accounts/evm-accounts.component';
import { ChainType } from 'src/popup/multichain/interfaces/chains.interface';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: ({ dataTestId, className, onClick }: any) => (
    <div
      data-testid={dataTestId}
      className={`svg-icon ${className ?? ''}`}
      onClick={onClick}
    />
  ),
}));

jest.mock('src/common-ui/evm/evm-account-display/evm-account-display.component', () => ({
  EvmAccountDisplayComponent: () => <div data-testid="evm-account-display" />,
}));

jest.mock('src/common-ui/toast/copy-toast.utils', () => ({
  COPY_GENERIC_MESSAGE_KEY: 'swap_copied_to_clipboard',
  copyTextWithToast: jest.fn().mockResolvedValue(true),
}));

describe('EvmAccountsComponent', () => {
  const mk = 'my-password';
  const mnemonic = 'test test test test test test test test test test test junk';
  const wallet = {
    address: '0x1234567890123456789012345678901234567890',
    mnemonic: { phrase: mnemonic },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(chrome.i18n, 'getMessage').mockImplementation((key: string) => key);
  });

  it('asks for the password before copying the seed phrase', async () => {
    const user = userEvent.setup();
    const { container } = customRender(<EvmAccountsComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk,
        chain: {
          ...initialEmptyStateStore.chain,
          type: ChainType.EVM,
          chainId: '1',
          name: 'Ethereum',
        },
        evm: {
          ...initialEmptyStateStore.evm,
          accounts: [
            {
              id: 0,
              path: "m/44'/60'/0'/0/0",
              seedId: 1,
              seedNickname: 'Main seed',
              nickname: 'Account 1',
              source: EvmAccountSource.SEED,
              wallet,
            },
          ],
        },
      },
    });

    const menuButton = container.querySelector(
      '.contextual-menu > .svg-icon.clickable',
    ) as HTMLElement;

    await user.click(menuButton);
    await user.click(screen.getByText('evm_copy_seed'));

    expect(
      screen.getByText('evm_copy_seed_phrase_password_caption'),
    ).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText('popup_html_master_password'),
      'wrong-password',
    );
    await user.click(screen.getByText('popup_html_submit'));

    expect(await screen.findByText('wrong_password')).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText('popup_html_master_password'));
    await user.type(
      screen.getByPlaceholderText('popup_html_master_password'),
      mk,
    );
    await user.click(screen.getByText('popup_html_submit'));

    await waitFor(() => {
      expect(copyTextWithToast).toHaveBeenCalledWith(
        mnemonic,
        'html_popup_evm_create_wallet_copied_mnemonic',
      );
    });
    await waitFor(() => {
      expect(screen.queryByText('wrong_password')).not.toBeInTheDocument();
    });
  });

  it('opens the EVM Ledger import flow from the seed menu', async () => {
    const user = userEvent.setup();
    chrome.management.getSelf = jest.fn().mockResolvedValue({
      id: 'extension-id',
    });
    chrome.tabs.create = jest.fn();
    const { container } = customRender(<EvmAccountsComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk,
        chain: {
          ...initialEmptyStateStore.chain,
          type: ChainType.EVM,
          chainId: '0x1',
          name: 'Ethereum',
        },
        evm: {
          ...initialEmptyStateStore.evm,
          accounts: [
            {
              id: 0,
              path: "m/44'/60'/0'/0/0",
              seedId: 1,
              seedNickname: 'Main seed',
              nickname: 'Account 1',
              source: EvmAccountSource.SEED,
              wallet,
            },
          ],
        },
      },
    });

    const menuButton = container.querySelector(
      '.contextual-menu > .svg-icon.clickable',
    ) as HTMLElement;

    await user.click(menuButton);
    await user.click(screen.getByText('evm_connect_ledger_wallet'));

    await waitFor(() => {
      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: 'chrome-extension://extension-id/add-evm-accounts-from-ledger.html?chainId=0x1',
      });
    });
  });
});
