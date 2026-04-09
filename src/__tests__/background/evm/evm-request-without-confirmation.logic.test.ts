import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { evmRequestWithoutConfirmation } from '@background/evm/requests/logic/evm-request-without-confirmation.logic';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';

jest.mock('@background/hive/modules/mk.module', () => ({
  __esModule: true,
  default: {
    getMk: jest.fn().mockResolvedValue('mk'),
  },
}));

jest.mock('@popup/evm/utils/wallet.utils', () => ({
  EvmWalletUtils: {
    hasPermission: jest.fn(),
    getConnectedWallets: jest.fn(),
    revokeAllPermissions: jest.fn(),
    getWalletPermission: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/evm-chain.utils', () => ({
  EvmChainUtils: {
    getLastEvmChainIdForOrigin: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/evm-requests.utils', () => ({
  EvmRequestsUtils: {
    getWalletCapabilities: jest.fn(),
    call: jest.fn(),
  },
}));

jest.mock('src/background/evm/evm-provider-state.utils', () => ({
  emitAccountsChangedIfNeeded: jest.fn(),
  getAccountsForOrigin: jest.fn(),
  setChainIdForOrigin: jest.fn(),
}));

jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    tabsSendMessage: jest.fn(),
  },
}));

const loadTestContext = async () => {
  const { EvmWalletUtils } = await import('@popup/evm/utils/wallet.utils');
  const providerStateUtils = await import(
    'src/background/evm/evm-provider-state.utils'
  );
  const { CommunicationUtils } = await import('src/utils/communication.utils');

  return {
    EvmWalletUtils: EvmWalletUtils as {
      hasPermission: jest.Mock;
      getConnectedWallets: jest.Mock;
      revokeAllPermissions: jest.Mock;
    },
    providerStateUtils: providerStateUtils as {
      emitAccountsChangedIfNeeded: jest.Mock;
      getAccountsForOrigin: jest.Mock;
    },
    CommunicationUtils: CommunicationUtils as {
      tabsSendMessage: jest.Mock;
    },
  };
};

describe('evm request without confirmation', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('emits one accountsChanged path for eth_requestAccounts', async () => {
    const { EvmWalletUtils, providerStateUtils, CommunicationUtils } =
      await loadTestContext();
    EvmWalletUtils.hasPermission.mockResolvedValue(true);
    EvmWalletUtils.getConnectedWallets.mockResolvedValue(['0xabc123']);
    providerStateUtils.emitAccountsChangedIfNeeded.mockResolvedValue([
      '0xabc123',
    ]);
    const requestHandler = {
      removeRequestById: jest.fn(),
    } as any;

    await evmRequestWithoutConfirmation(
      requestHandler,
      5,
      {
        request_id: 1,
        method: EvmRequestMethod.REQUEST_ACCOUNTS,
        params: [],
      } as any,
      {
        origin: 'http://localhost:3000',
        domain: 'localhost',
        protocol: 'http:',
        logo: '',
      },
    );

    expect(providerStateUtils.emitAccountsChangedIfNeeded).toHaveBeenCalledTimes(1);
    expect(providerStateUtils.emitAccountsChangedIfNeeded).toHaveBeenCalledWith(
      'http://localhost:3000',
      [],
      ['0xabc123'],
    );
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(5, {
      command: BackgroundCommand.SEND_EVM_RESPONSE,
      value: {
        requestId: 1,
        result: ['0xabc123'],
      },
    });
    expect(requestHandler.removeRequestById).toHaveBeenCalledWith(1, 5);
  });

  it('emits one accountsChanged([]) path for wallet_revokePermissions', async () => {
    const { EvmWalletUtils, providerStateUtils, CommunicationUtils } =
      await loadTestContext();
    EvmWalletUtils.revokeAllPermissions.mockResolvedValue(undefined);
    providerStateUtils.getAccountsForOrigin.mockResolvedValue(['0xabc123']);
    providerStateUtils.emitAccountsChangedIfNeeded.mockResolvedValue([]);
    const requestHandler = {
      removeRequestById: jest.fn(),
    } as any;

    await evmRequestWithoutConfirmation(
      requestHandler,
      6,
      {
        request_id: 2,
        method: EvmRequestMethod.WALLET_REVOKE_PERMISSION,
        params: [],
      } as any,
      {
        origin: 'http://localhost:3000',
        domain: 'localhost',
        protocol: 'http:',
        logo: '',
      },
    );

    expect(EvmWalletUtils.revokeAllPermissions).toHaveBeenCalledWith(
      'http://localhost:3000',
    );
    expect(providerStateUtils.emitAccountsChangedIfNeeded).toHaveBeenCalledTimes(1);
    expect(providerStateUtils.emitAccountsChangedIfNeeded).toHaveBeenCalledWith(
      'http://localhost:3000',
      ['0xabc123'],
      [],
    );
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(6, {
      command: BackgroundCommand.SEND_EVM_RESPONSE,
      value: {
        requestId: 2,
        result: null,
      },
    });
    expect(requestHandler.removeRequestById).toHaveBeenCalledWith(2, 6);
  });
});
