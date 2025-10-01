import { RequestId, RequestWitnessVote } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';

type Props = {
  data: RequestWitnessVote & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

const WitnessVote = (props: Props) => {
  const { data, accounts } = props;
  const anonymousProps = useAnonymousRequest(data, accounts);
  const renderUsername = () => {
    return !accounts && data.username ? (
      <>
        <UsernameWithAvatar title={'dialog_account'} username={data.username} />
        <Separator type={'horizontal'} fullSize />
      </>
    ) : (
      <></>
    );
  };
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_wit')}
      {...props}
      {...anonymousProps}>
      {renderUsername()}
      <UsernameWithAvatar title="dialog_witness" username={data.witness} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_vote" content={JSON.stringify(data.vote)} />
    </Operation>
  );
};

export default WitnessVote;
