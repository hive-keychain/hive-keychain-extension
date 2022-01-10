import {
  KeychainKeyTypesLC,
  RequestCustomJSON,
  RequestId,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import CollaspsibleItem from 'src/dialog/components/collapsible-item/collapsible-item';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';

type Props = {
  data: RequestCustomJSON & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

const CustomJson = (props: Props) => {
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
      title={chrome.i18n.getMessage('dialog_title_custom')}
      header={data.display_msg}
      {...anonymousProps}
      {...props}
      canWhitelist={data.method.toLowerCase() !== KeychainKeyTypesLC.active}>
      {renderUsername()}
      <RequestItem title="dialog_key" content={data.method} />
      <CollaspsibleItem
        title="dialog_data_toggle"
        preContent={data.id}
        content={JSON.stringify(data.json, undefined, 3)}
        pre
      />
    </Operation>
  );
};

export default CustomJson;
