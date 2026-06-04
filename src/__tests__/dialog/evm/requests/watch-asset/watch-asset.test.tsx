import '@testing-library/jest-dom';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { WatchAsset } from '@dialog/evm/requests/watch-asset/watch-asset';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { CommunicationUtils } from 'src/utils/communication.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
jest.mock('src/dialog/evm/evm-operation/evm-operation', () => ({
  EvmOperation: ({ bottomPanel, onConfirm, confirmDisabled }: any) => (
    <div data-testid="evm-operation">
      {bottomPanel}
      <button
        data-testid="dialog-confirm"
        disabled={confirmDisabled}
        onClick={() => void onConfirm()}>
        confirm
      </button>
    </div>
  ),
}));

jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    runtimeSendMessage: jest.fn(),
  },
}));

const customChain = {
  chainId: '0x539',
  name: 'Local Custom Chain',
  isCustom: true,
} as any;

const request = {
  request_id: 99,
  method: EvmRequestMethod.WALLET_WATCH_ASSETS,
  chainId: '0x539',
  params: [
    {
      type: 'ERC20',
      options: {
        address: '0x00000000000000000000000000000000000000aa',
        symbol: 'OLD',
        decimals: 18,
        image: 'https://example.com/old.png',
      },
    },
  ],
} as any;

const data = {
  tab: 7,
  dappInfo: {
    origin: 'https://example.app',
    domain: 'example.app',
  },
  accounts: [
    {
      address: '0x00000000000000000000000000000000000000ff',
    },
  ],
} as any;

describe('WatchAsset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    I18nUtils.getMessage = jest.fn(
      (key: string, params?: string[]) =>
        params?.length ? `${key}:${params.join(',')}` : key,
    );
    jest.spyOn(ChainUtils, 'getChain').mockResolvedValue(customChain);
    jest
      .spyOn(EvmChainUtils, 'getLastEvmChainIdForOrigin')
      .mockResolvedValue('0x539');
    jest.spyOn(EvmTokensUtils, 'getCustomTokens').mockResolvedValue([]);
    jest
      .spyOn(EvmTokensUtils, 'fetchErc20NameAndDecimalsFromChain')
      .mockResolvedValue({ name: 'Fetched Token', decimals: 6 });
    jest.spyOn(EvmTokensUtils, 'addCustomToken').mockResolvedValue(undefined);
  });

  it('prefills the editable ERC20 form from wallet_watchAsset params', async () => {
    render(
      <WatchAsset request={request} data={data} afterCancel={jest.fn()} />,
    );

    expect(await screen.findByTestId('custom-asset-symbol')).toHaveValue('OLD');
    await waitFor(() => {
      expect(screen.getByTestId('custom-asset-decimals')).toHaveValue('6');
    });
    expect(screen.getByTestId('custom-asset-name')).toHaveValue(
      'Fetched Token',
    );
    expect(screen.getByTestId('custom-asset-logo')).toHaveValue(
      'https://example.com/old.png',
    );
  });

  it('saves edited ERC20 metadata and returns true to the dApp', async () => {
    render(
      <WatchAsset request={request} data={data} afterCancel={jest.fn()} />,
    );

    await waitFor(() => {
      expect(
        EvmTokensUtils.fetchErc20NameAndDecimalsFromChain,
      ).toHaveBeenCalledWith(
        customChain,
        '0x00000000000000000000000000000000000000AA',
      );
    });

    fireEvent.change(screen.getByTestId('custom-asset-symbol'), {
      target: { value: 'NEW' },
    });
    fireEvent.change(screen.getByTestId('custom-asset-logo'), {
      target: { value: 'https://example.com/new.png' },
    });
    fireEvent.click(screen.getByTestId('dialog-confirm'));

    await waitFor(() => {
      expect(EvmTokensUtils.addCustomToken).toHaveBeenCalledWith(
        customChain,
        '0x00000000000000000000000000000000000000ff',
        {
          address: '0x00000000000000000000000000000000000000AA',
          type: EVMSmartContractType.ERC20,
          metadata: {
            type: EVMSmartContractType.ERC20,
            name: 'Fetched Token',
            symbol: 'NEW',
            decimals: 6,
            logo: 'https://example.com/new.png',
          },
        },
      );
    });

    expect(CommunicationUtils.runtimeSendMessage).toHaveBeenCalledWith({
      command: BackgroundCommand.SEND_EVM_RESPONSE_TO_SW,
      value: {
        requestId: 99,
        tab: 7,
        origin: 'https://example.app',
        result: true,
      },
    });
  });

  it('blocks duplicate token addresses', async () => {
    jest.spyOn(EvmTokensUtils, 'getCustomTokens').mockResolvedValue([
      {
        address: '0x00000000000000000000000000000000000000AA',
        type: EVMSmartContractType.ERC20,
      },
    ] as any);

    render(
      <WatchAsset request={request} data={data} afterCancel={jest.fn()} />,
    );

    await screen.findByTestId('custom-asset-symbol');
    fireEvent.click(screen.getByTestId('dialog-confirm'));

    expect(
      await screen.findByText(
        'evm_add_custom_asset_error_contract_address_duplicate',
      ),
    ).toBeInTheDocument();
    expect(EvmTokensUtils.addCustomToken).not.toHaveBeenCalled();
    expect(CommunicationUtils.runtimeSendMessage).not.toHaveBeenCalled();
  });
});
