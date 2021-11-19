import { RequestAddAccount } from '@interfaces/keychain.interface';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';

type Props = {
  data: RequestAddAccount;
  domain: string;
  tab: number;
  testnet: boolean;
};

const AddAccount = ({ data, domain, tab, testnet }: Props) => {
  return (
    <Operation
      title={chrome.i18n.getMessage('popup_html_add_account')}
      onConfirm={() => {}}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <RequestItem
        title="dialog_keys"
        content={JSON.stringify(data.keys, undefined, 2)}
        pre
      />
    </Operation>
  );
};

export default AddAccount;
