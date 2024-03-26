import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { GlobalProperties } from 'src/interfaces/global-properties.interface';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';

const GlobalPropertiesReducer = (
  state: GlobalProperties = {},
  { type, payload }: ActionPayload<GlobalProperties>,
): GlobalProperties => {
  switch (type) {
    case ActionType.LOAD_GLOBAL_PROPS:
      return payload!;
    default:
      return state;
  }
};

export default GlobalPropertiesReducer;
