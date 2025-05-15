import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { GlobalProperties } from 'hive-keychain-commons';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';

const GlobalPropertiesReducer = (
  state: GlobalProperties = {},
  { type, payload }: ActionPayload<GlobalProperties>,
): GlobalProperties => {
  switch (type) {
    case HiveActionType.LOAD_GLOBAL_PROPS:
      return payload!;
    default:
      return state;
  }
};

export default GlobalPropertiesReducer;
