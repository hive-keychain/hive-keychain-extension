import { KeychainRequest } from '@interfaces/keychain.interface';
import { KeyToUse } from 'src/__tests__/utils-for-testing/enums/enums';
import { KeyNamePopupHtml } from 'src/__tests__/utils-for-testing/types/keys-types';

export interface KeyShowed {
  keyName: KeyNamePopupHtml;
  key: KeyToUse;
  privateKey: string;
}

export interface PropsOperation {
  title: string;
  children: JSX.Element[];
  onConfirm?: () => void;
  data: KeychainRequest;
  domain: string;
  tab: number;
  canWhitelist?: boolean;
  header?: string;
  checkboxLabelOverride?: string;
  accounts?: string[];
  username?: string;
  setUsername?: (username: string) => void;
  redHeader?: boolean;
}
