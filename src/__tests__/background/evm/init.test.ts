import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { initEvmRequestHandler } from '@background/evm/requests/init';

const requestAddCustomEvmChainMock = jest.fn();
const handleNonSupportedChainMock = jest.fn();
const handleEvmErrorMock = jest.fn();
const evmRequestWithConfirmationMock = jest.fn();
const evmRequestWithoutConfirmationMock = jest.fn();
const isChainWhitelistedForOriginMock = jest.fn();

const createDeferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

jest.mock('@background/evm/evm-methods/evm-deprecated-methods.list', () => ({
  EvmDeprecatedMethods: [],
}));

jest.mock('@background/evm/requests/logic/request-add-custom-evm-chain.logic', () => ({
  requestAddCustomEvmChain: (...args: any[]) =>
    requestAddCustomEvmChainMock(...args),
}));

jest.mock('@background/evm/requests/logic/handle-non-supported-chain.logic', () => ({
  handleNonSupportedChain: (...args: any[]) =>
    handleNonSupportedChainMock(...args),
}));

jest.mock('@background/evm/requests/logic/request-add-evm-chain.logic', () => ({
  requestAddEvmChain: jest.fn(),
}));

jest.mock('@background/evm/requests/logic/evm-request-with-confirmation.logic', () => ({
  evmRequestWithConfirmation: (...args: any[]) =>
    evmRequestWithConfirmationMock(...args),
}));

jest.mock('@background/evm/requests/logic/evm-request-without-confirmation.logic', () => ({
  evmRequestWithoutConfirmation: (...args: any[]) =>
    evmRequestWithoutConfirmationMock(...args),
}));

jest.mock('@background/evm/requests/logic/handle-deprecated-methods.logic', () => ({
  handleDeprecatedMethods: jest.fn(),
}));

jest.mock('@background/evm/requests/logic/handle-evm-error.logic', () => ({
  handleEvmError: (...args: any[]) => handleEvmErrorMock(...args),
}));

jest.mock('@background/evm/requests/logic/handle-non-existing-methods.logic', () => ({
  handleNonExistingMethod: jest.fn(),
}));

jest.mock('src/background/evm/evm-provider-state.utils', () => ({
  isChainWhitelistedForOrigin: (...args: any[]) =>
    isChainWhitelistedForOriginMock(...args),
}));

jest.mock('@background/hive/modules/mk.module', () => ({
  __esModule: true,
  default: {
    getMk: jest.fn(),
  },
}));

jest.mock('@background/hive/requests/logic', () => ({
  initializeWallet: jest.fn(),
  unlockWallet: jest.fn(),
}));

jest.mock('@popup/evm/utils/evm-chain.utils', () => ({
  EvmChainUtils: {
    getLastEvmChainIdForOrigin: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/wallet.utils', () => ({
  EvmWalletUtils: {
    rebuildAccountsFromLocalStorage: jest.fn(),
    hasPermission: jest.fn(),
  },
}));

jest.mock('@popup/multichain/utils/chain.utils', () => ({
  ChainUtils: {
    getDefaultChains: jest.fn(),
    getAllSetupChainsForType: jest.fn(),
  },
}));

jest.mock('src/utils/dapp-request.utils', () => ({
  DappRequestUtils: {
    isDappLocked: jest.fn(),
  },
}));

jest.mock('src/utils/localStorage.utils', () => ({
  __esModule: true,
  default: {
    getValueFromLocalStorage: jest.fn(),
  },
}));

describe('initEvmRequestHandler', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    const { ChainUtils } = await import('@popup/multichain/utils/chain.utils');
    const { EvmChainUtils } = await import('@popup/evm/utils/evm-chain.utils');
    (ChainUtils.getDefaultChains as jest.Mock).mockResolvedValue([]);
    (ChainUtils.getAllSetupChainsForType as jest.Mock).mockResolvedValue([]);
    (EvmChainUtils.getLastEvmChainIdForOrigin as jest.Mock).mockResolvedValue(
      undefined,
    );
    handleEvmErrorMock.mockResolvedValue(undefined);
    evmRequestWithConfirmationMock.mockResolvedValue(undefined);
    evmRequestWithoutConfirmationMock.mockResolvedValue(undefined);
    isChainWhitelistedForOriginMock.mockResolvedValue(false);
  });

  it('rejects requests when the provided chainId differs from the current provider chainId', async () => {
    const { EvmChainUtils } = await import('@popup/evm/utils/evm-chain.utils');
    const { ChainUtils } = await import('@popup/multichain/utils/chain.utils');
    (EvmChainUtils.getLastEvmChainIdForOrigin as jest.Mock).mockResolvedValue(
      '0x1',
    );

    const request = {
      request_id: 41,
      method: EvmRequestMethod.GET_CHAIN,
      params: [],
      chainId: '0x539',
    } as any;
    const dappInfo = {
      origin: 'https://example.app',
      domain: 'example.app',
      protocol: 'https:',
      logo: '',
    };
    const requestHandler = {
      accounts: [],
      saveInLocalStorage: jest.fn(),
      removeRequestByLocator: jest.fn(),
    } as any;

    await initEvmRequestHandler(request, 7, dappInfo, requestHandler);

    expect(handleEvmErrorMock).toHaveBeenCalledWith(
      requestHandler,
      7,
      request,
      {
        code: -32602,
        message: 'chainId should be same as current chainId',
      },
      'chainId should be same as current chainId',
      [],
      'https://example.app',
      true,
    );
    expect(ChainUtils.getDefaultChains).not.toHaveBeenCalled();
    expect(evmRequestWithConfirmationMock).not.toHaveBeenCalled();
    expect(evmRequestWithoutConfirmationMock).not.toHaveBeenCalled();
  });

  it('rejects transfer requests when params chainId differs from the current provider chainId', async () => {
    const { ChainUtils } = await import('@popup/multichain/utils/chain.utils');

    const request = {
      request_id: 42,
      method: EvmRequestMethod.SEND_TRANSACTION,
      params: [
        {
          from: '0x0000000000000000000000000000000000000001',
          to: '0x0000000000000000000000000000000000000002',
          value: '0x1',
          chainId: '0x1',
        },
      ],
      chainId: '0xaa36a7',
    } as any;
    const dappInfo = {
      origin: 'https://example.app',
      domain: 'example.app',
      protocol: 'https:',
      logo: '',
    };
    const requestHandler = {
      accounts: [],
      saveInLocalStorage: jest.fn(),
      removeRequestByLocator: jest.fn(),
    } as any;

    await initEvmRequestHandler(request, 7, dappInfo, requestHandler);

    expect(handleEvmErrorMock).toHaveBeenCalledWith(
      requestHandler,
      7,
      request,
      {
        code: -32602,
        message: 'chainId should be same as current chainId',
      },
      'chainId should be same as current chainId',
      [],
      'https://example.app',
      true,
    );
    expect(ChainUtils.getDefaultChains).not.toHaveBeenCalled();
    expect(evmRequestWithConfirmationMock).not.toHaveBeenCalled();
    expect(evmRequestWithoutConfirmationMock).not.toHaveBeenCalled();
  });

  it('rejects unsupported wallet_switchEthereumChain requests without opening the custom chain dialog', async () => {
    const request = {
      request_id: 42,
      method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
      params: [{ chainId: '0x539' }],
      chainId: '0x1',
    } as any;
    const dappInfo = {
      origin: 'https://example.app',
      domain: 'example.app',
      protocol: 'https:',
      logo: '',
    };
    const requestHandler = {
      accounts: [],
      saveInLocalStorage: jest.fn(),
    } as any;

    await initEvmRequestHandler(request, 7, dappInfo, requestHandler);

    expect(requestAddCustomEvmChainMock).not.toHaveBeenCalled();
    expect(handleNonSupportedChainMock).not.toHaveBeenCalled();
    expect(handleEvmErrorMock).toHaveBeenCalledWith(
      requestHandler,
      7,
      request,
      {
        code: 4902,
        message:
          'Unrecognized chain ID "0x539". Try adding the chain using wallet_addEthereumChain first.',
      },
      'Unrecognized chain ID "0x539". Try adding the chain using wallet_addEthereumChain first.',
      [],
      'https://example.app',
      true,
    );
  });

  it('does not use dapp-provided RPC fields on unsupported wallet_switchEthereumChain requests', async () => {
    const request = {
      request_id: 42,
      method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
      params: [
        {
          chainId: '0x14a34',
          rpcUrls: ['https://sepolia.base.org'],
          chainName: 'Base Sepolia',
        },
      ],
      chainId: '0x1',
    } as any;
    const dappInfo = {
      origin: 'https://example.app',
      domain: 'example.app',
      protocol: 'https:',
      logo: '',
    };
    const requestHandler = {
      accounts: [],
      saveInLocalStorage: jest.fn(),
    } as any;

    await initEvmRequestHandler(request, 7, dappInfo, requestHandler);

    expect(requestAddCustomEvmChainMock).not.toHaveBeenCalled();
    expect(handleNonSupportedChainMock).not.toHaveBeenCalled();
    expect(evmRequestWithConfirmationMock).not.toHaveBeenCalled();
    expect(evmRequestWithoutConfirmationMock).not.toHaveBeenCalled();
    expect(requestHandler.saveInLocalStorage).not.toHaveBeenCalled();
    expect(handleEvmErrorMock).toHaveBeenCalledWith(
      expect.anything(),
      7,
      request,
      expect.objectContaining({
        code: 4902,
        message:
          'Unrecognized chain ID "0x14a34". Try adding the chain using wallet_addEthereumChain first.',
      }),
      expect.any(String),
      [],
      'https://example.app',
      true,
    );
  });

  it('rejects wallet_switchEthereumChain for a default chain that is not setup', async () => {
    const { ChainUtils } = await import('@popup/multichain/utils/chain.utils');
    (ChainUtils.getDefaultChains as jest.Mock).mockResolvedValue([
      {
        chainId: '0x2105',
        type: 'EVM',
        name: 'Base',
      },
    ]);
    (ChainUtils.getAllSetupChainsForType as jest.Mock).mockResolvedValue([]);

    const request = {
      request_id: 43,
      method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
      params: [{ chainId: '0x2105' }],
      chainId: '0x1',
    } as any;
    const dappInfo = {
      origin: 'https://example.app',
      domain: 'example.app',
      protocol: 'https:',
      logo: '',
    };
    const requestHandler = {
      accounts: [],
      saveInLocalStorage: jest.fn(),
    } as any;

    await initEvmRequestHandler(request, 7, dappInfo, requestHandler);

    expect(requestAddCustomEvmChainMock).not.toHaveBeenCalled();
    expect(handleNonSupportedChainMock).not.toHaveBeenCalled();
    expect(evmRequestWithConfirmationMock).not.toHaveBeenCalled();
    expect(evmRequestWithoutConfirmationMock).not.toHaveBeenCalled();
    expect(handleEvmErrorMock).toHaveBeenCalledWith(
      requestHandler,
      7,
      request,
      {
        code: 4902,
        message:
          'Unrecognized chain ID "0x2105". Try adding the chain using wallet_addEthereumChain first.',
      },
      'Unrecognized chain ID "0x2105". Try adding the chain using wallet_addEthereumChain first.',
      [],
      'https://example.app',
      true,
    );
  });

  it('opens confirmation for wallet_addEthereumChain when the requested chain is not configured', async () => {
    const MkModule = (await import('@background/hive/modules/mk.module'))
      .default;
    const LocalStorageUtils = (await import('src/utils/localStorage.utils'))
      .default;
    const { EvmWalletUtils } = await import('@popup/evm/utils/wallet.utils');
    (MkModule.getMk as jest.Mock).mockResolvedValue('mk');
    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue([
      { address: '0xabc123' },
    ]);
    (EvmWalletUtils.rebuildAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      [],
    );

    const request = {
      request_id: 43,
      method: EvmRequestMethod.WALLET_ADD_ETH_CHAIN,
      params: [
        {
          chainId: '0x14a34',
          chainName: 'Base Sepolia',
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://sepolia.base.org'],
          blockExplorerUrls: ['https://sepolia.basescan.org'],
        },
      ],
      chainId: '0x1',
    } as any;
    const dappInfo = {
      origin: 'https://example.app',
      domain: 'example.app',
      protocol: 'https:',
      logo: '',
    };
    const requestHandler = {
      accounts: [],
      saveInLocalStorage: jest.fn(),
    } as any;

    await initEvmRequestHandler(request, 7, dappInfo, requestHandler);

    expect(handleNonSupportedChainMock).not.toHaveBeenCalled();
    expect(requestAddCustomEvmChainMock).not.toHaveBeenCalled();
    expect(evmRequestWithConfirmationMock).toHaveBeenCalledWith(
      requestHandler,
      7,
      request,
      dappInfo,
    );
  });

  it('opens confirmation for a configured custom chain not whitelisted for the origin', async () => {
    const { ChainUtils } = await import('@popup/multichain/utils/chain.utils');
    (ChainUtils.getDefaultChains as jest.Mock).mockResolvedValue([
      {
        chainId: '0x1',
        type: 'EVM',
        name: 'Ethereum',
      },
    ]);
    (ChainUtils.getAllSetupChainsForType as jest.Mock).mockResolvedValue([
      {
        chainId: '0x539',
        type: 'EVM',
        name: 'Local Custom Chain',
      },
    ]);

    const request = {
      request_id: 43,
      method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
      params: [{ chainId: '0x539' }],
      chainId: '0x1',
    } as any;
    const dappInfo = {
      origin: 'https://example.app',
      domain: 'example.app',
      protocol: 'https:',
      logo: '',
    };
    const requestHandler = {
      accounts: [],
      saveInLocalStorage: jest.fn(),
    } as any;

    await initEvmRequestHandler(request, 7, dappInfo, requestHandler);

    expect(requestAddCustomEvmChainMock).not.toHaveBeenCalled();
    expect(handleNonSupportedChainMock).not.toHaveBeenCalled();
    expect(isChainWhitelistedForOriginMock).toHaveBeenCalledWith(
      'https://example.app',
      '0x539',
    );
    expect(evmRequestWithConfirmationMock).toHaveBeenCalledWith(
      requestHandler,
      7,
      request,
      dappInfo,
    );
  });

  it('accepts wallet_switchEthereumChain silently for a whitelisted configured custom chain', async () => {
    const { ChainUtils } = await import('@popup/multichain/utils/chain.utils');
    (ChainUtils.getDefaultChains as jest.Mock).mockResolvedValue([
      {
        chainId: '0x1',
        type: 'EVM',
        name: 'Ethereum',
      },
    ]);
    (ChainUtils.getAllSetupChainsForType as jest.Mock).mockResolvedValue([
      {
        chainId: '0x539',
        type: 'EVM',
        name: 'Local Custom Chain',
      },
    ]);
    isChainWhitelistedForOriginMock.mockResolvedValue(true);

    const request = {
      request_id: 43,
      method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
      params: [{ chainId: '0x539' }],
      chainId: '0x1',
    } as any;
    const dappInfo = {
      origin: 'https://example.app',
      domain: 'example.app',
      protocol: 'https:',
      logo: '',
    };
    const requestHandler = {
      accounts: [],
      saveInLocalStorage: jest.fn(),
    } as any;

    await initEvmRequestHandler(request, 7, dappInfo, requestHandler);

    expect(evmRequestWithoutConfirmationMock).toHaveBeenCalledWith(
      requestHandler,
      7,
      request,
      dappInfo,
    );
    expect(evmRequestWithConfirmationMock).not.toHaveBeenCalled();
  });

  it('awaits the silent eth_requestAccounts response when permission already exists', async () => {
    const cleanup = createDeferred();
    const MkModule = (await import('@background/hive/modules/mk.module'))
      .default;
    const { EvmWalletUtils } = await import('@popup/evm/utils/wallet.utils');
    const LocalStorageUtils = (await import('src/utils/localStorage.utils'))
      .default;
    (MkModule.getMk as jest.Mock).mockResolvedValue('mk');
    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue([
      { address: '0xabc123' },
    ]);
    (EvmWalletUtils.rebuildAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      [],
    );
    (EvmWalletUtils.hasPermission as jest.Mock).mockResolvedValue(true);
    evmRequestWithoutConfirmationMock.mockReturnValue(cleanup.promise);

    const request = {
      request_id: 44,
      method: EvmRequestMethod.REQUEST_ACCOUNTS,
      params: [],
    } as any;
    const dappInfo = {
      origin: 'https://example.app',
      domain: 'example.app',
      protocol: 'https:',
      logo: '',
    };
    const requestHandler = {
      accounts: [],
      saveInLocalStorage: jest.fn(),
    } as any;

    let settled = false;
    const result = initEvmRequestHandler(
      request,
      7,
      dappInfo,
      requestHandler,
    ).then(() => {
      settled = true;
    });

    await flushAsync();

    expect(evmRequestWithoutConfirmationMock).toHaveBeenCalledWith(
      requestHandler,
      7,
      request,
      dappInfo,
    );
    expect(settled).toBe(false);

    cleanup.resolve();
    await result;

    expect(settled).toBe(true);
    expect(requestHandler.saveInLocalStorage).not.toHaveBeenCalled();
  });

  it('rejects wallet_watchAsset on default chains', async () => {
    const { ChainUtils } = await import('@popup/multichain/utils/chain.utils');
    (ChainUtils.getDefaultChains as jest.Mock).mockResolvedValue([
      {
        chainId: '0x1',
        type: 'EVM',
        name: 'Ethereum',
      },
    ]);
    (ChainUtils.getAllSetupChainsForType as jest.Mock).mockResolvedValue([
      {
        chainId: '0x1',
        type: 'EVM',
        name: 'Ethereum',
      },
    ]);

    const request = {
      request_id: 45,
      method: EvmRequestMethod.WALLET_WATCH_ASSETS,
      params: [
        {
          type: 'ERC20',
          options: {
            address: '0x00000000000000000000000000000000000000aa',
            symbol: 'TKN',
            decimals: 18,
            image: 'https://example.com/token.png',
          },
        },
      ],
      chainId: '0x1',
    } as any;
    const dappInfo = {
      origin: 'https://example.app',
      domain: 'example.app',
      protocol: 'https:',
      logo: '',
    };
    const requestHandler = {
      accounts: [],
      saveInLocalStorage: jest.fn(),
    } as any;

    await initEvmRequestHandler(request, 7, dappInfo, requestHandler);

    expect(handleEvmErrorMock).toHaveBeenCalledWith(
      requestHandler,
      7,
      request,
      {
        code: -32602,
        message:
          'wallet_watchAsset is only supported on custom chains in Keychain',
      },
      'wallet_watchAsset is only supported on custom chains in Keychain',
      [],
      'https://example.app',
      true,
    );
    expect(evmRequestWithConfirmationMock).not.toHaveBeenCalled();
  });

  it('opens wallet_watchAsset confirmation on custom chains', async () => {
    const { ChainUtils } = await import('@popup/multichain/utils/chain.utils');
    const MkModule = (await import('@background/hive/modules/mk.module'))
      .default;
    const LocalStorageUtils = (await import('src/utils/localStorage.utils'))
      .default;
    const { EvmWalletUtils } = await import('@popup/evm/utils/wallet.utils');
    (ChainUtils.getDefaultChains as jest.Mock).mockResolvedValue([]);
    (ChainUtils.getAllSetupChainsForType as jest.Mock).mockResolvedValue([
      {
        chainId: '0x539',
        type: 'EVM',
        name: 'Local Custom Chain',
        isCustom: true,
      },
    ]);
    (MkModule.getMk as jest.Mock).mockResolvedValue('mk');
    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue([
      { address: '0xabc123' },
    ]);
    (EvmWalletUtils.rebuildAccountsFromLocalStorage as jest.Mock).mockResolvedValue(
      [],
    );

    const request = {
      request_id: 46,
      method: EvmRequestMethod.WALLET_WATCH_ASSETS,
      params: [
        {
          type: 'ERC20',
          options: {
            address: '0x00000000000000000000000000000000000000aa',
            symbol: 'TKN',
            decimals: 18,
          },
        },
      ],
      chainId: '0x539',
    } as any;
    const dappInfo = {
      origin: 'https://example.app',
      domain: 'example.app',
      protocol: 'https:',
      logo: '',
    };
    const requestHandler = {
      accounts: [],
      saveInLocalStorage: jest.fn(),
    } as any;

    await initEvmRequestHandler(request, 7, dappInfo, requestHandler);

    expect(handleEvmErrorMock).not.toHaveBeenCalled();
    expect(evmRequestWithConfirmationMock).toHaveBeenCalledWith(
      requestHandler,
      7,
      request,
      dappInfo,
    );
  });

  it('rejects malformed wallet_watchAsset params before confirmation', async () => {
    const { ChainUtils } = await import('@popup/multichain/utils/chain.utils');
    (ChainUtils.getDefaultChains as jest.Mock).mockResolvedValue([]);
    (ChainUtils.getAllSetupChainsForType as jest.Mock).mockResolvedValue([
      {
        chainId: '0x539',
        type: 'EVM',
        name: 'Local Custom Chain',
        isCustom: true,
      },
    ]);

    const request = {
      request_id: 47,
      method: EvmRequestMethod.WALLET_WATCH_ASSETS,
      params: [
        {
          type: 'ERC721',
          options: {
            address: '0x00000000000000000000000000000000000000aa',
          },
        },
      ],
      chainId: '0x539',
    } as any;
    const dappInfo = {
      origin: 'https://example.app',
      domain: 'example.app',
      protocol: 'https:',
      logo: '',
    };
    const requestHandler = {
      accounts: [],
      saveInLocalStorage: jest.fn(),
    } as any;

    await initEvmRequestHandler(request, 7, dappInfo, requestHandler);

    expect(handleEvmErrorMock).toHaveBeenCalledWith(
      requestHandler,
      7,
      request,
      {
        code: -32602,
        message:
          'Invalid wallet_watchAsset parameters. Keychain only supports ERC20 assets',
      },
      'Invalid wallet_watchAsset parameters. Keychain only supports ERC20 assets',
      [],
      'https://example.app',
      true,
    );
    expect(evmRequestWithConfirmationMock).not.toHaveBeenCalled();
  });
});
