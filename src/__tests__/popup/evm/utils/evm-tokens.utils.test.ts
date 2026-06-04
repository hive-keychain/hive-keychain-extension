import { EvmLightNodeApi } from '@api/evm-light-node';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import {
  EVMSmartContractType,
  EvmSmartContractInfoErc20,
  EvmSmartContractInfoNative,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { UniswapV2RouterAbiMinimal } from '@popup/evm/reference-data/abi-protocol-decode.data';
import { EvmNFTUtils } from '@popup/evm/utils/nft.utils';
import {
  EvmTokensUtils,
  MAIN_TOKEN_LIGHT_NODE_TIMEOUT_MS,
} from '@popup/evm/utils/evm-tokens.utils';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

describe('evm-tokens.utils proxy metadata tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('preserves backend proxy fields on proxy contracts', async () => {
    jest.spyOn(EvmLightNodeApi, 'get').mockResolvedValue({
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
    jest.spyOn(EvmLightNodeApi, 'get').mockResolvedValue({
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
    jest.spyOn(EvmLightNodeApi, 'get').mockResolvedValue({
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

  it('loads native token info from the direct light-node API', async () => {
    jest.spyOn(EvmLightNodeApi, 'get').mockResolvedValue({
      chainId: 1,
      metadata: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        logoUrl: 'https://cdn.example/eth.svg',
        wrappedNativeTokenAddress:
          '0x0000000000000000000000000000000000000001',
      },
      price: {
        fetchedAt: '2026-01-01T00:00:00.000Z',
        priceUsd: 321.09,
      },
    });

    await expect(
      EvmTokensUtils.getMainTokenInfo({ chainId: '0x1' } as any),
    ).resolves.toEqual({
      type: EVMSmartContractType.NATIVE,
      name: 'Ethereum',
      symbol: 'ETH',
      logo: 'https://cdn.example/eth.svg',
      chainId: '0x1',
      backgroundColor: '',
      coingeckoId: '',
      priceUsd: 321.09,
      createdAt: '2026-01-01T00:00:00.000Z',
      categories: [],
    });
    expect(EvmLightNodeApi.get).toHaveBeenCalledWith('native/1');
  });

  it('returns fallback native token info for custom chains', async () => {
    const getSpy = jest.spyOn(EvmLightNodeApi, 'get');

    await expect(
      EvmTokensUtils.getMainTokenInfo({
        chainId: '0x539',
        isCustom: true,
        name: 'Local Chain',
        mainToken: 'ETH',
        nativeCoinId: 'ethereum',
        logo: 'https://cdn.example/eth.svg',
      } as any),
    ).resolves.toEqual({
      type: EVMSmartContractType.NATIVE,
      name: 'Local Chain',
      symbol: 'ETH',
      logo: 'https://cdn.example/eth.svg',
      chainId: '0x539',
      backgroundColor: '',
      coingeckoId: 'ethereum',
      priceUsd: null,
      createdAt: new Date(0).toISOString(),
      categories: [],
    });
    expect(getSpy).not.toHaveBeenCalled();
  });

  describe('getMainTokenInfo light-node fallback', () => {
    const defaultChainFixture = {
      chainId: '0x1',
      name: 'Ethereum',
      mainToken: 'ETH',
      logo: 'https://cdn.example/eth-local.svg',
      nativeCoinId: 'ethereum',
    } as const;

    afterEach(() => {
      jest.useRealTimers();
    });

    it('falls back to local chain metadata when the API rejects', async () => {
      jest.spyOn(EvmLightNodeApi, 'get').mockRejectedValue(new Error('network'));
      const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});

      const chain = { ...defaultChainFixture } as any;
      await expect(EvmTokensUtils.getMainTokenInfo(chain)).resolves.toEqual(
        EvmTokensUtils.buildFallbackNativeTokenInfo(chain),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Native token metadata fetch failed'),
      );
      warnSpy.mockRestore();
    });

    it('falls back when the API resolves undefined (non-200)', async () => {
      jest.spyOn(EvmLightNodeApi, 'get').mockResolvedValue(undefined);
      const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});

      const chain = { ...defaultChainFixture } as any;
      await expect(EvmTokensUtils.getMainTokenInfo(chain)).resolves.toEqual(
        EvmTokensUtils.buildFallbackNativeTokenInfo(chain),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('invalid or missing'),
      );
      warnSpy.mockRestore();
    });

    it('falls back when the payload metadata is invalid', async () => {
      jest.spyOn(EvmLightNodeApi, 'get').mockResolvedValue({
        metadata: { name: '', symbol: 'ETH' },
      });
      const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});

      const chain = { ...defaultChainFixture } as any;
      await expect(EvmTokensUtils.getMainTokenInfo(chain)).resolves.toEqual(
        EvmTokensUtils.buildFallbackNativeTokenInfo(chain),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('invalid or missing'),
      );
      warnSpy.mockRestore();
    });

    it('falls back when the light-node request does not settle before timeout', async () => {
      jest.useFakeTimers();
      jest.spyOn(EvmLightNodeApi, 'get').mockImplementation(
        () => new Promise(() => {}),
      );
      const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});

      const chain = { ...defaultChainFixture } as any;
      const resultPromise = EvmTokensUtils.getMainTokenInfo(chain);

      await jest.advanceTimersByTimeAsync(MAIN_TOKEN_LIGHT_NODE_TIMEOUT_MS);

      await expect(resultPromise).resolves.toEqual(
        EvmTokensUtils.buildFallbackNativeTokenInfo(chain),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/main_token_native_fetch_timeout/),
      );
      warnSpy.mockRestore();
    });
  });

  it('detects token type from a serialized abi string', () => {
    expect(EvmTokensUtils.getTokenType(JSON.stringify(Erc20Abi))).toBe(
      EVMSmartContractType.ERC20,
    );
  });

  it('does not classify decode-only protocol ABIs as token types', () => {
    expect(EvmTokensUtils.getTokenType(UniswapV2RouterAbiMinimal)).toBeNull();
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

  it('formats discovery native placeholders as native balances', async () => {
    const walletAddress = '0x1234567890123456789012345678901234567890';
    const getBalance = jest.fn().mockResolvedValue(20888717742830912n);
    jest.spyOn(EthersUtils, 'getProvider').mockResolvedValue({
      getBalance,
    } as any);
    jest.spyOn(EvmLightNodeApi, 'get').mockResolvedValue({
      chainId: 43114,
      metadata: {
        name: 'Avalanche',
        symbol: 'AVAX',
        decimals: 18,
        logoUrl: 'https://cdn.example/avax.svg',
        wrappedNativeTokenAddress:
          '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      },
      price: {
        fetchedAt: '2026-05-19T00:00:00.000Z',
        priceUsd: 25,
      },
    });
    const contractSpy = jest.spyOn(ethers, 'Contract');

    const balances = await EvmTokensUtils.getTokenBalances(
      walletAddress,
      {
        chainId: '43114',
        name: 'Avalanche',
        mainToken: 'AVAX',
      } as any,
      [
        {
          type: EVMSmartContractType.ERC20,
          name: '',
          symbol: '',
          decimals: 0,
          logo: '',
          chainId: '43114',
          contractAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          backgroundColor: '#000000',
          coingeckoId: null,
          priceUsd: null,
          possibleSpam: false,
          verifiedContract: false,
          isProxy: false,
          proxyTarget: null,
          validated: 0,
        } as any,
      ],
    );

    expect(contractSpy).not.toHaveBeenCalled();
    expect(getBalance).toHaveBeenCalledWith(walletAddress);
    expect(balances).toHaveLength(1);
    expect(balances[0].tokenInfo).toMatchObject({
      type: EVMSmartContractType.NATIVE,
      name: 'Avalanche',
      symbol: 'AVAX',
      priceUsd: 25,
    });
    expect(balances[0].balance).toBe(20888717742830912n);
  });

  it('drops failed token balance reads without crashing discovery formatting', async () => {
    const walletAddress = '0x1234567890123456789012345678901234567890';
    const nativeToken = {
      name: 'Ether',
      symbol: 'ETH',
      logo: '',
      chainId: '1',
      backgroundColor: '#000000',
      coingeckoId: '',
      priceUsd: 3000,
      createdAt: '',
      categories: [],
      type: EVMSmartContractType.NATIVE,
    } as EvmSmartContractInfoNative;
    const erc20Token = {
      name: 'Broken Token',
      symbol: 'BAD',
      decimals: 18,
      logo: '',
      chainId: '1',
      contractAddress: '0x00000000000000000000000000000000000000aa',
      backgroundColor: '#000000',
      coingeckoId: '',
      priceUsd: 0,
      possibleSpam: false,
      verifiedContract: true,
      isProxy: false,
      proxyTarget: null,
      validated: 0,
      type: EVMSmartContractType.ERC20,
    } as EvmSmartContractInfoErc20;

    jest.spyOn(EthersUtils, 'getProvider').mockResolvedValue({
      getBalance: jest.fn().mockResolvedValue(1234567891234567890n),
    } as any);
    jest.spyOn(ethers, 'Contract').mockImplementation(
      () =>
        ({
          balanceOf: jest.fn().mockRejectedValue(new Error('BAD_DATA')),
        }) as any,
    );
    const errorSpy = jest.spyOn(Logger, 'error').mockImplementation(() => {});

    const balances = await EvmTokensUtils.getTokenBalances(
      walletAddress,
      { chainId: '1' } as any,
      [nativeToken, erc20Token],
    );

    expect(errorSpy).toHaveBeenCalledWith(
      'Error while formatting evm balances',
      expect.any(Error),
    );
    expect(balances).toHaveLength(1);
    expect(balances[0].tokenInfo.type).toBe(EVMSmartContractType.NATIVE);
  });

  it('includes the estimated gas fee in mainBalance for native transfers', async () => {
    const nativeToken = {
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
    } as EvmSmartContractInfoNative;

    jest.spyOn(EvmTokensUtils, 'getTokenBalance').mockResolvedValue({
      balance: 5n,
      balanceInteger: 5,
      formattedBalance: '5',
      shortFormattedBalance: '5',
      tokenInfo: nativeToken,
    } as any);

    const balanceInfo = await EvmTokensUtils.getBalanceInfo(
      '0x1234567890123456789012345678901234567890',
      { chainId: '1' } as any,
      nativeToken,
      1,
      { estimatedFeeInEth: new Decimal('0.1') } as any,
    );

    expect(balanceInfo).toEqual({
      mainBalance: {
        symbol: 'ETH',
        before: '5 ETH',
        estimatedAfter: '3.9  ETH',
        insufficientBalance: false,
      },
    });
  });

  it('adds a feeBalance row for ERC20 transfers when a gas fee is selected', async () => {
    const nativeToken = {
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
    } as EvmSmartContractInfoNative;
    const erc20Token = {
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
      type: EVMSmartContractType.ERC20,
    } as EvmSmartContractInfoErc20;

    jest
      .spyOn(EvmTokensUtils, 'getTokenBalance')
      .mockImplementation(async (_walletAddress, _chain, token) => {
        if (token.type === EVMSmartContractType.NATIVE) {
          return {
            balance: 1n,
            balanceInteger: 1,
            formattedBalance: '1',
            shortFormattedBalance: '1',
            tokenInfo: nativeToken,
          } as any;
        }

        return {
          balance: 100n,
          balanceInteger: 100,
          formattedBalance: '100',
          shortFormattedBalance: '100',
          tokenInfo: erc20Token,
        } as any;
      });
    jest.spyOn(EvmTokensUtils, 'getMainTokenInfo').mockResolvedValue(nativeToken);

    const balanceInfo = await EvmTokensUtils.getBalanceInfo(
      '0x1234567890123456789012345678901234567890',
      { chainId: '1' } as any,
      erc20Token,
      25,
      { estimatedFeeInEth: new Decimal('0.1') } as any,
    );

    expect(balanceInfo).toEqual({
      mainBalance: {
        symbol: 'USDC',
        before: '100 USDC',
        estimatedAfter: '75  USDC',
        insufficientBalance: false,
      },
      feeBalance: {
        symbol: 'ETH',
        before: '1 ETH',
        estimatedAfter: '0.9  ETH',
        insufficientBalance: false,
      },
    });
  });

  it('marks the balance as insufficient when the selected gas fee exceeds the native balance', async () => {
    const nativeToken = {
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
    } as EvmSmartContractInfoNative;
    const erc20Token = {
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
      type: EVMSmartContractType.ERC20,
    } as EvmSmartContractInfoErc20;

    jest
      .spyOn(EvmTokensUtils, 'getTokenBalance')
      .mockImplementation(async (_walletAddress, _chain, token) => {
        if (token.type === EVMSmartContractType.NATIVE) {
          return {
            balance: 0n,
            balanceInteger: 0.05,
            formattedBalance: '0.05',
            shortFormattedBalance: '0.05',
            tokenInfo: nativeToken,
          } as any;
        }

        return {
          balance: 100n,
          balanceInteger: 100,
          formattedBalance: '100',
          shortFormattedBalance: '100',
          tokenInfo: erc20Token,
        } as any;
      });
    jest.spyOn(EvmTokensUtils, 'getMainTokenInfo').mockResolvedValue(nativeToken);

    const balanceInfo = await EvmTokensUtils.getBalanceInfo(
      '0x1234567890123456789012345678901234567890',
      { chainId: '1' } as any,
      erc20Token,
      25,
      { estimatedFeeInEth: new Decimal('0.1') } as any,
    );

    expect(balanceInfo.feeBalance?.insufficientBalance).toBe(true);
    expect(balanceInfo.mainBalance.insufficientBalance).toBe(false);
  });

  it('persists normalized custom ERC20 tokens with metadata', async () => {
    let storageValue: any;
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async () => storageValue);
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (_key, value) => {
        storageValue = value;
      });
    jest
      .spyOn(EvmLightNodeUtils, 'getCoingeckoTokenId')
      .mockResolvedValue('usd-coin');

    const chain = {
      type: ChainType.EVM,
      chainId: '0x1',
    } as any;
    const walletAddress = '0x1111111111111111111111111111111111111111';

    await EvmTokensUtils.addCustomToken(chain, walletAddress, {
      address: '0x00000000000000000000000000000000000000aa',
      type: EVMSmartContractType.ERC20,
      metadata: {
        type: EVMSmartContractType.ERC20,
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        logo: 'https://cdn.example/usdc.svg',
      },
    });
    await EvmTokensUtils.addCustomToken(
      chain,
      '0x2222222222222222222222222222222222222222',
      {
        address: '0x00000000000000000000000000000000000000AA',
        type: EVMSmartContractType.ERC20,
        metadata: {
          type: EVMSmartContractType.ERC20,
          name: 'USD Coin',
          symbol: 'USDC',
          decimals: 6,
          logo: 'https://cdn.example/usdc.svg',
        },
      },
    );

    expect(storageValue).toEqual({
      '0x1': [
        {
          address: '0x00000000000000000000000000000000000000AA',
          type: EVMSmartContractType.ERC20,
          metadata: {
            type: EVMSmartContractType.ERC20,
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            logo: 'https://cdn.example/usdc.svg',
            coingeckoId: 'usd-coin',
          },
        },
      ],
    });

    const savedTokens = await EvmTokensUtils.getCustomTokens(
      chain,
      '0x2222222222222222222222222222222222222222',
    );

    expect(savedTokens).toEqual([
      {
        address: '0x00000000000000000000000000000000000000AA',
        type: EVMSmartContractType.ERC20,
        metadata: {
          type: EVMSmartContractType.ERC20,
          name: 'USD Coin',
          symbol: 'USDC',
          decimals: 6,
          logo: 'https://cdn.example/usdc.svg',
          coingeckoId: 'usd-coin',
        },
      },
    ]);
  });

  it('updates custom ERC20 metadata with a resolved Coingecko id and preserves the stored id on failure', async () => {
    let storageValue: any = {
      '0x1': [
        {
          address: '0x00000000000000000000000000000000000000AA',
          type: EVMSmartContractType.ERC20,
          metadata: {
            type: EVMSmartContractType.ERC20,
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            logo: 'https://cdn.example/usdc.svg',
            coingeckoId: 'usd-coin',
          },
        },
      ],
    };
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async () => storageValue);
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (_key, value) => {
        storageValue = value;
      });

    const chain = {
      type: ChainType.EVM,
      chainId: '0x1',
    } as any;
    const walletAddress = '0x1111111111111111111111111111111111111111';

    jest
      .spyOn(EvmLightNodeUtils, 'getCoingeckoTokenId')
      .mockResolvedValueOnce('dai');

    await EvmTokensUtils.updateCustomToken(
      chain,
      walletAddress,
      '0x00000000000000000000000000000000000000aa',
      EVMSmartContractType.ERC20,
      {
        type: EVMSmartContractType.ERC20,
        name: 'Dai Stablecoin',
        symbol: 'DAI',
        decimals: 18,
        logo: 'https://cdn.example/dai.svg',
      },
    );

    expect(storageValue['0x1'][0].metadata).toEqual({
      type: EVMSmartContractType.ERC20,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      decimals: 18,
      logo: 'https://cdn.example/dai.svg',
      coingeckoId: 'dai',
    });

    (EvmLightNodeUtils.getCoingeckoTokenId as jest.Mock).mockRejectedValueOnce(
      new Error('offline'),
    );

    await EvmTokensUtils.updateCustomToken(
      chain,
      walletAddress,
      '0x00000000000000000000000000000000000000aa',
      EVMSmartContractType.ERC20,
      {
        type: EVMSmartContractType.ERC20,
        name: 'Dai Stablecoin',
        symbol: 'DAI',
        decimals: 18,
        logo: 'https://cdn.example/dai.svg',
      },
    );

    expect(storageValue['0x1'][0].metadata.coingeckoId).toBe('dai');

    await EvmTokensUtils.removeCustomToken(
      chain,
      '0x2222222222222222222222222222222222222222',
      '0x00000000000000000000000000000000000000aa',
      EVMSmartContractType.ERC20,
    );

    expect(await EvmTokensUtils.getCustomTokens(chain, walletAddress)).toEqual(
      [],
    );
  });

  it('skips Coingecko lookup for batch custom token saves', async () => {
    let storageValue: any;
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async () => storageValue);
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (_key, value) => {
        storageValue = value;
      });
    const coingeckoSpy = jest.spyOn(EvmLightNodeUtils, 'getCoingeckoTokenId');

    const chain = {
      type: ChainType.EVM,
      chainId: '0x1',
    } as any;
    const walletAddress = '0x1111111111111111111111111111111111111111';

    await EvmTokensUtils.addCustomToken(
      chain,
      walletAddress,
      [
        {
          address: '0x00000000000000000000000000000000000000aa',
          type: EVMSmartContractType.ERC20,
        },
      ],
      true,
    );

    expect(coingeckoSpy).not.toHaveBeenCalled();
  });

  it('exposes stored Coingecko ids on custom ERC20 token infos', async () => {
    jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue({
      '0x1': [
        {
          address: '0x00000000000000000000000000000000000000aa',
          type: EVMSmartContractType.ERC20,
          metadata: {
            type: EVMSmartContractType.ERC20,
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            logo: 'https://cdn.example/usdc.svg',
            coingeckoId: 'usd-coin',
          },
        },
      ],
    });

    await expect(
      EvmTokensUtils.getCustomErc20TokenInfos(
        {
          type: ChainType.EVM,
          chainId: '0x1',
        } as any,
        '0x1111111111111111111111111111111111111111',
      ),
    ).resolves.toEqual([
      expect.objectContaining({
        contractAddress: '0x00000000000000000000000000000000000000AA',
        coingeckoId: 'usd-coin',
      }),
    ]);
  });

  it('normalizes legacy erc20-nested metadata when reading from storage', async () => {
    jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue({
      '0x1': [
        {
          address: '0x00000000000000000000000000000000000000aa',
          type: EVMSmartContractType.ERC20,
          metadata: {
            erc20: {
              name: 'Legacy',
              symbol: 'LEG',
              decimals: 18,
              logo: '',
            },
          },
        },
      ],
    });

    const chain = {
      type: ChainType.EVM,
      chainId: '0x1',
    } as any;
    const walletAddress = '0x1111111111111111111111111111111111111111';

    const tokens = await EvmTokensUtils.getCustomTokens(chain, walletAddress);
    expect(tokens[0].metadata).toEqual({
      type: EVMSmartContractType.ERC20,
      name: 'Legacy',
      symbol: 'LEG',
      decimals: 18,
      logo: '',
    });
  });

  it('persists normalized custom NFTs with deduplicated token IDs', async () => {
    let storageValue: any;
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async () => storageValue);
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (_key, value) => {
        storageValue = value;
      });

    const chain = {
      type: ChainType.EVM,
      chainId: '0x1',
    } as any;
    const walletAddress = '0x1111111111111111111111111111111111111111';

    await EvmTokensUtils.addCustomNft(chain, walletAddress, {
      address: '0x00000000000000000000000000000000000000aa',
      type: EVMSmartContractType.ERC721,
      tokenIds: ['1', '0x2', '2'],
    });

    const savedNfts = await EvmTokensUtils.getCustomNfts(
      chain,
      walletAddress.toUpperCase(),
    );

    expect(savedNfts).toEqual([
      {
        address: '0x00000000000000000000000000000000000000AA',
        type: EVMSmartContractType.ERC721,
        tokenIds: ['1', '2'],
      },
    ]);
  });

  it('updates and removes saved custom NFT entries', async () => {
    let storageValue: any;
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async () => storageValue);
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (_key, value) => {
        storageValue = value;
      });

    const chain = {
      type: ChainType.EVM,
      chainId: '0x1',
    } as any;
    const walletAddress = '0x1111111111111111111111111111111111111111';

    await EvmTokensUtils.addCustomNft(chain, walletAddress, {
      address: '0x00000000000000000000000000000000000000aa',
      type: EVMSmartContractType.ERC721,
      tokenIds: ['1'],
    });
    await EvmTokensUtils.updateCustomNft(
      chain,
      walletAddress,
      '0x00000000000000000000000000000000000000aa',
      EVMSmartContractType.ERC721,
      ['3', '4'],
    );

    expect(await EvmTokensUtils.getCustomNfts(chain, walletAddress)).toEqual([
      {
        address: '0x00000000000000000000000000000000000000AA',
        type: EVMSmartContractType.ERC721,
        tokenIds: ['3', '4'],
      },
    ]);

    await EvmTokensUtils.removeCustomNft(
      chain,
      walletAddress,
      '0x00000000000000000000000000000000000000aa',
      EVMSmartContractType.ERC721,
    );

    expect(await EvmTokensUtils.getCustomNfts(chain, walletAddress)).toEqual(
      [],
    );
  });

  it('builds custom NFT collections from owned token IDs only', async () => {
    jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue({
      '0x1': {
        '0x1111111111111111111111111111111111111111': [
          {
            address: '0x00000000000000000000000000000000000000aa',
            type: EVMSmartContractType.ERC721,
            tokenIds: ['1', '2'],
          },
        ],
      },
    });
    jest.spyOn(EthersUtils, 'getProvider').mockResolvedValue({} as any);
    jest.spyOn(EvmNFTUtils, 'getMetadata').mockImplementation(
      async (_type, tokenId) =>
        ({
          name: `NFT #${tokenId}`,
          description: '',
          image: `https://cdn.example/${tokenId}.png`,
          attributes: [],
        }) as any,
    );
    jest.spyOn(ethers, 'Contract').mockImplementation(
      () =>
        ({
          name: jest.fn().mockResolvedValue('Custom Collection'),
          symbol: jest.fn().mockResolvedValue('CNFT'),
          ownerOf: jest.fn().mockImplementation((tokenId: string) =>
            tokenId === '1'
              ? '0x1111111111111111111111111111111111111111'
              : '0x2222222222222222222222222222222222222222',
          ),
          tokenURI: jest.fn(),
          balanceOf: jest.fn().mockResolvedValue(1n),
          uri: jest.fn(),
        }) as any,
    );

    const collections = await EvmTokensUtils.getCustomNftCollectionsForWallet(
      {
        type: ChainType.EVM,
        chainId: '0x1',
      } as any,
      '0x1111111111111111111111111111111111111111',
    );

    expect(collections).toHaveLength(1);
    expect(collections[0].collection).toEqual([
      {
        id: '1',
        metadata: {
          name: 'NFT #1',
          description: '',
          image: 'https://cdn.example/1.png',
          attributes: [],
        },
      },
    ]);
  });
});
