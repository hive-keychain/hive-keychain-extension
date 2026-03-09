import {
  KeychainKeyTypesLC,
  RequestDecode,
  RequestId,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
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
      <UsernameWithAvatar title="dialog_account" username={data.username} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_key" content={data.method} />
      {/* <RequestItem title="dialog_message" content={data.message} /> */}
    </Operation>
  );
};

export default DecodeMemo;
