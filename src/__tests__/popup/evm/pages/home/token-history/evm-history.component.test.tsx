import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EvmHistory } from '@popup/evm/pages/home/token-history/evm-history.component';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => <span data-testid="svg-icon" />,
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
    global.chrome.i18n.getMessage = jest.fn((key: string) => {
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
});
