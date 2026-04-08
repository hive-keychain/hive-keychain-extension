import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { ProviderRpcErrorList } from '@interfaces/evm-provider.interface';

jest.mock('@background/hive/modules/mk.module', () => ({
  __esModule: true,
  default: {
    getMk: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/wallet.utils', () => ({
  EvmWalletUtils: {
    hasPermission: jest.fn(),
    rebuildAccountsFromLocalStorage: jest.fn(),
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

jest.mock('@background/evm/requests/logic/evm-request-with-confirmation.logic', () => ({
  evmRequestWithConfirmation: jest.fn(),
}));

jest.mock('@background/evm/requests/logic/evm-request-without-confirmation.logic', () => ({
  evmRequestWithoutConfirmation: jest.fn(),
}));

jest.mock('@background/evm/requests/logic/handle-evm-error.logic', () => ({
  handleEvmError: jest.fn(),
}));

jest.mock('@background/evm/requests/logic/handle-deprecated-methods.logic', () => ({
  handleDeprecatedMethods: jest.fn(),
}));

jest.mock('@background/evm/requests/logic/handle-non-existing-methods.logic', () => ({
  handleNonExistingMethod: jest.fn(),
}));

jest.mock('@background/evm/requests/logic/handle-non-supported-chain.logic', () => ({
  handleNonSupportedChain: jest.fn(),
}));

jest.mock('@background/evm/requests/logic/request-add-evm-chain.logic', () => ({
  requestAddEvmChain: jest.fn(),
}));

jest.mock('@background/hive/requests/logic', () => ({
  initializeWallet: jest.fn(),
  unlockWallet: jest.fn(),
}));

const loadTestContext = async () => {
  const { initEvmRequestHandler } = await import('@background/evm/requests/init');
  const MkModule = (await import('@background/hive/modules/mk.module'))
    .default as {
    getMk: jest.Mock;
  };
  const { EvmWalletUtils } = await import('@popup/evm/utils/wallet.utils');
  const { ChainUtils } = await import('@popup/multichain/utils/chain.utils');
  const { DappRequestUtils } = await import('src/utils/dapp-request.utils');
  const LocalStorageUtils = (await import('src/utils/localStorage.utils'))
    .default as {
    getValueFromLocalStorage: jest.Mock;
  };
  const { evmRequestWithConfirmation } = await import(
    '@background/evm/requests/logic/evm-request-with-confirmation.logic'
  );
  const { evmRequestWithoutConfirmation } = await import(
    '@background/evm/requests/logic/evm-request-without-confirmation.logic'
  );
  const { handleEvmError } = await import(
    '@background/evm/requests/logic/handle-evm-error.logic'
  );
  const { handleNonSupportedChain } = await import(
    '@background/evm/requests/logic/handle-non-supported-chain.logic'
  );

  return {
    initEvmRequestHandler,
    MkModule,
    EvmWalletUtils: EvmWalletUtils as {
      hasPermission: jest.Mock;
      rebuildAccountsFromLocalStorage: jest.Mock;
    },
    ChainUtils: ChainUtils as {
      getDefaultChains: jest.Mock;
      getAllSetupChainsForType: jest.Mock;
    },
    DappRequestUtils: DappRequestUtils as {
      isDappLocked: jest.Mock;
    },
    LocalStorageUtils,
    evmRequestWithConfirmation: evmRequestWithConfirmation as jest.Mock,
    evmRequestWithoutConfirmation: evmRequestWithoutConfirmation as jest.Mock,
    handleEvmError: handleEvmError as jest.Mock,
    handleNonSupportedChain: handleNonSupportedChain as jest.Mock,
  };
};

describe('evm request init', () => {
  const dappInfo = {
    domain: 'https://app.test',
    protocol: 'https:',
    logo: '',
  };
  const chain = { chainId: '0x1' } as any;

  const getRequestHandler = () =>
    ({
      accounts: [],
      saveInLocalStorage: jest.fn(),
      removeRequestById: jest.fn(),
    }) as any;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('routes authorized eth_requestAccounts through the confirmation path', async () => {
    const {
      initEvmRequestHandler,
      MkModule,
      EvmWalletUtils,
      ChainUtils,
      DappRequestUtils,
      LocalStorageUtils,
      evmRequestWithConfirmation,
      evmRequestWithoutConfirmation,
      handleEvmError,
    } = await loadTestContext();
    const requestHandler = getRequestHandler();
    const request = {
      request_id: 1,
      method: EvmRequestMethod.REQUEST_ACCOUNTS,
      params: [],
      chainId: '0x1',
    };

    MkModule.getMk.mockResolvedValue('mk');
    EvmWalletUtils.rebuildAccountsFromLocalStorage.mockResolvedValue([]);
    EvmWalletUtils.hasPermission.mockResolvedValue(true);
    ChainUtils.getDefaultChains.mockResolvedValue([chain]);
    ChainUtils.getAllSetupChainsForType.mockResolvedValue([chain]);
    DappRequestUtils.isDappLocked.mockResolvedValue(false);
    LocalStorageUtils.getValueFromLocalStorage.mockResolvedValue({ list: [] });

    await initEvmRequestHandler(request as any, 7, dappInfo, requestHandler);

    expect(evmRequestWithConfirmation).toHaveBeenCalledWith(
      requestHandler,
      7,
      request,
      dappInfo,
    );
    expect(evmRequestWithoutConfirmation).not.toHaveBeenCalled();
    expect(handleEvmError).not.toHaveBeenCalled();
  });

  it('routes authorized eth_accounts wallet_requestPermissions through the confirmation path', async () => {
    const {
      initEvmRequestHandler,
      MkModule,
      EvmWalletUtils,
      ChainUtils,
      DappRequestUtils,
      LocalStorageUtils,
      evmRequestWithConfirmation,
      evmRequestWithoutConfirmation,
      handleEvmError,
    } = await loadTestContext();
    const requestHandler = getRequestHandler();
    const request = {
      request_id: 1,
      method: EvmRequestMethod.WALLET_REQUEST_PERMISSIONS,
      params: [{ [EvmRequestPermission.ETH_ACCOUNTS]: {} }],
      chainId: '0x1',
    };

    MkModule.getMk.mockResolvedValue('mk');
    EvmWalletUtils.rebuildAccountsFromLocalStorage.mockResolvedValue([]);
    EvmWalletUtils.hasPermission.mockResolvedValue(true);
    ChainUtils.getDefaultChains.mockResolvedValue([chain]);
    ChainUtils.getAllSetupChainsForType.mockResolvedValue([chain]);
    DappRequestUtils.isDappLocked.mockResolvedValue(false);
    LocalStorageUtils.getValueFromLocalStorage.mockResolvedValue({ list: [] });

    await initEvmRequestHandler(request as any, 7, dappInfo, requestHandler);

    expect(evmRequestWithConfirmation).toHaveBeenCalledWith(
      requestHandler,
      7,
      request,
      dappInfo,
    );
    expect(evmRequestWithoutConfirmation).not.toHaveBeenCalled();
    expect(handleEvmError).not.toHaveBeenCalled();
  });

  it('routes wallet_switchEthereumChain through the wallet-side no-confirmation path even when the target chain is not in the default chain list', async () => {
    const {
      initEvmRequestHandler,
      ChainUtils,
      evmRequestWithoutConfirmation,
      evmRequestWithConfirmation,
      handleNonSupportedChain,
    } = await loadTestContext();
    const requestHandler = getRequestHandler();
    const request = {
      request_id: 30,
      method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
      params: [{ chainId: '0x999' }],
    };

    ChainUtils.getDefaultChains.mockResolvedValue([chain]);
    ChainUtils.getAllSetupChainsForType.mockResolvedValue([chain]);

    await initEvmRequestHandler(request as any, 10, dappInfo, requestHandler);

    expect(evmRequestWithoutConfirmation).toHaveBeenCalledWith(
      requestHandler,
      10,
      request,
      dappInfo,
    );
    expect(handleNonSupportedChain).not.toHaveBeenCalled();
    expect(evmRequestWithConfirmation).not.toHaveBeenCalled();
  });

  it('treats valid eth_accounts wallet_requestPermissions like eth_requestAccounts for dapp lock gating', async () => {
    const {
      initEvmRequestHandler,
      MkModule,
      EvmWalletUtils,
      ChainUtils,
      DappRequestUtils,
      LocalStorageUtils,
      evmRequestWithConfirmation,
      handleEvmError,
    } = await loadTestContext();
    const requestHandler = getRequestHandler();
    const request = {
      request_id: 2,
      method: EvmRequestMethod.WALLET_REQUEST_PERMISSIONS,
      params: [{ [EvmRequestPermission.ETH_ACCOUNTS]: {} }],
      chainId: '0x1',
    };

    MkModule.getMk.mockResolvedValue('mk');
    EvmWalletUtils.rebuildAccountsFromLocalStorage.mockResolvedValue([]);
    EvmWalletUtils.hasPermission.mockResolvedValue(false);
    ChainUtils.getDefaultChains.mockResolvedValue([chain]);
    ChainUtils.getAllSetupChainsForType.mockResolvedValue([chain]);
    DappRequestUtils.isDappLocked.mockResolvedValue(true);
    LocalStorageUtils.getValueFromLocalStorage.mockResolvedValue({ list: [] });

    await initEvmRequestHandler(request as any, 8, dappInfo, requestHandler);

    expect(DappRequestUtils.isDappLocked).not.toHaveBeenCalled();
    expect(evmRequestWithConfirmation).toHaveBeenCalledWith(
      requestHandler,
      8,
      request,
      dappInfo,
    );
    expect(handleEvmError).not.toHaveBeenCalled();
  });

  it.each([
    [undefined, ProviderRpcErrorList.invalidMethodParams],
    [[], ProviderRpcErrorList.invalidMethodParams],
    [[{}, {}], ProviderRpcErrorList.invalidMethodParams],
    [['eth_accounts'], ProviderRpcErrorList.invalidMethodParams],
    [[{ eth_accounts: {}, wallet_snap: {} }], ProviderRpcErrorList.invalidMethodParams],
    [[{ eth_accounts: 'invalid' }], ProviderRpcErrorList.invalidMethodParams],
    [[{ wallet_snap: {} }], ProviderRpcErrorList.unsupportedMethod],
  ])(
    'rejects invalid wallet_requestPermissions params before confirmation: %p',
    async (params, expectedError) => {
      const {
        initEvmRequestHandler,
        MkModule,
        ChainUtils,
        DappRequestUtils,
        LocalStorageUtils,
        EvmWalletUtils,
        evmRequestWithConfirmation,
        evmRequestWithoutConfirmation,
        handleEvmError,
      } = await loadTestContext();
      const requestHandler = getRequestHandler();
      const request = {
        request_id: 3,
        method: EvmRequestMethod.WALLET_REQUEST_PERMISSIONS,
        params,
        chainId: '0x1',
      };

      MkModule.getMk.mockResolvedValue('mk');
      ChainUtils.getDefaultChains.mockResolvedValue([chain]);
      ChainUtils.getAllSetupChainsForType.mockResolvedValue([chain]);
      DappRequestUtils.isDappLocked.mockResolvedValue(false);
      LocalStorageUtils.getValueFromLocalStorage.mockResolvedValue({ list: [] });

      await initEvmRequestHandler(request as any, 9, dappInfo, requestHandler);

      expect(handleEvmError).toHaveBeenCalledWith(
        requestHandler,
        9,
        request,
        expectedError,
        expectedError.message,
        [],
        true,
      );
      expect(DappRequestUtils.isDappLocked).not.toHaveBeenCalled();
      expect(EvmWalletUtils.hasPermission).not.toHaveBeenCalled();
      expect(evmRequestWithConfirmation).not.toHaveBeenCalled();
      expect(evmRequestWithoutConfirmation).not.toHaveBeenCalled();
    },
  );
});
