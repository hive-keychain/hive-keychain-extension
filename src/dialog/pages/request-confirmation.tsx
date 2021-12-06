import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React from 'react';
import AddAccount from 'src/dialog/pages/requests/add-account';
import CustomJson from 'src/dialog/pages/requests/custom-json';
import DecodeMemo from 'src/dialog/pages/requests/decode-memo';
import EncodeMemo from 'src/dialog/pages/requests/encode-memo';
import SignBuffer from 'src/dialog/pages/requests/sign-buffer';
import Vote from 'src/dialog/pages/requests/vote';
import './unlock.scss';

type Props = {
  data: RequestMessage;
};

type RequestMessage = {
  command: DialogCommand.SEND_DIALOG_CONFIRM;
  data: KeychainRequest;
  testnet: boolean;
  tab: number;
  domain: string;
};

const RequestConfirmation = ({ data }: Props) => {
  switch (data.data.type) {
    case KeychainRequestTypes.addAccount:
      return <AddAccount {...data} data={data.data} />;
    case KeychainRequestTypes.vote:
      return <Vote {...data} data={data.data} />;
    case KeychainRequestTypes.decode:
      return <DecodeMemo {...data} data={data.data} />;
    case KeychainRequestTypes.encode:
      return <EncodeMemo {...data} data={data.data} />;
    case KeychainRequestTypes.custom:
      return <CustomJson {...data} data={data.data} />;
    case KeychainRequestTypes.signBuffer:
      return <SignBuffer {...data} data={data.data} />;
    default:
      return null;
  }
};

export default RequestConfirmation;
