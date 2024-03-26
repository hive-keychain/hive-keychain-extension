import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';

export const PhishingReducer = (
  state: string[] = [],
  { type, payload }: ActionPayload<string[]>,
) => {
  switch (type) {
    case ActionType.FETCH_PHISHING_ACCOUNTS:
      return payload!;
    default:
      return state;
  }
};
