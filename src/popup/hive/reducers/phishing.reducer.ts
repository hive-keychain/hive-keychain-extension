import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { ActionPayload } from 'src/popup/hive/actions/interfaces';

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
