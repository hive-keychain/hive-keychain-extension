import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EvmAppStatus } from '@popup/evm/reducers/app-status.reducer';

export const setStatus = (newStatus: Partial<EvmAppStatus>) => {
  return {
    type: EvmActionType.SET_APP_STATUS,
    payload: newStatus,
  };
};
