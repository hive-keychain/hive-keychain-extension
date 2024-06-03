import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { ActionPayload } from '@popup/multichain/actions/interfaces';

export interface EvmAppStatus {
  processingDecryptAccount: boolean;
  priceLoaded: boolean;
  isLedgerSupported: boolean;
}
const INITIAL_STATE: EvmAppStatus = {
  processingDecryptAccount: false,
  priceLoaded: false,
  isLedgerSupported: false,
};

export const AppStatusReducer = (
  state: EvmAppStatus = INITIAL_STATE,
  { type, payload }: ActionPayload<Partial<EvmAppStatus>>,
) => {
  switch (type) {
    case EvmActionType.SET_APP_STATUS:
      return { ...state, ...payload };
    case EvmActionType.RESET_APP_STATUS:
      return INITIAL_STATE;
    default:
      return state;
  }
};
