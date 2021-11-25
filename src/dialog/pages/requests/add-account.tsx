import { RequestAddAccount, RequestId } from '@interfaces/keychain.interface';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';

type Props = {
  data: RequestAddAccount & RequestId;
  domain: string;
  tab: number;
  testnet: boolean;
};

const AddAccount = (props: Props) => {
  const { data } = props;
  console.log(props);
  return (
    <Operation
      title={chrome.i18n.getMessage('popup_html_add_account')}
      {...props}>
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
