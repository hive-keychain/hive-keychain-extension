import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { initEvmRequestHandler } from '@background/evm/requests/init';

const requestAddCustomEvmChainMock = jest.fn();
const handleNonSupportedChainMock = jest.fn();
const evmRequestWithoutConfirmationMock = jest.fn();

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
  evmRequestWithConfirmation: jest.fn(),
}));

jest.mock('@background/evm/requests/logic/evm-request-without-confirmation.logic', () => ({
  evmRequestWithoutConfirmation: (...args: any[]) =>
    evmRequestWithoutConfirmationMock(...args),
}));

jest.mock('@background/evm/requests/logic/handle-deprecated-methods.logic', () => ({
  handleDeprecatedMethods: jest.fn(),
}));

jest.mock('@background/evm/requests/logic/handle-evm-error.logic', () => ({
  handleEvmError: jest.fn(),
}));

jest.mock('@background/evm/requests/logic/handle-non-existing-methods.logic', () => ({
  handleNonExistingMethod: jest.fn(),
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
    (ChainUtils.getDefaultChains as jest.Mock).mockResolvedValue([]);
    (ChainUtils.getAllSetupChainsForType as jest.Mock).mockResolvedValue([]);
  });

  it('opens the custom chain dialog for unsupported wallet_switchEthereumChain requests', async () => {
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

    expect(requestAddCustomEvmChainMock).toHaveBeenCalledWith(
      requestHandler,
      7,
      request,
      dappInfo,
      '0x539',
    );
    expect(handleNonSupportedChainMock).not.toHaveBeenCalled();
  });

  it('accepts wallet_switchEthereumChain for a configured custom chain', async () => {
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
    expect(evmRequestWithoutConfirmationMock).toHaveBeenCalledWith(
      requestHandler,
      7,
      request,
      dappInfo,
    );
  });
});
