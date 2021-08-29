import { ActionType } from '@popup/actions/action-type.enum';
import { actionPayload } from '@popup/actions/interfaces';
import { Conversion } from 'src/interfaces/conversion.interface';

const ConversionReducer = (
  state: Conversion[] = [],
  { type, payload }: actionPayload<Conversion[]>,
) => {
  switch (type) {
    case ActionType.FETCH_CONVERSION_REQUESTS:
      return payload!;
    default:
      return state;
  }
};

export default ConversionReducer;
