import {
  KeychainKeyTypesLC,
  RequestEncode,
  RequestId,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import RequestItem from 'src/dialog/components/request-item/request-item';
import Operation from 'src/dialog/hive/operation/operation';

type Props = {
  data: RequestEncode & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const EncodeMemo = (props: Props) => {
  const { data } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_encode')}
      {...props}
      canWhitelist={data.method.toLowerCase() !== KeychainKeyTypesLC.active}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_receiver" content={`@${data.receiver}`} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_key" content={data.method} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_message" content={data.message} />
    </Operation>
  );
};

export default EncodeMemo;
