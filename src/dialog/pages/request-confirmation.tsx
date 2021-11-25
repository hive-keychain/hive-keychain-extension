import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React from 'react';
import AddAccount from 'src/dialog/pages/requests/add-account';
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
      return (
        <AddAccount
          data={data.data}
          testnet={data.testnet}
          tab={data.tab}
          domain={data.domain}
        />
      );
    case KeychainRequestTypes.vote:
      return (
        <Vote
          data={data.data}
          testnet={data.testnet}
          tab={data.tab}
          domain={data.domain}
        />
      );
    default:
      return null;
  }
};

export default RequestConfirmation;
