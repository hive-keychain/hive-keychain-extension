import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';
import { GlobalProperties } from 'src/interfaces/global-properties.interface';

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
