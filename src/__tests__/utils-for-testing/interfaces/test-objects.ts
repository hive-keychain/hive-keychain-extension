import { KeyToUse } from 'src/__tests__/utils-for-testing/enums/enums';
import { KeyNamePopupHtml } from 'src/__tests__/utils-for-testing/types/keys-types';

export interface KeyShowed {
  keyName: KeyNamePopupHtml;
  key: KeyToUse;
  privateKey: string;
}
