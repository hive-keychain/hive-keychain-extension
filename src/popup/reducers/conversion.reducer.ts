import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';
import { Conversion } from 'src/interfaces/conversion.interface';

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
