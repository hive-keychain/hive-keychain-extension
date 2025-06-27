import {
  KeychainKeyTypesLC,
  RequestId,
  RequestVscCallContract,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import CollaspsibleItem from 'src/dialog/components/collapsible-item/collapsible-item';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';

type Props = {
  data: RequestVscCallContract & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

const VscCallContract = (props: Props) => {
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
      title={chrome.i18n.getMessage('dialog_title_vsc_call_contract')}
      {...anonymousProps}
      {...props}
      loadingCaption="dialog_vsc_loading"
      canWhitelist={data.method.toLowerCase() !== KeychainKeyTypesLC.active}>
      {renderUsername()}
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_key" content={data.method} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_contract_id" content={data.contractId} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_action" content={data.action} />
      <Separator type={'horizontal'} fullSize />
      <CollaspsibleItem
        title="dialog_payload"
        content={JSON.stringify(
          typeof data.payload === 'string'
            ? JSON.parse(data.payload)
            : data.payload,
          undefined,
          3,
        )}
        pre
      />
    </Operation>
  );
};

export default VscCallContract;
