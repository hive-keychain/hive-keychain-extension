import {
  KeychainKeyTypesLC,
  RequestEncodeWithKeys,
  RequestId,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import RequestItem, {
  RequestItemType,
} from 'src/dialog/components/request-item/request-item';
import Operation from 'src/dialog/hive/operation/operation';

import { I18nUtils } from 'src/utils/i18n.utils';
type Props = {
  data: RequestEncodeWithKeys & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  afterCancel: (requestId: number, tab: number) => void;
};

const EncodeWithKeys = (props: Props) => {
  const { data } = props;
  return (
    <Operation
      title={I18nUtils.getMessage('dialog_title_encode_multisig')}
      {...props}
      canWhitelist={data.method.toLowerCase() !== KeychainKeyTypesLC.active}>
      <UsernameWithAvatar title="dialog_account" username={data.username} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem
        title="dialog_public_keys"
        content={data.publicKeys}
        type={RequestItemType.LIST}
      />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_key" content={data.method} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_message" content={data.message} />
    </Operation>
  );
};

export default EncodeWithKeys;
