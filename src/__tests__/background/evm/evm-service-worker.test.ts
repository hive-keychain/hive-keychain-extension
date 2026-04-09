import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';

jest.mock('@background/evm/evm-provider-registration', () => ({
  initializeEvmProviderRegistration: jest.fn(),
}));

jest.mock('@background/evm/requests/init', () => ({
  initEvmRequestHandler: jest.fn(),
}));

jest.mock('@background/evm/requests/operations/perform-operation', () => ({
  performEvmOperation: jest.fn(),
}));

jest.mock('@background/hive/modules/mk.module', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    saveMk: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/ethers.utils', () => ({
  EthersUtils: {
    getProvider: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/evm-pending-transactions-notifications.utils', () => ({
  EvmPendingTransactionsNotifications: {
    waitForTransaction: jest.fn(),
  },
}));

jest.mock('@popup/multichain/utils/chain.utils', () => ({
  ChainUtils: {
    addChainToSetupChains: jest.fn(),
  },
}));

jest.mock('@background/evm/evm-provider-state.utils', () => ({
  setAccountsForOrigin: jest.fn(),
}));

jest.mock('@background/evm/requests/evm-request-handler', () => ({
  EvmRequestHandler: {
    getFromLocalStorage: jest.fn(),
  },
}));

jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    tabsSendMessage: jest.fn(),
    runtimeSendMessage: jest.fn(),
  },
}));

const loadTestContext = async () => {
  await import('@background/evm/evm-service-worker');
  const { EvmRequestHandler } = await import(
    '@background/evm/requests/evm-request-handler'
  );
  const providerStateUtils = await import('@background/evm/evm-provider-state.utils');
  const { CommunicationUtils } = await import('src/utils/communication.utils');

  return {
    EvmRequestHandler: EvmRequestHandler as {
      getFromLocalStorage: jest.Mock;
    },
    providerStateUtils: providerStateUtils as {
      setAccountsForOrigin: jest.Mock;
    },
    CommunicationUtils: CommunicationUtils as {
      tabsSendMessage: jest.Mock;
      runtimeSendMessage: jest.Mock;
    },
  };
};

describe('evm service worker', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('syncs wallet_requestPermissions provider state once before replying to the tab', async () => {
    const addListenerSpy = jest.spyOn(chrome.runtime.onMessage, 'addListener');
    const { EvmRequestHandler, providerStateUtils, CommunicationUtils } =
      await loadTestContext();
    const requestHandler = {
      getRequestData: jest.fn().mockReturnValue({
        tab: 3,
        request: { method: EvmRequestMethod.WALLET_REQUEST_PERMISSIONS },
        dappInfo: {
          origin: 'http://localhost:3000',
          domain: 'localhost',
          protocol: 'http:',
          logo: '',
        },
      }),
      removeRequestById: jest.fn(),
    };
    EvmRequestHandler.getFromLocalStorage.mockResolvedValue(requestHandler);

    const messageHandler = addListenerSpy.mock.calls[0][0];

    await messageHandler(
      {
        command: BackgroundCommand.SEND_EVM_RESPONSE_TO_SW,
        value: {
          requestId: 7,
          result: [{ parentCapability: 'eth_accounts' }],
          providerState: {
            accounts: ['0xAbC123'],
          },
        },
      },
      {} as chrome.runtime.MessageSender,
      jest.fn(),
    );

    expect(providerStateUtils.setAccountsForOrigin).toHaveBeenCalledTimes(1);
    expect(providerStateUtils.setAccountsForOrigin).toHaveBeenCalledWith(
      'http://localhost:3000',
      ['0xAbC123'],
    );
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(3, {
      command: BackgroundCommand.SEND_EVM_RESPONSE,
      value: {
        requestId: 7,
        result: [{ parentCapability: 'eth_accounts' }],
      },
    });
    expect(requestHandler.removeRequestById).toHaveBeenCalledWith(7, 3);
  });

  it('does not re-broadcast sendBackChainFromProvider from the service worker', async () => {
    const addListenerSpy = jest.spyOn(chrome.runtime.onMessage, 'addListener');
    const { CommunicationUtils } = await loadTestContext();
    const messageHandler = addListenerSpy.mock.calls[0][0];

    await messageHandler(
      {
        command: BackgroundCommand.SEND_BACK_CHAIN_FROM_PROVIDER,
        value: { chainId: '0x1' },
      },
      {} as chrome.runtime.MessageSender,
      jest.fn(),
    );

    expect(CommunicationUtils.runtimeSendMessage).not.toHaveBeenCalled();
    expect(CommunicationUtils.tabsSendMessage).not.toHaveBeenCalled();
  });
});
