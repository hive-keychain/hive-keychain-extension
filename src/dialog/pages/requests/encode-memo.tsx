import {
  KeychainKeyTypesLC,
  RequestEncode,
  RequestId,
} from '@interfaces/keychain.interface';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';

type Props = {
  data: RequestEncode & RequestId;
  domain: string;
  tab: number;
  testnet: boolean;
};

const EncodeMemo = (props: Props) => {
  const { data } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_encode')}
      {...props}
      canWhitelist={data.method.toLowerCase() !== KeychainKeyTypesLC.active}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <RequestItem title="dialog_receiver" content={`@${data.receiver}`} />
      <RequestItem title="dialog_key" content={data.method} />
      <RequestItem title="dialog_message" content={data.message} />
    </Operation>
  );
};

export default EncodeMemo;
