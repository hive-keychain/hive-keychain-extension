import {
  KeychainKeyTypesLC,
  RequestCustomJSON,
  RequestId,
} from '@interfaces/keychain.interface';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';

type Props = {
  data: RequestCustomJSON & RequestId;
  domain: string;
  tab: number;
  testnet: boolean;
};

const CustomJson = (props: Props) => {
  const { data } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_decode')}
      header={data.display_msg}
      {...props}
      canWhitelist={data.method.toLowerCase() !== KeychainKeyTypesLC.active}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <RequestItem title="dialog_key" content={data.method} />
    </Operation>
  );
};

export default CustomJson;
