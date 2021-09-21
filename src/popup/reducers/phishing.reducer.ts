import { ActionType } from '@popup/actions/action-type.enum';
import { actionPayload } from '@popup/actions/interfaces';

export const PhishingReducer = (
  state: string[] = [],
  { type, payload }: actionPayload<string[]>,
) => {
  switch (type) {
    case ActionType.FETCH_PHISHING_ACCOUNTS:
      return payload!;
    default:
      return state;
  }
};
