import { Screen } from '@interfaces/screen.interface';
import { AccountCreationMode } from '@popup/hive/utils/account-creation.utils';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { defaultChainList } from '@popup/multichain/reference-data/chains.list';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { navigateToPaidHiveAccountCreation } from 'src/popup/multichain/actions/hive-promotion.actions';

describe('hive-promotion.actions tests:\n', () => {
  const hiveChain = defaultChainList.find(
    (chain) => chain.type === ChainType.HIVE,
  )!;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('sets up Hive, switches active chain, and routes to paid Hive account creation', async () => {
    jest.spyOn(ChainUtils, 'getDefaultChains').mockResolvedValue([hiveChain]);
    const addChainSpy = jest
      .spyOn(ChainUtils, 'addChainToSetupChains')
      .mockResolvedValue(undefined);
    const fakeStore = getFakeStore(initialEmptyStateStore);

    await fakeStore.dispatch<any>(navigateToPaidHiveAccountCreation());

    expect(addChainSpy).toHaveBeenCalledWith(hiveChain);
    expect(fakeStore.getState().chain).toEqual(hiveChain);
    expect(fakeStore.getState().navigation).toEqual({
      params: { mode: AccountCreationMode.PAID_BACKEND_CREATION },
      stack: [
        {
          currentPage: Screen.CREATE_ACCOUNT_PAGE_STEP_ONE,
          params: { mode: AccountCreationMode.PAID_BACKEND_CREATION },
        },
      ],
    });
  });

  it('throws when the Hive chain is unavailable', async () => {
    jest.spyOn(ChainUtils, 'getDefaultChains').mockResolvedValue([]);
    const addChainSpy = jest.spyOn(ChainUtils, 'addChainToSetupChains');
    const fakeStore = getFakeStore(initialEmptyStateStore);

    await expect(
      fakeStore.dispatch<any>(navigateToPaidHiveAccountCreation()),
    ).rejects.toThrow('hive_chain_not_found');

    expect(addChainSpy).not.toHaveBeenCalled();
  });
});
