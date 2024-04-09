import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { Conversion } from 'src/interfaces/conversion.interface';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';

const ConversionsReducer = (
  state: Conversion[] = [],
  { type, payload }: ActionPayload<Conversion[]>,
) => {
  switch (type) {
    case HiveActionType.FETCH_CONVERSION_REQUESTS:
      return payload!;
    default:
      return state;
  }
};

export default ConversionsReducer;
