import { EvmErc20TokenBalanceWithPrice } from '@moralisweb3/common-evm-utils';
import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { ActionPayload } from '@popup/multichain/actions/interfaces';

const EvmActiveAccountReducer = (
  state: EvmErc20TokenBalanceWithPrice[] = [],
  { type, payload }: ActionPayload<EvmErc20TokenBalanceWithPrice[]>,
): EvmErc20TokenBalanceWithPrice[] => {
  switch (type) {
    case EvmActionType.GET_ACTIVE_ACCOUNT:
      return payload!;
    default:
      return state;
  }
};

export default EvmActiveAccountReducer;
