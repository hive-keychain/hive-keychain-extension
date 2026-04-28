import { Screen } from '@interfaces/screen.interface';
import { AccountCreationMode } from '@popup/hive/utils/account-creation.utils';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setChain } from '@popup/multichain/actions/chain.actions';
import {
  Chain,
  ChainType,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';

const getHiveChain = async (): Promise<HiveChain> => {
  const defaultChains = await ChainUtils.getDefaultChains();
  const hiveChain = defaultChains.find(
    (chain: Chain) => chain.type === ChainType.HIVE,
  );

  if (!hiveChain) {
    throw new Error('hive_chain_not_found');
  }

  return hiveChain as HiveChain;
};

export const navigateToPaidHiveAccountCreation =
  (): AppThunk<Promise<void>> => async (dispatch) => {
    const hiveChain = await getHiveChain();
    await ChainUtils.addChainToSetupChains(hiveChain);
    await dispatch(setChain(hiveChain));
    await dispatch(
      navigateToWithParams(
        Screen.CREATE_ACCOUNT_PAGE_STEP_ONE,
        { mode: AccountCreationMode.PAID_BACKEND_CREATION },
        true,
      ),
    );
  };

export const HivePromotionActions = {
  navigateToPaidHiveAccountCreation,
};
