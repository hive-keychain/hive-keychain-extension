import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { ProviderRpcErrorList } from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';

jest.mock('@background/hive/modules/mk.module', () => ({
  __esModule: true,
  default: {
    getMk: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/evm-chain.utils', () => ({
  EvmChainUtils: {
    getLastEvmChainId: jest.fn(),
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
    getWalletPermission: jest.fn(),
    hasPermission: jest.fn(),
    removeWalletPermission: jest.fn(),
  },
}));

jest.mock('src/content-scripts/hive/web-interface/response.logic', () => ({
  sendEvmEventToDomain: jest.fn(),
}));

jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    tabsSendMessage: jest.fn(),
  },
}));

const loadTestContext = async () => {
  const { evmRequestWithoutConfirmation } = await import(
    '@background/evm/requests/logic/evm-request-without-confirmation.logic'
  );
  const { EvmWalletUtils } = await import('@popup/evm/utils/wallet.utils');
  const { CommunicationUtils } = await import('src/utils/communication.utils');
  const responseLogic = await import(
    'src/content-scripts/hive/web-interface/response.logic'
  );

  return {
    evmRequestWithoutConfirmation,
    EvmWalletUtils: EvmWalletUtils as {
      getConnectedWallets: jest.Mock;
      hasPermission: jest.Mock;
      removeWalletPermission: jest.Mock;
    },
    CommunicationUtils: CommunicationUtils as {
      tabsSendMessage: jest.Mock;
    },
    responseLogic: responseLogic as {
      sendEvmEventToDomain: jest.Mock;
    },
  };
};

describe('evm request without confirmation', () => {
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
