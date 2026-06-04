import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EvmAccountsReducer } from '@popup/evm/reducers/accounts.reducer';
import { EvmActiveAccountReducer } from '@popup/evm/reducers/active-account.reducer';
import { AppStatusReducer } from '@popup/evm/reducers/app-status.reducer';
import { EvmPricesReducer } from '@popup/evm/reducers/prices.reducer';

describe('EVM reducers reset state', () => {
  it('resets EVM accounts', () => {
    const state = EvmAccountsReducer(
      [{ id: 1, wallet: { address: '0x1' } } as never],
      { type: EvmActionType.RESET_STATE } as never,
    );

    expect(state).toEqual([]);
  });

  it('resets active EVM account', () => {
    const state = EvmActiveAccountReducer(
      {
        address: '0x123',
        wallet: { address: '0x123' },
        nativeAndErc20Tokens: { value: [{ symbol: 'ETH' }], loading: false },
        nfts: { value: [{ id: 1 }], loading: false, initialized: true },
        history: {
          value: { events: [{ hash: '0xabc' }], nextCursor: 'cursor' },
          loading: false,
          initialized: true,
        },
        isReady: true,
      } as never,
      { type: EvmActionType.RESET_STATE } as never,
    );

    expect(state.address).toBe('');
    expect(state.wallet).toEqual({});
    expect(state.nativeAndErc20Tokens.value).toEqual([]);
    expect(state.nfts.value).toEqual([]);
    expect(state.history.value.events).toEqual([]);
    expect(state.isReady).toBe(false);
  });

  it('resets EVM app status', () => {
    const state = AppStatusReducer(
      { processingDecryptAccount: true, isLedgerSupported: true },
      { type: EvmActionType.RESET_STATE } as never,
    );

    expect(state).toEqual({
      processingDecryptAccount: false,
      isLedgerSupported: false,
    });
  });

  it('resets EVM prices', () => {
    const state = EvmPricesReducer(
      { ETH: { usd: 1000 }, HIVE: { usd: 0.21 } },
      { type: EvmActionType.RESET_STATE } as never,
    );

    expect(state).toEqual({});
  });
});
