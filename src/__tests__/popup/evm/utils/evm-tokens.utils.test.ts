import { KeychainApi } from '@api/keychain';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import {
  EVMSmartContractType,
  EvmSmartContractInfoErc20,
  EvmSmartContractInfoNative,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { ethers } from 'ethers';

describe('evm-tokens.utils proxy metadata tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('preserves backend proxy fields on proxy contracts', async () => {
    jest.spyOn(KeychainApi, 'get').mockResolvedValue({
      abi: [],
      address: '0x00000000000000000000000000000000000000aa',
      chainId: 1,
      contractType: 'ERC20',
      firstSeenBlock: 1,
      id: 1,
      isProxy: true,
      lastSeenBlock: null,
      metadata: {
        coingeckoId: 'usd-coin',
        decimals: 6,
        logoUrl: 'logo',
        name: 'USD Coin',
        symbol: 'USDC',
      },
      possibleSpam: false,
      price: { fetchedAt: '2026-01-01T00:00:00.000Z', priceUsd: 1 },
      proxyTarget: '0x00000000000000000000000000000000000000bb',
      verified: true,
    });

    const tokenInfo = (await EvmTokensUtils.getTokenInfo(
      '1',
      '0x00000000000000000000000000000000000000aa',
    )) as EvmSmartContractInfoErc20;

    expect(tokenInfo.type).toBe(EVMSmartContractType.ERC20);
    expect(tokenInfo.isProxy).toBe(true);
    expect(tokenInfo.proxyTarget).toBe(
      '0x00000000000000000000000000000000000000bb',
    );
  });

  it('defaults proxy fields for non-proxy contracts', async () => {
    jest.spyOn(KeychainApi, 'get').mockResolvedValue({
      abi: [],
      address: '0x00000000000000000000000000000000000000cc',
      chainId: 1,
      contractType: 'ERC20',
      firstSeenBlock: 1,
      id: 2,
      isProxy: false,
      lastSeenBlock: null,
      metadata: {
        coingeckoId: 'dai',
        decimals: 18,
        logoUrl: 'logo',
        name: 'Dai',
        symbol: 'DAI',
      },
      possibleSpam: false,
      price: { fetchedAt: '2026-01-01T00:00:00.000Z', priceUsd: 1 },
      proxyTarget: null,
      verified: true,
    });

    const tokenInfo = (await EvmTokensUtils.getTokenInfo(
      '1',
      '0x00000000000000000000000000000000000000cc',
    )) as EvmSmartContractInfoErc20;

    expect(tokenInfo.isProxy).toBe(false);
    expect(tokenInfo.proxyTarget).toBeNull();
  });

  it('normalizes structured proxy target payloads on token info responses', async () => {
    jest.spyOn(KeychainApi, 'get').mockResolvedValue({
      abi: [],
      address: '0x00000000000000000000000000000000000000aa',
      chainId: 1,
      contractType: 'ERC20',
      firstSeenBlock: 1,
      id: 3,
      isProxy: true,
      lastSeenBlock: null,
      metadata: {
        coingeckoId: 'usd-coin',
        decimals: 6,
        logoUrl: 'logo',
        name: 'USD Coin',
        symbol: 'USDC',
      },
      possibleSpam: false,
      price: { fetchedAt: '2026-01-01T00:00:00.000Z', priceUsd: 1 },
      proxyTarget: {
        target: '0x00000000000000000000000000000000000000bb',
      },
      verified: true,
    });

    const tokenInfo = (await EvmTokensUtils.getTokenInfo(
      '1',
      '0x00000000000000000000000000000000000000aa',
    )) as EvmSmartContractInfoErc20;

    expect(tokenInfo.isProxy).toBe(true);
    expect(tokenInfo.proxyTarget).toBe(
      '0x00000000000000000000000000000000000000bb',
    );
  });

  it('detects token type from a serialized abi string', () => {
    expect(EvmTokensUtils.getTokenType(JSON.stringify(Erc20Abi))).toBe(
      EVMSmartContractType.ERC20,
    );
  });

  it('formats native short balances with up to 5 decimals', async () => {
    jest.spyOn(EthersUtils, 'getProvider').mockResolvedValue({
      getBalance: jest.fn().mockResolvedValue(1234567891234567890n),
    } as any);

    const balance = await EvmTokensUtils.getTokenBalance(
      '0x1234567890123456789012345678901234567890',
      { chainId: '1' } as any,
      {
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
      } as EvmSmartContractInfoNative,
    );

    expect(balance?.shortFormattedBalance).toBe('1.23457');
  });

  it('formats ERC20 short balances with up to 5 decimals', async () => {
    jest.spyOn(EthersUtils, 'getProvider').mockResolvedValue({} as any);
    jest.spyOn(ethers, 'Contract').mockImplementation(
      () =>
        ({
          balanceOf: jest.fn().mockResolvedValue(1234567n),
        }) as any,
    );

    const balance = await EvmTokensUtils.getTokenBalance(
      '0x1234567890123456789012345678901234567890',
      { chainId: '1' } as any,
      {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        logo: '',
        chainId: '1',
        contractAddress: '0x00000000000000000000000000000000000000aa',
        backgroundColor: '#000000',
        coingeckoId: 'usd-coin',
        priceUsd: 1,
        possibleSpam: false,
        verifiedContract: true,
        isProxy: false,
        proxyTarget: null,
        createdAt: '',
        categories: [],
        type: EVMSmartContractType.ERC20,
      } as EvmSmartContractInfoErc20,
    );

    expect(balance?.shortFormattedBalance).toBe('1.23457');
  });
});
