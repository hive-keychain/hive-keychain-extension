import { RequestId, RequestTransfer } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
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
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_transfer')}
      {...anonymousProps}
      {...props}>
      <RequestItem title="dialog_to" content={`@${data.to}`} />
      <RequestItem
        title="dialog_amount"
        content={`${data.amount} ${data.currency}`}
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
