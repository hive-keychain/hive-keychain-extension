import { RequestDelegation, RequestId } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';

type Props = {
  data: RequestDelegation & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

const Delegation = (props: Props) => {
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
      title={chrome.i18n.getMessage('dialog_title_delegation')}
      {...props}
      {...anonymousProps}>
      {renderUsername()}
      <RequestItem title="dialog_delegatee" content={`@${data.delegatee}`} />
      <RequestItem
        title="dialog_amount"
        content={`${data.amount} ${data.unit}`}
      />
    </Operation>
  );
};

export default Delegation;
