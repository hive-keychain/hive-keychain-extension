import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
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
    disconnectAllWallets: jest.fn(),
    getConnectedWallets: jest.fn(),
    getWalletPermission: jest.fn(),
    hasPermission: jest.fn(),
    revokeAllPermissions: jest.fn(),
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
      disconnectAllWallets: jest.Mock;
      getConnectedWallets: jest.Mock;
      hasPermission: jest.Mock;
      revokeAllPermissions: jest.Mock;
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

  it('does not emit accountsChanged directly from the revoke wrapper flow', async () => {
    const {
      evmRequestWithoutConfirmation,
      EvmWalletUtils,
      CommunicationUtils,
      responseLogic,
    } = await loadTestContext();
    const requestHandler = {
      removeRequestById: jest.fn(),
    } as any;

    EvmWalletUtils.disconnectAllWallets.mockResolvedValue(undefined);
    EvmWalletUtils.revokeAllPermissions.mockResolvedValue(undefined);

    await evmRequestWithoutConfirmation(
      requestHandler,
      9,
      {
        request_id: 13,
        method: EvmRequestMethod.WALLET_REVOKE_PERMISSION,
        params: [],
      },
      {
        domain: 'https://app.test',
        protocol: 'https:',
        logo: '',
      },
    );

    expect(EvmWalletUtils.disconnectAllWallets).toHaveBeenCalledWith(
      'https://app.test',
    );
    expect(EvmWalletUtils.revokeAllPermissions).toHaveBeenCalledWith(
      'https://app.test',
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
});
