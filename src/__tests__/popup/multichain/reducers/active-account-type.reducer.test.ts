import { setActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { ActiveAccountTypeReducer } from '@popup/multichain/reducers/active-account-type.reducer';

describe('ActiveAccountTypeReducer', () => {
  it('defaults to Hive', () => {
    expect(ActiveAccountTypeReducer(undefined, {} as never)).toBe(
      ChainType.HIVE,
    );
  });

  it('sets the active account type', () => {
    expect(
      ActiveAccountTypeReducer(
        ChainType.HIVE,
        setActiveAccountType(ChainType.EVM),
      ),
    ).toBe(ChainType.EVM);
  });
});
