import RpcUtils from '@popup/hive/utils/rpc.utils';
import { store } from '@popup/multichain/store';
import { AsyncUtils } from 'src/utils/async.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { useWorkingRPC } from 'src/utils/rpc-switcher.utils';

jest.mock('@popup/hive/actions/active-rpc.actions', () => ({
  setActiveRpc: jest.fn((rpc: unknown) => ({
    type: 'SET_ACTIVE_RPC',
    payload: rpc,
  })),
}));

jest.mock('@popup/hive/actions/rpc-switcher', () => ({
  setSwitchToRpc: jest.fn((rpc: unknown) => ({
    type: 'SET_SWITCH_TO_RPC',
    payload: rpc,
  })),
  setDisplayChangeRpcPopup: jest.fn((display: boolean) => ({
    type: 'SET_DISPLAY_SWITCH_RPC',
    payload: display,
  })),
}));

jest.mock('@popup/multichain/store', () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
  },
}));

jest.mock('@popup/hive/utils/rpc.utils', () => ({
  __esModule: true,
  default: {
    getFullList: jest.fn(),
    checkRpcStatus: jest.fn(),
  },
}));

jest.mock('src/utils/localStorage.utils', () => ({
  __esModule: true,
  default: {
    getValueFromLocalStorage: jest.fn(),
  },
}));

jest.mock('src/utils/async.utils', () => ({
  AsyncUtils: {
    sleep: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('useWorkingRPC', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue(
      true,
    );
    (store.getState as jest.Mock).mockReturnValue({
      hive: { activeRpc: { uri: 'https://current.rpc', testnet: false } },
    });
    (RpcUtils.getFullList as jest.Mock).mockReturnValue([
      { uri: 'https://current.rpc', testnet: false },
      { uri: 'https://alt.rpc', testnet: false },
      { uri: 'https://testnet.rpc', testnet: true },
    ]);
    (RpcUtils.checkRpcStatus as jest.Mock).mockResolvedValue(true);
  });

  it('dispatches setActiveRpc when auto-switch is enabled and a working RPC is found', async () => {
    await useWorkingRPC();

    expect(AsyncUtils.sleep).toHaveBeenCalledWith(1000);
    expect(RpcUtils.checkRpcStatus).toHaveBeenCalledWith('https://alt.rpc');
    expect(store.dispatch).toHaveBeenCalled();
    const dispatched = (store.dispatch as jest.Mock).mock.calls.map((c) => c[0]);
    expect(dispatched.some((a) => a.type === 'SET_ACTIVE_RPC')).toBe(true);
  });

  it('dispatches switch popup flow when auto-switch is disabled', async () => {
    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue(
      false,
    );

    await useWorkingRPC();

    const dispatched = (store.dispatch as jest.Mock).mock.calls.map((c) => c[0]);
    expect(dispatched.some((a) => a.type === 'SET_SWITCH_TO_RPC')).toBe(true);
    expect(dispatched.some((a) => a.type === 'SET_DISPLAY_SWITCH_RPC')).toBe(
      true,
    );
  });

  it('uses explicit activeRpc instead of store when provided', async () => {
    (RpcUtils.getFullList as jest.Mock).mockReturnValue([
      { uri: 'https://explicit.rpc', testnet: false },
      { uri: 'https://next.rpc', testnet: false },
    ]);

    await useWorkingRPC({ uri: 'https://explicit.rpc', testnet: false } as any);

    expect(RpcUtils.checkRpcStatus).toHaveBeenCalledWith('https://next.rpc');
    expect(store.getState).not.toHaveBeenCalled();
  });

  it('tries further RPCs when earlier ones fail until one succeeds', async () => {
    (RpcUtils.getFullList as jest.Mock).mockReturnValue([
      { uri: 'https://current.rpc', testnet: false },
      { uri: 'https://bad.rpc', testnet: false },
      { uri: 'https://good.rpc', testnet: false },
    ]);
    (RpcUtils.checkRpcStatus as jest.Mock)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await useWorkingRPC();

    expect(RpcUtils.checkRpcStatus).toHaveBeenCalledWith('https://bad.rpc');
    expect(RpcUtils.checkRpcStatus).toHaveBeenCalledWith('https://good.rpc');
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('does not dispatch when no alternative RPC responds', async () => {
    (RpcUtils.checkRpcStatus as jest.Mock).mockResolvedValue(false);

    await useWorkingRPC();

    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
