import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmDiscoveryCacheUtils } from '@popup/evm/utils/evm-discovery-cache.utils';
import {
  CatchupStatus,
  PricingStatus,
} from '@popup/evm/utils/evm-light-node.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const wallet = '0xABCDEFabcdefABCDEFabcdefABCDEFabcdefABCD';

const discoveredTokensResponse = {
  address: wallet,
  chainId: '1',
  tokens: [
    {
      type: EVMSmartContractType.NATIVE,
      symbol: 'ETH',
      chainId: '1',
      priceUsd: 100,
    },
  ],
  catchupStatus: CatchupStatus.DONE,
  pricingStatus: PricingStatus.READY,
};

const discoveredNftsResponse = {
  address: wallet,
  chainId: 1,
  collections: [
    {
      contractAddress: '0x00000000000000000000000000000000000000aa',
      contractType: 'ERC721',
      name: 'Collection',
      symbol: 'NFT',
      verifiedContract: true,
      possibleSpam: false,
      nfts: [
        {
          tokenId: '1',
          balance: '1',
          name: 'NFT #1',
          imageUrl: 'https://cdn.example/nft.png',
        },
      ],
    },
  ],
  catchupStatus: CatchupStatus.DONE,
};

describe('EvmDiscoveryCacheUtils', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(undefined as any);
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue(undefined as any);
  });

  it('saves discovered token responses by normalized chain and wallet', async () => {
    await EvmDiscoveryCacheUtils.saveDiscoveredTokens(
      '0x1',
      wallet,
      discoveredTokensResponse,
    );

    expect(LocalStorageUtils.saveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.EVM_DISCOVERED_TOKENS_CACHE,
      {
        '1': {
          [wallet.toLowerCase()]: {
            updatedAt: 1234567890,
            response: discoveredTokensResponse,
          },
        },
      },
    );
  });

  it('retrieves discovered token responses using a lowercase wallet key', async () => {
    const entry = {
      updatedAt: 123,
      response: discoveredTokensResponse,
    };
    (
      LocalStorageUtils.getValueFromLocalStorage as jest.Mock
    ).mockResolvedValue({
      '1': {
        [wallet.toLowerCase()]: entry,
      },
    });

    await expect(
      EvmDiscoveryCacheUtils.getDiscoveredTokens('1', wallet.toUpperCase()),
    ).resolves.toEqual(entry);
  });

  it('saves discovered NFT responses by normalized chain and wallet', async () => {
    await EvmDiscoveryCacheUtils.saveDiscoveredNfts(
      1,
      wallet,
      discoveredNftsResponse,
    );

    expect(LocalStorageUtils.saveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.EVM_DISCOVERED_NFTS_CACHE,
      {
        '1': {
          [wallet.toLowerCase()]: {
            updatedAt: 1234567890,
            response: discoveredNftsResponse,
          },
        },
      },
    );
  });

  it('retrieves discovered NFT responses using a lowercase wallet key', async () => {
    const entry = {
      updatedAt: 456,
      response: discoveredNftsResponse,
    };
    (
      LocalStorageUtils.getValueFromLocalStorage as jest.Mock
    ).mockResolvedValue({
      '1': {
        [wallet.toLowerCase()]: entry,
      },
    });

    await expect(
      EvmDiscoveryCacheUtils.getDiscoveredNfts('0x1', wallet.toUpperCase()),
    ).resolves.toEqual(entry);
  });

  it('returns null when no matching cache entry exists', async () => {
    (
      LocalStorageUtils.getValueFromLocalStorage as jest.Mock
    ).mockResolvedValue({});

    await expect(
      EvmDiscoveryCacheUtils.getDiscoveredTokens('0x89', wallet),
    ).resolves.toBeNull();
    await expect(
      EvmDiscoveryCacheUtils.getDiscoveredNfts('0x89', wallet),
    ).resolves.toBeNull();
  });
});
