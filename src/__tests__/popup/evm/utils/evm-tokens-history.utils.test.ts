import { EvmTokensHistoryUtils } from '@popup/evm/utils/evm-tokens-history.utils';
import {
  CatchupStatus,
  EvmLightNodeUtils,
} from '@popup/evm/utils/evm-light-node.utils';
import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
import { EvmSettingsUtils } from '@popup/evm/utils/evm-settings.utils';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';

const chain: EvmChain = {
  name: 'Ethereum',
  type: ChainType.EVM,
  logo: '',
  chainId: '0x1',
  rpcs: [{ url: 'https://rpc.example', isDefault: true }],
  mainToken: 'ETH',
  defaultTransactionType: 2 as any,
};

describe('evm-tokens-history.utils tests:\n', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(EvmSettingsUtils, 'getSettings').mockResolvedValue({
      smartContracts: {
        displayPossibleSpam: false,
        displayNonVerifiedContracts: false,
      },
    } as any);
    jest.spyOn(EvmAddressesUtils, 'getAddressDetails').mockResolvedValue({
      formattedAddress: '0x2222...2222',
      label: undefined,
    } as any);
  });

  it.each([
    { catchupStatus: CatchupStatus.DONE, expectedFullyFetch: true },
    { catchupStatus: CatchupStatus.ERROR, expectedFullyFetch: true },
    { catchupStatus: CatchupStatus.RUNNING, expectedFullyFetch: false },
    { catchupStatus: CatchupStatus.PARTIAL, expectedFullyFetch: false },
    { catchupStatus: CatchupStatus.SKIPPED, expectedFullyFetch: false },
    { catchupStatus: null, expectedFullyFetch: false },
  ])(
    'sets fullyFetch=$expectedFullyFetch when catchupStatus=$catchupStatus',
    async ({ catchupStatus, expectedFullyFetch }) => {
      jest.spyOn(EvmLightNodeUtils, 'getHistory').mockResolvedValue({
        items: [],
        nextCursor: null,
        catchupStatus,
      });

      await expect(
        EvmTokensHistoryUtils.fetchHistory2(
          '0x1111111111111111111111111111111111111111',
          chain,
        ),
      ).resolves.toMatchObject({
        fullyFetch: expectedFullyFetch,
        catchupStatus,
      });
    },
  );

  it('keeps NFT image URLs from light-node history details', async () => {
    jest.spyOn(EvmLightNodeUtils, 'getHistory').mockResolvedValue({
      items: [
        {
          txId: '0xabc',
          blockNumber: 123,
          blockTime: '2026-01-01T00:00:00.000Z',
          opIndex: '0',
          opName: 'ERC721_RECEIVE',
          status: 'SUCCESS',
          fromAddress: '0x2222222222222222222222222222222222222222',
          toAddress: '0x1111111111111111111111111111111111111111',
          action: null,
          in: [
            {
              kind: 'ERC721',
              collectionAddress: '0x3333333333333333333333333333333333333333',
              collectionName: 'Collection',
              tokenId: '7',
              quantity: '1',
              imageUrl: 'https://cdn.example/nft-7.png',
              verified: true,
              possibleSpam: false,
              nft: {
                name: 'Collection #7',
                imageUrl: 'https://cdn.example/legacy-nft-7.png',
                traits: null,
              },
            },
          ],
          out: [],
        },
      ],
      nextCursor: null,
      catchupStatus: CatchupStatus.DONE,
    } as any);

    const history = await EvmTokensHistoryUtils.fetchHistory2(
      '0x1111111111111111111111111111111111111111',
      chain,
    );

    expect(history.events[0].detailFields?.[0]).toMatchObject({
      label: 'Collection #7',
      type: 'IMAGE',
      value: '7',
      imageUrl: 'https://cdn.example/nft-7.png',
    });
  });

  it('displays native amount paid on mint history items', async () => {
    jest.spyOn(EvmLightNodeUtils, 'getHistory').mockResolvedValue({
      items: [
        {
          txId: '0xmint',
          blockNumber: 124,
          blockTime: '2026-01-01T00:00:00.000Z',
          opIndex: '0',
          opName: 'ERC721_MINT',
          status: 'SUCCESS',
          fromAddress: '0x1111111111111111111111111111111111111111',
          toAddress: '0x3333333333333333333333333333333333333333',
          action: null,
          in: [
            {
              kind: 'ERC721',
              collectionAddress: '0x3333333333333333333333333333333333333333',
              collectionName: 'Collection',
              tokenId: '7',
              quantity: '1',
              imageUrl: 'https://cdn.example/nft-7.png',
              verified: true,
              possibleSpam: false,
            },
          ],
          out: [
            {
              kind: 'NATIVE',
              amountWei: '25000000000000000',
              amount: '0.025',
              verified: true,
              possibleSpam: false,
            },
          ],
        },
      ],
      nextCursor: null,
      catchupStatus: CatchupStatus.DONE,
    } as any);

    const history = await EvmTokensHistoryUtils.fetchHistory2(
      '0x1111111111111111111111111111111111111111',
      chain,
    );

    expect(history.events[0].detailFields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'evm_history_native_amount_paid',
          type: 'TOKEN_AMOUNT',
          value: '0.025 ETH',
        }),
      ]),
    );
  });

  it('displays ERC1155 mint quantity and API NFT name in image card labels', async () => {
    jest.spyOn(EvmLightNodeUtils, 'getHistory').mockResolvedValue({
      items: [
        {
          txId: '0xmint1155',
          blockNumber: 125,
          blockTime: '2026-01-01T00:00:00.000Z',
          opIndex: '0',
          opName: 'ERC1155_MINT',
          status: 'SUCCESS',
          fromAddress: '0x0000000000000000000000000000000000000000',
          toAddress: '0x1111111111111111111111111111111111111111',
          action: null,
          in: [
            {
              kind: 'ERC1155',
              collectionAddress: '0x3333333333333333333333333333333333333333',
              collectionName: 'NFT',
              name: 'Golden Key',
              tokenId: '1',
              quantity: '2',
              imageUrl: 'https://cdn.example/nft-1.png',
              verified: true,
              possibleSpam: false,
              nft: {
                name: 'Nested Golden Key',
                imageUrl: 'https://cdn.example/nft-1.png',
                traits: null,
              },
            },
          ],
          out: [],
        },
      ],
      nextCursor: null,
      catchupStatus: CatchupStatus.DONE,
    } as any);

    const history = await EvmTokensHistoryUtils.fetchHistory2(
      '0x1111111111111111111111111111111111111111',
      chain,
    );

    expect(history.events[0].detailFields?.[0]).toMatchObject({
      label: '2 Golden Key #1',
      type: 'IMAGE',
      value: '1',
      imageUrl: 'https://cdn.example/nft-1.png',
    });
  });
});
