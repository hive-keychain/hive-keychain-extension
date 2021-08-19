import { ActionType } from '@popup/actions/action-type.enum';
import { actionPayload } from '@popup/actions/interfaces';
import { GlobalProperties } from 'src/interfaces/global-properties.interface';

const GlobalPropertiesReducer = (
  state: GlobalProperties = {},
  { type, payload }: actionPayload<GlobalProperties>,
): GlobalProperties => {
  switch (type) {
    case ActionType.LOAD_GLOBAL_PROPS:
      return payload!;
    default:
      return state;
  }
};

export default GlobalPropertiesReducer;
