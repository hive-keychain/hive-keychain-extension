import { RequestId, RequestProxy } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import Operation from 'src/dialog/components/operation/operation';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';

type Props = {
  data: RequestProxy & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

const Proxy = (props: Props) => {
  const { data, accounts } = props;
  const anonymousProps = useAnonymousRequest(data, accounts);
  const renderUsername = () => {
    return !accounts && data.username ? (
      <UsernameWithAvatar title={'dialog_account'} username={data.username} />
    ) : (
      <></>
    );
  };

  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_proxy')}
      {...props}
      {...anonymousProps}>
      {renderUsername()}
      <Separator type={'horizontal'} fullSize />

      <UsernameWithAvatar title="popup_proxy" username={data.proxy} />
    </Operation>
  );
};

export default Proxy;
