import { Conversion } from 'src/interfaces/conversion.interface';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { ActionPayload } from 'src/popup/hive/actions/interfaces';

const ConversionsReducer = (
  state: Conversion[] = [],
  { type, payload }: ActionPayload<Conversion[]>,
) => {
  switch (type) {
    case ActionType.FETCH_CONVERSION_REQUESTS:
      return payload!;
    default:
      return state;
  }
};

export default ConversionsReducer;
