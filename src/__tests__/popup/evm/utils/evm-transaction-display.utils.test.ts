import {
  EvmUserHistoryItemDetail,
  EvmUserHistoryItemDetailType,
  EvmUserHistoryItemType,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import {
  EVMSmartContractType,
  EvmSmartContractInfoErc20,
  EvmSmartContractInfoErc721,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTransactionDisplayUtils } from '@popup/evm/utils/evm-transaction-display.utils';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ethers, TransactionResponse } from 'ethers';

import { I18nUtils } from 'src/utils/i18n.utils';

describe('evm-transaction-display.utils', () => {
  const wallet = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const receiver = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  const chain = {
    chainId: '0x1',
    mainToken: 'ETH',
  } as EvmChain;

  const baseTx = (
    overrides: Partial<TransactionResponse> = {},
  ): TransactionResponse =>
    ({
      hash: '0xhash',
      nonce: 3,
      from: wallet,
      to: receiver,
      value: BigInt(0),
      data: '0x',
      blockNumber: null,
      index: null,
      ...overrides,
    }) as TransactionResponse;

  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string, params?: string[]) =>
      params?.length ? `${key}:${params.join('|')}` : key,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('builds a native transfer display item from a broadcast transaction', async () => {
    const item = await EvmTransactionDisplayUtils.buildDisplayItemFromBroadcast(
      baseTx({ value: ethers.parseEther('0.01') }),
      chain,
      wallet,
    );

    expect(item).toMatchObject({
      type: EvmUserHistoryItemType.TRANSFER_OUT,
      pageTitle: 'popup_html_transfer_funds',
      transactionHash: '0xhash',
      nonce: 3,
      receiverAddress: receiver,
    });
    expect(item.label).toContain('popup_html_evm_history_transfer_out');
    expect(item.detailFields).toEqual([
      expect.objectContaining({
        label: 'popup_html_transfer_amount',
        value: '0.01 ETH',
        type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
      }),
      expect.objectContaining({
        label: 'popup_html_evm_transaction_info_from',
        value: wallet,
        type: EvmUserHistoryItemDetailType.ADDRESS,
      }),
      expect.objectContaining({
        label: 'popup_html_evm_transaction_info_to',
        value: receiver,
        type: EvmUserHistoryItemDetailType.ADDRESS,
      }),
    ]);
  });

  it('builds an ERC-20 transfer display item from calldata and token context', async () => {
    const tokenInfo: EvmSmartContractInfoErc20 = {
      type: EVMSmartContractType.ERC20,
      name: 'Token',
      symbol: 'TKN',
      logo: '',
      chainId: chain.chainId,
      backgroundColor: '',
      priceUsd: null,
      contractAddress: '0xcccccccccccccccccccccccccccccccccccccccc',
      possibleSpam: false,
      verifiedContract: true,
      isProxy: false,
      proxyTarget: null,
      decimals: 18,
      validated: 1,
    };
    const iface = new ethers.Interface([
      'function transfer(address to, uint256 amount)',
    ]);
    const data = iface.encodeFunctionData('transfer', [
      receiver,
      ethers.parseUnits('1.5', 18),
    ]);

    const item = await EvmTransactionDisplayUtils.buildDisplayItemFromBroadcast(
      baseTx({
        to: tokenInfo.contractAddress,
        data,
      }),
      chain,
      wallet,
      { tokenInfo, pageTitle: 'popup_html_transfer_funds' },
    );

    expect(item).toMatchObject({
      type: EvmUserHistoryItemType.TRANSFER_OUT,
      tokenInfo,
      receiverAddress: ethers.getAddress(receiver),
    });
    expect(item.detailFields).toEqual([
      expect.objectContaining({
        label: 'popup_html_transfer_amount',
        value: '1.5 TKN',
        type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
      }),
      expect.objectContaining({
        label: 'popup_html_evm_transaction_info_from',
        value: wallet,
        type: EvmUserHistoryItemDetailType.ADDRESS,
      }),
      expect.objectContaining({
        label: 'popup_html_evm_transaction_info_to',
        value: ethers.getAddress(receiver),
        type: EvmUserHistoryItemDetailType.ADDRESS,
      }),
    ]);
  });

  it('preserves NFT detail fields from explicit display context', async () => {
    const tokenInfo: EvmSmartContractInfoErc721 = {
      type: EVMSmartContractType.ERC721,
      name: 'Collectible',
      symbol: 'NFT',
      logo: '',
      chainId: chain.chainId,
      backgroundColor: '',
      priceUsd: null,
      contractAddress: '0xcccccccccccccccccccccccccccccccccccccccc',
      possibleSpam: false,
      verifiedContract: true,
      isProxy: false,
      proxyTarget: null,
    };
    const detailFields: EvmUserHistoryItemDetail[] = [
      {
        label: 'Collectible #7',
        value: '7',
        type: EvmUserHistoryItemDetailType.IMAGE,
        imageUrl: 'https://example.com/nft.png',
      },
    ];

    const item = await EvmTransactionDisplayUtils.buildDisplayItemFromBroadcast(
      baseTx({ to: tokenInfo.contractAddress, data: '0x12345678' }),
      chain,
      wallet,
      {
        pageTitle: 'evm_nft_transfer',
        detailFields,
        tokenInfo,
        receiverAddress: receiver,
        amount: 1,
      },
    );

    expect(item).toMatchObject({
      type: EvmUserHistoryItemType.TRANSFER_OUT,
      pageTitle: 'evm_nft_transfer',
      tokenInfo,
      detailFields,
    });
    expect(item.label).toContain(
      'evm_history_operation_safe_transfer_from_erc721_out',
    );
  });

  it('falls back to a decoded smart-contract display item', async () => {
    jest.spyOn(EvmTransactionParserUtils, 'parseData').mockResolvedValue({
      operationName: 'swapExactTokensForTokens',
      inputs: [],
    });

    const item = await EvmTransactionDisplayUtils.buildDisplayItemFromBroadcast(
      baseTx({ data: '0x38ed173900000000' }),
      chain,
      wallet,
    );

    expect(item).toMatchObject({
      type: EvmUserHistoryItemType.SMART_CONTRACT,
      pageTitle: 'evm_broadcast',
    });
    expect(item.label).toContain('swapExactTokensForTokens');
    expect(item.detailFields).toEqual([
      {
        label: 'evm_history_smart_contract',
        value: receiver,
        type: EvmUserHistoryItemDetailType.ADDRESS,
      },
    ]);
  });
});
