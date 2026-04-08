import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { ProviderRpcErrorList } from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';

jest.mock('@background/hive/modules/mk.module', () => ({
  __esModule: true,
  default: {
    getMk: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/evm-chain.utils', () => ({
  EvmChainUtils: {
    getLastEvmChainId: jest.fn(),
    saveLastUsedChain: jest.fn(),
    setActiveEvmChain: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/evm-requests.utils', () => ({
  EvmRequestsUtils: {
    call: jest.fn(),
    getEnsForAddress: jest.fn(),
    getWalletCapabilities: jest.fn(),
    personalRecover: jest.fn(),
    resolveEns: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/wallet.utils', () => ({
  EvmWalletUtils: {
    getConnectedWallets: jest.fn(),
    getWalletPermissionFull: jest.fn(),
    getWalletPermission: jest.fn(),
    hasPermission: jest.fn(),
    removeWalletPermission: jest.fn(),
  },
}));

jest.mock('@popup/multichain/utils/chain.utils', () => ({
  ChainUtils: {
    getChain: jest.fn(),
  },
}));

jest.mock('src/content-scripts/hive/web-interface/response.logic', () => ({
  sendEvmEventToDomain: jest.fn(),
  sendEvmEventGlobal: jest.fn(),
}));

jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    tabsSendMessage: jest.fn(),
  },
}));

jest.mock('src/utils/localStorage.utils', () => ({
  __esModule: true,
  default: {
    saveValueInLocalStorage: jest.fn(),
  },
}));

const loadTestContext = async () => {
  const { evmRequestWithoutConfirmation } = await import(
    '@background/evm/requests/logic/evm-request-without-confirmation.logic'
  );
  const { EvmChainUtils } = await import('@popup/evm/utils/evm-chain.utils');
  const { EvmRequestsUtils } = await import('@popup/evm/utils/evm-requests.utils');
  const { EvmWalletUtils } = await import('@popup/evm/utils/wallet.utils');
  const { ChainUtils } = await import('@popup/multichain/utils/chain.utils');
  const { CommunicationUtils } = await import('src/utils/communication.utils');
  const LocalStorageUtils = (await import('src/utils/localStorage.utils'))
    .default as {
    saveValueInLocalStorage: jest.Mock;
  };
  const responseLogic = await import(
    'src/content-scripts/hive/web-interface/response.logic'
  );

  return {
    evmRequestWithoutConfirmation,
    EvmChainUtils: EvmChainUtils as {
      getLastEvmChainId: jest.Mock;
      saveLastUsedChain: jest.Mock;
      setActiveEvmChain: jest.Mock;
    },
    EvmRequestsUtils: EvmRequestsUtils as {
      call: jest.Mock;
    },
    EvmWalletUtils: EvmWalletUtils as {
      getConnectedWallets: jest.Mock;
      getWalletPermissionFull: jest.Mock;
      hasPermission: jest.Mock;
      removeWalletPermission: jest.Mock;
    },
    ChainUtils: ChainUtils as {
      getChain: jest.Mock;
    },
    CommunicationUtils: CommunicationUtils as {
      tabsSendMessage: jest.Mock;
    },
    LocalStorageUtils,
    responseLogic: responseLogic as {
      sendEvmEventToDomain: jest.Mock;
      sendEvmEventGlobal: jest.Mock;
    },
  };
};

describe('evm request without confirmation', () => {
  const polygonChain = {
    chainId: '0x89',
    name: 'Polygon',
    rpcs: [{ url: 'https://polygon-rpc.test' }],
  } as any;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('does not emit accountsChanged for repeated eth_requestAccounts when exposed accounts are unchanged', async () => {
    const {
      evmRequestWithoutConfirmation,
      EvmWalletUtils,
      CommunicationUtils,
      responseLogic,
    } = await loadTestContext();
    const requestHandler = {
      removeRequestById: jest.fn(),
    } as any;

    EvmWalletUtils.hasPermission.mockResolvedValue(true);
    EvmWalletUtils.getConnectedWallets.mockResolvedValue(['0xaaa']);

    await evmRequestWithoutConfirmation(
      requestHandler,
      7,
      {
        request_id: 11,
        method: EvmRequestMethod.REQUEST_ACCOUNTS,
        params: [],
      },
      {
        domain: 'http://localhost:3000',
        protocol: 'http:',
        logo: '',
      },
    );

    expect(responseLogic.sendEvmEventToDomain).not.toHaveBeenCalled();
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(7, {
      command: BackgroundCommand.SEND_EVM_RESPONSE,
      value: {
        requestId: 11,
        result: ['0xaaa'],
      },
    });
  });

  it('handles wallet_switchEthereumChain wallet-side without forwarding to provider.send', async () => {
    const {
      evmRequestWithoutConfirmation,
      EvmChainUtils,
      EvmRequestsUtils,
      ChainUtils,
      CommunicationUtils,
      LocalStorageUtils,
      responseLogic,
    } = await loadTestContext();
    const requestHandler = {
      removeRequestById: jest.fn(),
    } as any;

    ChainUtils.getChain.mockResolvedValue(polygonChain);
    EvmChainUtils.setActiveEvmChain.mockResolvedValue(undefined);

    await evmRequestWithoutConfirmation(
      requestHandler,
      14,
      {
        request_id: 27,
        method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
        params: [{ chainId: '0x89' }],
      },
      {
        domain: 'https://app.test',
        protocol: 'https:',
        logo: '',
      },
    );

    expect(EvmRequestsUtils.call).not.toHaveBeenCalled();
    expect(ChainUtils.getChain).toHaveBeenCalledWith('0x89');
    expect(EvmChainUtils.setActiveEvmChain).toHaveBeenCalledWith(polygonChain);
    expect(LocalStorageUtils.saveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.ACTIVE_CHAIN,
      '0x89',
    );
    expect(responseLogic.sendEvmEventGlobal).not.toHaveBeenCalled();
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(14, {
      command: BackgroundCommand.SEND_EVM_RESPONSE,
      value: {
        requestId: 27,
        result: null,
      },
    });
  });

  it('returns chainNotAdded for wallet_switchEthereumChain when the chain is not available in wallet state', async () => {
    const {
      evmRequestWithoutConfirmation,
      EvmChainUtils,
      EvmRequestsUtils,
      ChainUtils,
      CommunicationUtils,
      LocalStorageUtils,
      responseLogic,
    } = await loadTestContext();
    const requestHandler = {
      removeRequestById: jest.fn(),
    } as any;

    ChainUtils.getChain.mockResolvedValue(undefined);

    await evmRequestWithoutConfirmation(
      requestHandler,
      15,
      {
        request_id: 28,
        method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
        params: [{ chainId: '0x89' }],
      },
      {
        domain: 'https://app.test',
        protocol: 'https:',
        logo: '',
      },
    );

    expect(EvmRequestsUtils.call).not.toHaveBeenCalled();
    expect(EvmChainUtils.setActiveEvmChain).not.toHaveBeenCalled();
    expect(LocalStorageUtils.saveValueInLocalStorage).not.toHaveBeenCalled();
    expect(responseLogic.sendEvmEventGlobal).not.toHaveBeenCalled();
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(15, {
      command: BackgroundCommand.SEND_EVM_ERROR,
      value: {
        requestId: 28,
        error: ProviderRpcErrorList.chainNotAdded,
      },
    });
  });

  it.each([
    undefined,
    [],
    [{}, {}],
    ['0x89'],
    [{}],
    [{ chainId: 1 }],
    [{ chainId: '1' }],
    [{ chainId: '0xzz' }],
  ])(
    'returns invalid params for malformed wallet_switchEthereumChain params: %p',
    async (params) => {
      const {
        evmRequestWithoutConfirmation,
        EvmChainUtils,
        EvmRequestsUtils,
        ChainUtils,
        CommunicationUtils,
        LocalStorageUtils,
        responseLogic,
      } = await loadTestContext();
      const requestHandler = {
        removeRequestById: jest.fn(),
      } as any;

      await evmRequestWithoutConfirmation(
        requestHandler,
        16,
        {
          request_id: 29,
          method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
          params: params as any,
        },
        {
          domain: 'https://app.test',
          protocol: 'https:',
          logo: '',
        },
      );

      expect(ChainUtils.getChain).not.toHaveBeenCalled();
      expect(EvmRequestsUtils.call).not.toHaveBeenCalled();
      expect(EvmChainUtils.setActiveEvmChain).not.toHaveBeenCalled();
      expect(LocalStorageUtils.saveValueInLocalStorage).not.toHaveBeenCalled();
      expect(responseLogic.sendEvmEventGlobal).not.toHaveBeenCalled();
      expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(16, {
        command: BackgroundCommand.SEND_EVM_ERROR,
        value: {
          requestId: 29,
          error: ProviderRpcErrorList.invalidMethodParams,
        },
      });
    },
  );

  it('returns the granted eth_accounts permission for wallet_requestPermissions', async () => {
    const { evmRequestWithoutConfirmation, EvmWalletUtils, CommunicationUtils } =
      await loadTestContext();
    const requestHandler = {
      removeRequestById: jest.fn(),
    } as any;

    EvmWalletUtils.hasPermission.mockResolvedValue(true);

    await evmRequestWithoutConfirmation(
      requestHandler,
      8,
      {
        request_id: 12,
        method: EvmRequestMethod.WALLET_REQUEST_PERMISSIONS,
        params: [{ [EvmRequestPermission.ETH_ACCOUNTS]: {} }],
      },
      {
        domain: 'https://app.test',
        protocol: 'https:',
        logo: '',
      },
    );

    expect(EvmWalletUtils.hasPermission).toHaveBeenCalledWith(
      'https://app.test',
      EvmRequestPermission.ETH_ACCOUNTS,
    );
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(8, {
      command: BackgroundCommand.SEND_EVM_RESPONSE,
      value: {
        requestId: 12,
        result: [{ parentCapability: EvmRequestPermission.ETH_ACCOUNTS }],
      },
    });
  });

  it('returns exact-origin eth_accounts descriptors with caveats for wallet_getPermissions', async () => {
    const { evmRequestWithoutConfirmation, EvmWalletUtils, CommunicationUtils } =
      await loadTestContext();
    const requestHandler = {
      removeRequestById: jest.fn(),
    } as any;

    EvmWalletUtils.getWalletPermissionFull.mockResolvedValue({
      [EvmRequestPermission.ETH_ACCOUNTS]: ['0xaaa', '0xbbb'],
    });

    await evmRequestWithoutConfirmation(
      requestHandler,
      12,
      {
        request_id: 25,
        method: EvmRequestMethod.WALLET_GET_PERMISSIONS,
        params: [],
      },
      {
        domain: 'http://localhost:3000',
        protocol: 'http:',
        logo: '',
      },
    );

    expect(EvmWalletUtils.getWalletPermissionFull).toHaveBeenCalledWith(
      'http://localhost:3000',
    );
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(12, {
      command: BackgroundCommand.SEND_EVM_RESPONSE,
      value: {
        requestId: 25,
        result: [
          {
            invoker: 'http://localhost:3000',
            parentCapability: EvmRequestPermission.ETH_ACCOUNTS,
            caveats: [
              {
                type: 'restrictReturnedAccounts',
                value: ['0xaaa', '0xbbb'],
              },
            ],
          },
        ],
      },
    });
  });

  it('returns [] for wallet_getPermissions when a different origin has no granted permissions', async () => {
    const { evmRequestWithoutConfirmation, EvmWalletUtils, CommunicationUtils } =
      await loadTestContext();
    const requestHandler = {
      removeRequestById: jest.fn(),
    } as any;

    EvmWalletUtils.getWalletPermissionFull.mockImplementation(
      async (domain: string) =>
        domain === 'http://localhost:3000'
          ? {
              [EvmRequestPermission.ETH_ACCOUNTS]: ['0xaaa'],
            }
          : {},
    );

    await evmRequestWithoutConfirmation(
      requestHandler,
      13,
      {
        request_id: 26,
        method: EvmRequestMethod.WALLET_GET_PERMISSIONS,
        params: [],
      },
      {
        domain: 'http://localhost:5173',
        protocol: 'http:',
        logo: '',
      },
    );

    expect(EvmWalletUtils.getWalletPermissionFull).toHaveBeenCalledWith(
      'http://localhost:5173',
    );
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(13, {
      command: BackgroundCommand.SEND_EVM_RESPONSE,
      value: {
        requestId: 26,
        result: [],
      },
    });
  });

  it('returns null and only revokes eth_accounts for the current origin', async () => {
    const {
      evmRequestWithoutConfirmation,
      EvmWalletUtils,
      CommunicationUtils,
      responseLogic,
    } = await loadTestContext();
    const requestHandler = {
      removeRequestById: jest.fn(),
    } as any;

    EvmWalletUtils.removeWalletPermission.mockResolvedValue(undefined);

    await evmRequestWithoutConfirmation(
      requestHandler,
      9,
      {
        request_id: 13,
        method: EvmRequestMethod.WALLET_REVOKE_PERMISSION,
        params: [{ [EvmRequestPermission.ETH_ACCOUNTS]: {} }],
      },
      {
        domain: 'https://app.test',
        protocol: 'https:',
        logo: '',
      },
    );

    expect(EvmWalletUtils.removeWalletPermission).toHaveBeenCalledWith(
      'https://app.test',
      EvmRequestPermission.ETH_ACCOUNTS,
    );
    expect(responseLogic.sendEvmEventToDomain).not.toHaveBeenCalled();
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(9, {
      command: BackgroundCommand.SEND_EVM_RESPONSE,
      value: {
        requestId: 13,
        result: null,
      },
    });
  });

  it.each([
    undefined,
    [],
    [{}, {}],
    ['eth_accounts'],
    [{ eth_accounts: {}, wallet_snap: {} }],
    [{ eth_accounts: 'invalid' }],
  ])('returns an RPC error for malformed revoke params: %p', async (params) => {
    const { evmRequestWithoutConfirmation, EvmWalletUtils, CommunicationUtils } =
      await loadTestContext();
    const requestHandler = {
      removeRequestById: jest.fn(),
    } as any;

    await evmRequestWithoutConfirmation(
      requestHandler,
      5,
      {
        request_id: 21,
        method: EvmRequestMethod.WALLET_REVOKE_PERMISSION,
        params: params as any,
      },
      {
        domain: 'https://app.test',
        protocol: 'https:',
        logo: '',
      },
    );

    expect(EvmWalletUtils.removeWalletPermission).not.toHaveBeenCalled();
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(5, {
      command: BackgroundCommand.SEND_EVM_ERROR,
      value: {
        requestId: 21,
        error: ProviderRpcErrorList.invalidMethodParams,
      },
    });
  });

  it.each([
    undefined,
    [],
    [{}, {}],
    ['eth_accounts'],
    [{ eth_accounts: {}, wallet_snap: {} }],
    [{ eth_accounts: 'invalid' }],
  ])(
    'returns an RPC error for malformed wallet_requestPermissions params: %p',
    async (params) => {
      const {
        evmRequestWithoutConfirmation,
        EvmWalletUtils,
        CommunicationUtils,
      } = await loadTestContext();
      const requestHandler = {
        removeRequestById: jest.fn(),
      } as any;

      await evmRequestWithoutConfirmation(
        requestHandler,
        10,
        {
          request_id: 23,
          method: EvmRequestMethod.WALLET_REQUEST_PERMISSIONS,
          params: params as any,
        },
        {
          domain: 'https://app.test',
          protocol: 'https:',
          logo: '',
        },
      );

      expect(EvmWalletUtils.hasPermission).not.toHaveBeenCalled();
      expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(10, {
        command: BackgroundCommand.SEND_EVM_ERROR,
        value: {
          requestId: 23,
          error: ProviderRpcErrorList.invalidMethodParams,
        },
      });
    },
  );

  it('returns an RPC error for unsupported wallet_requestPermissions permissions', async () => {
    const { evmRequestWithoutConfirmation, EvmWalletUtils, CommunicationUtils } =
      await loadTestContext();
    const requestHandler = {
      removeRequestById: jest.fn(),
    } as any;

    await evmRequestWithoutConfirmation(
      requestHandler,
      11,
      {
        request_id: 24,
        method: EvmRequestMethod.WALLET_REQUEST_PERMISSIONS,
        params: [{ wallet_snap: {} } as any],
      },
      {
        domain: 'https://app.test',
        protocol: 'https:',
        logo: '',
      },
    );

    expect(EvmWalletUtils.hasPermission).not.toHaveBeenCalled();
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(11, {
      command: BackgroundCommand.SEND_EVM_ERROR,
      value: {
        requestId: 24,
        error: ProviderRpcErrorList.unsupportedMethod,
      },
    });
  });

  it('returns an RPC error for unsupported revoke permissions', async () => {
    const { evmRequestWithoutConfirmation, EvmWalletUtils, CommunicationUtils } =
      await loadTestContext();
    const requestHandler = {
      removeRequestById: jest.fn(),
    } as any;

    await evmRequestWithoutConfirmation(
      requestHandler,
      6,
      {
        request_id: 22,
        method: EvmRequestMethod.WALLET_REVOKE_PERMISSION,
        params: [{ wallet_snap: {} } as any],
      },
      {
        domain: 'https://app.test',
        protocol: 'https:',
        logo: '',
      },
    );

    expect(EvmWalletUtils.removeWalletPermission).not.toHaveBeenCalled();
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(6, {
      command: BackgroundCommand.SEND_EVM_ERROR,
      value: {
        requestId: 22,
        error: ProviderRpcErrorList.unsupportedMethod,
      },
    });
  });
});
