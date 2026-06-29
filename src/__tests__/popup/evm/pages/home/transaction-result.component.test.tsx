import '@testing-library/jest-dom';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import {
  EvmUserHistoryItemDetailType,
  EvmUserHistoryItemType,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmTransactionResolvedStatus,
  EvmTransactionType,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmTransactionResultComponent } from '@popup/evm/pages/home/transaction-result/transaction-result.component';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React from 'react';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { ChainType } from 'src/popup/multichain/interfaces/chains.interface';

import { I18nUtils } from 'src/utils/i18n.utils';

describe('EvmTransactionResultComponent', () => {
  let runtimeMessageListener: ((message: any) => void) | undefined;

  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
    runtimeMessageListener = undefined;
    chrome.runtime.onMessage.addListener = jest.fn((listener) => {
      runtimeMessageListener = listener;
    }) as any;
    chrome.runtime.onMessage.removeListener = jest.fn() as any;
    jest.spyOn(EthersUtils, 'getProvider').mockResolvedValue({
      getTransaction: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
  });

  it('shows pending actions without duplicating the transfer amount in the status panel', async () => {
    const wallet = {
      address: '0x1234567890123456789012345678901234567890',
    } as any;
    const tokenInfo = {
      name: 'Ether',
      symbol: 'ETH',
      logo: '',
      chainId: '1',
      backgroundColor: '#000000',
      coingeckoId: 'ethereum',
      priceUsd: 3000,
      createdAt: '',
      categories: [],
      type: EVMSmartContractType.NATIVE,
    };
    const transactionResponse = {
      hash: '0xpending',
      from: wallet.address,
      to: '0x0000000000000000000000000000000000000001',
      nonce: 5,
      chainId: 1,
      value: 1n,
      data: '0x',
      gasLimit: 21000n,
      wait: jest.fn(() => new Promise(() => undefined)),
    } as any;

    customRender(<EvmTransactionResultComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        chain: {
          ...initialEmptyStateStore.chain,
          type: ChainType.EVM,
          chainId: '1',
          name: 'Ethereum',
          logo: '',
          rpcs: [{ url: 'https://rpc.example', isDefault: true }],
          mainToken: 'ETH',
          defaultTransactionType: EvmTransactionType.EIP_1559,
        },
        evm: {
          ...initialEmptyStateStore.evm,
          accounts: [{ wallet }],
          activeAccount: {
            ...initialEmptyStateStore.evm.activeAccount,
            address: wallet.address,
            wallet,
            nativeAndErc20Tokens: {
              value: [{ tokenInfo }],
            },
          },
        },
        navigation: {
          ...initialEmptyStateStore.navigation,
          stack: [
            {
              currentPage: 'EVM_TRANSFER_RESULT_PAGE' as any,
              params: {
                pageTitle: 'popup_html_transfer_funds',
                transactionResponse,
                tokenInfo,
                amount: '1 ETH',
                detailFields: [
                  {
                    label: 'popup_html_transfer_amount',
                    value: '1 ETH',
                    type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
                  },
                ],
              },
            },
          ],
        },
      },
    });

    expect(
      await screen.findByText('popup_html_evm_transfer_status_pending'),
    ).toBeInTheDocument();
    expect(screen.getByText('dialog_cancel')).toBeInTheDocument();
    expect(
      screen.getByText('popup_html_evm_speed_up_transaction'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('1 ETH')).toHaveLength(1);
  });

  it('updates a pending transaction when a success resolution message is received', async () => {
    const wallet = {
      address: '0x1234567890123456789012345678901234567890',
    } as any;
    const transactionResponse = {
      hash: '0xpending',
      from: wallet.address,
      to: '0x0000000000000000000000000000000000000001',
      nonce: 5,
      chainId: 1,
      value: 1n,
      data: '0x',
      gasLimit: 21000n,
      wait: jest.fn(() => new Promise(() => undefined)),
    } as any;
    const displayItem = {
      pageTitle: 'popup_html_transfer_funds',
      type: EvmUserHistoryItemType.TRANSFER_OUT,
      blockNumber: 0,
      transactionHash: '0xpending',
      transactionIndex: 0,
      timestamp: 123,
      label: 'Pending display',
      nonce: 5,
      detailFields: [],
    };

    customRender(<EvmTransactionResultComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        chain: {
          ...initialEmptyStateStore.chain,
          type: ChainType.EVM,
          chainId: '1',
          name: 'Ethereum',
          logo: '',
          rpcs: [{ url: 'https://rpc.example', isDefault: true }],
          mainToken: 'ETH',
          defaultTransactionType: EvmTransactionType.EIP_1559,
        },
        evm: {
          ...initialEmptyStateStore.evm,
          accounts: [{ wallet }],
          activeAccount: {
            ...initialEmptyStateStore.evm.activeAccount,
            address: wallet.address,
            wallet,
            nativeAndErc20Tokens: {
              value: [
                {
                  tokenInfo: {
                    name: 'Ether',
                    symbol: 'ETH',
                    logo: '',
                    chainId: '1',
                    backgroundColor: '#000000',
                    coingeckoId: 'ethereum',
                    priceUsd: 3000,
                    createdAt: '',
                    categories: [],
                    type: EVMSmartContractType.NATIVE,
                  },
                },
              ],
            },
          },
        },
        navigation: {
          ...initialEmptyStateStore.navigation,
          stack: [
            {
              currentPage: 'EVM_TRANSFER_RESULT_PAGE' as any,
              params: {
                pageTitle: 'popup_html_transfer_funds',
                transactionResponse,
                displayItem,
              },
            },
          ],
        },
      },
    });

    expect(
      await screen.findByText('popup_html_evm_transfer_status_pending'),
    ).toBeInTheDocument();

    await act(async () => {
      runtimeMessageListener?.({
        command: BackgroundCommand.EVM_TRANSACTION_RESOLVED,
        value: {
          chainId: '1',
          from: wallet.address,
          hash: '0xpending',
          status: EvmTransactionResolvedStatus.SUCCESS,
          transactionResponseParams: {
            ...transactionResponse,
            wait: undefined,
          },
          transactionReceiptParams: {
            hash: '0xpending',
            status: 1,
            blockNumber: 42,
            gasUsed: '21000',
            gasPrice: '1',
          },
          displayItem: {
            ...displayItem,
            blockNumber: 42,
          },
        },
      });
    });

    await waitFor(() =>
      expect(
        screen.getByText('popup_html_evm_transfer_status_success'),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
