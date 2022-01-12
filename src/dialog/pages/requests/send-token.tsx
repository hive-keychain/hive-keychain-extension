import { RequestId, RequestSendToken } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';
import RequestTokenBalance from 'src/dialog/components/request-token-balance/request-token-balance';

type Props = {
  data: RequestSendToken & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const SendToken = (props: Props) => {
  const { data } = props;
  const { memo } = data;

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
      {...props}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <RequestItem title="dialog_to" content={`@${data.to}`} />
      <RequestItem
        title="dialog_amount"
        content={`${data.amount} ${data.currency}`}
      />
      <RequestTokenBalance
        username={data.username}
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

export default SendToken;
