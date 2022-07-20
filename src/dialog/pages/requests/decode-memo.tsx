import {
  KeychainKeyTypesLC,
  RequestDecode,
  RequestId,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';

type Props = {
  data: RequestDecode & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const DecodeMemo = (props: Props) => {
  const { data, domain } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_decode')}
      header={chrome.i18n.getMessage('dialog_desc_verify', [
        domain,
        data.method,
        data.username,
      ])}
      {...props}
      canWhitelist={data.method.toLowerCase() !== KeychainKeyTypesLC.active}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <RequestItem title="dialog_key" content={data.method} />
      {/* <RequestItem title="dialog_message" content={data.message} /> */}
    </Operation>
  );
};

export default DecodeMemo;
