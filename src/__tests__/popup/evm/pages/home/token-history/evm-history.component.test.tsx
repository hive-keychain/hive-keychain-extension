import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EvmHistory } from '@popup/evm/pages/home/token-history/evm-history.component';
import { EvmUserHistoryItemType } from '@popup/evm/interfaces/evm-tokens-history.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { SVGIcons } from 'src/common-ui/icons.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: ({ icon }: { icon: SVGIcons }) => (
    <span data-icon={icon} data-testid="svg-icon" />
  ),
}));

describe('EvmHistory', () => {
  const customChain = {
    chainId: '12345',
    isCustom: true,
    mainToken: 'TST',
    name: 'Custom Chain',
    rpcs: [],
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    I18nUtils.getMessage = jest.fn((key: string) => {
      if (key === 'evm_custom_history_info_card_message') {
        return 'On this custom chain, only transactions broadcasted by Keychain will be displayed';
      }
      if (key === 'evm_custom_erc20_empty_card_hide') {
        return 'Hide';
      }
      return key;
    });
  });

  it('shows a hideable custom-chain history info card', async () => {
    const saveSpy = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue(undefined);
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(undefined);

    render(
      <EvmHistory
        chain={customChain}
        history={{ events: [], fullyFetch: true, nextCursor: null }}
        loading={false}
        navigateToWithParams={jest.fn()}
        onClickOnLoadMore={jest.fn()}
      />,
    );

    await screen.findByText(
      'On this custom chain, only transactions broadcasted by Keychain will be displayed',
    );

    fireEvent.click(screen.getByText('Hide'));

    await waitFor(() =>
      expect(saveSpy).toHaveBeenCalledWith(
        LocalStorageKeyEnum.EVM_CUSTOM_HISTORY_INFO_CARD_HIDDEN,
        { '12345': true },
      ),
    );
    await waitFor(() =>
      expect(
        screen.queryByText(
          'On this custom chain, only transactions broadcasted by Keychain will be displayed',
        ),
      ).toBeNull(),
    );
  });

  it('does not show the history info card on default chains', async () => {
    const getSpy = jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(undefined);

    render(
      <EvmHistory
        chain={{ ...customChain, isCustom: false }}
        history={{ events: [], fullyFetch: true, nextCursor: null }}
        loading={false}
        navigateToWithParams={jest.fn()}
        onClickOnLoadMore={jest.fn()}
      />,
    );

    await waitFor(() =>
      expect(
        screen.queryByText(
          'On this custom chain, only transactions broadcasted by Keychain will be displayed',
        ),
      ).toBeNull(),
    );
    expect(getSpy).not.toHaveBeenCalled();
  });

  it('uses the swap icon for swap history items', async () => {
    render(
      <EvmHistory
        chain={{ ...customChain, isCustom: false }}
        history={{
          events: [
            {
              pageTitle: 'evm_history_smart_contract',
              opName: 'SWAP',
              type: EvmUserHistoryItemType.SMART_CONTRACT,
              blockNumber: 1,
              transactionHash: '0xabc',
              transactionIndex: 0,
              timestamp: 1710000000,
              label: 'Swapped 1 ETH for 1000 USDC',
              nonce: 1,
            },
          ],
          fullyFetch: true,
          nextCursor: null,
        }}
        loading={false}
        navigateToWithParams={jest.fn()}
        onClickOnLoadMore={jest.fn()}
      />,
    );

    expect(
      await screen.findByText('Swapped 1 ETH for 1000 USDC'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('svg-icon')).toHaveAttribute(
      'data-icon',
      SVGIcons.SWAPS_ITEM,
    );
  });

  it('loads more history from the keyboard', async () => {
    const user = userEvent.setup();
    const onClickOnLoadMore = jest.fn();
    render(
      <EvmHistory
        chain={{ ...customChain, isCustom: false }}
        history={{ events: [], fullyFetch: false, nextCursor: 'next' }}
        loading={false}
        navigateToWithParams={jest.fn()}
        onClickOnLoadMore={onClickOnLoadMore}
      />,
    );

    const loadMoreButton = screen.getByRole('button', {
      name: 'popup_html_load_more',
    });
    loadMoreButton.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onClickOnLoadMore).toHaveBeenCalledTimes(2);
  });
});
