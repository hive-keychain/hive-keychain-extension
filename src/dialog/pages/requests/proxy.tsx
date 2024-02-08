import { RequestId, RequestProxy } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';
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
    return !accounts ? (
      <RequestItem title={'dialog_account'} content={`@${data.username}`} />
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

      <RequestItem
        title="popup_proxy"
        content={
          data.proxy.length
            ? `@${data.proxy}`
            : chrome.i18n.getMessage('popup_none')
        }
      />
    </Operation>
  );
};

export default Proxy;
