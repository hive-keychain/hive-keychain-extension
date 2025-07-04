import { RequestAddAccount, RequestId } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import CollaspsibleItem from 'src/dialog/components/collapsible-item/collapsible-item';
import Operation from 'src/dialog/components/operation/operation';

type Props = {
  data: RequestAddAccount & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const AddAccount = (props: Props) => {
  const { data } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('popup_html_add_account')}
      {...props}
      canWhitelist>
      <UsernameWithAvatar title="dialog_account" username={data.username} />
      <Separator type={'horizontal'} fullSize />
      <CollaspsibleItem
        title="dialog_keys"
        content={JSON.stringify(data.keys, undefined, 2)}
        pre
      />
    </Operation>
  );
};

export default AddAccount;
