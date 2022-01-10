import { RequestId, RequestTransfer } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
import RequestBalance from 'src/dialog/components/request-balance/request-balance';
import RequestItem from 'src/dialog/components/request-item/request-item';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';

type Props = {
  data: RequestTransfer & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

const Transfer = (props: Props) => {
  const { data, accounts } = props;
  const { memo } = data;
  const anonymousProps = useAnonymousRequest(data, accounts);
  //TODO: Handle dropdown when not enforced nor encoded
  let memoField = memo;
  if (memo.length) {
    if (memo.startsWith('#')) {
      memoField = `${memo} (${chrome.i18n.getMessage('popup_encrypted')})`;
    }
  } else {
    memoField = chrome.i18n.getMessage('popup_empty');
  }

  const renderUsername = () => {
    return !accounts ? (
      <RequestItem title={'dialog_account'} content={`@${data.username}`} />
    ) : (
      <></>
    );
  };

  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_transfer')}
      {...anonymousProps}
      {...props}>
      {renderUsername()}
      <RequestItem title="dialog_to" content={`@${data.to}`} />
      <RequestItem
        title="dialog_amount"
        content={`${data.amount} ${data.currency}`}
      />
      <RequestBalance
        username={anonymousProps.username}
        rpc={props.rpc}
        amount={parseFloat(data.amount)}
        currency={data.currency}
      />
      {data.memo && data.memo.length ? (
        <RequestItem title="dialog_memo" content={`${memoField}`} />
      ) : (
        <></>
      )}
    </Operation>
  );
};

export default Transfer;
