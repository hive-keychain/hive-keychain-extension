import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';

export interface HiveAppStatus {
  processingDecryptAccount: boolean;
  priceLoaded: boolean;
  globalPropertiesLoaded: boolean;
  isLedgerSupported: boolean;
}
const INITIAL_STATE: HiveAppStatus = {
  processingDecryptAccount: false,
  priceLoaded: false,
  globalPropertiesLoaded: false,
  isLedgerSupported: false,
};

export const AppStatusReducer = (
  state: HiveAppStatus = INITIAL_STATE,
  { type, payload }: ActionPayload<Partial<HiveAppStatus>>,
) => {
  switch (type) {
    case HiveActionType.SET_APP_STATUS:
      return { ...state, ...payload };
    default:
      return state;
  }
};
