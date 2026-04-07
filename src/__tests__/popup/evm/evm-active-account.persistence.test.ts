import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EvmActiveAccountUtils } from '@popup/evm/utils/evm-active-account.utils';
import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { store } from 'src/popup/multichain/store';

const evmChainFixture: EvmChain = {
  name: 'Ethereum',
  type: ChainType.EVM,
  logo: '',
  chainId: '0x1',
  rpcs: [],
  mainToken: 'ETH',
  defaultTransactionType: 2 as any,
};

const secondEvmChainFixture: EvmChain = {
  ...evmChainFixture,
  name: 'Polygon',
  chainId: '0x89',
  mainToken: 'POL',
};

describe('EVM active account persistence', () => {
  beforeEach(() => {
    jest.restoreAllMocks();

    store.dispatch({
      type: MultichainActionType.SET_CHAIN,
      payload: {
        name: '',
        type: ChainType.NONE,
        logo: '',
        chainId: '',
        rpcs: [],
      },
    });
    store.dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: { address: '', wallet: {} as any },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('saves the EVM active account when the user selects one', () => {
    const saveActiveAccountWalletSpy = jest
      .spyOn(EvmActiveAccountUtils, 'saveActiveAccountWallet')
      .mockResolvedValue(undefined as never);

    store.dispatch({
      type: MultichainActionType.SET_CHAIN,
      payload: evmChainFixture,
    });
    store.dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: {
        address: '0x123',
        wallet: { address: '0x123' } as any,
      },
    });

    expect(saveActiveAccountWalletSpy).toHaveBeenCalledWith(
      evmChainFixture,
      '0x123',
    );
  });

  it('saves the current address again when switching to another EVM chain', () => {
    const saveActiveAccountWalletSpy = jest
      .spyOn(EvmActiveAccountUtils, 'saveActiveAccountWallet')
      .mockResolvedValue(undefined as never);

    store.dispatch({
      type: MultichainActionType.SET_CHAIN,
      payload: evmChainFixture,
    });
    store.dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: {
        address: '0x123',
        wallet: { address: '0x123' } as any,
      },
    });

    saveActiveAccountWalletSpy.mockClear();

    store.dispatch({
      type: MultichainActionType.SET_CHAIN,
      payload: secondEvmChainFixture,
    });

    expect(saveActiveAccountWalletSpy).toHaveBeenCalledWith(
      secondEvmChainFixture,
      '0x123',
    );
  });
});
