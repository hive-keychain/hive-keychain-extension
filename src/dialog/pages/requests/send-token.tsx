import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { RequestId, RequestSendToken } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';
import RequestTokenBalance from 'src/dialog/components/request-token-balance/request-token-balance';
import { useTransferCheck } from 'src/dialog/hooks/transfer-check';

type Props = {
  data: RequestSendToken & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  hiveEngineConfig: HiveEngineConfig;
};

const SendToken = (props: Props) => {
  const { data, rpc, hiveEngineConfig } = props;
  const { memo } = data;
  const header = useTransferCheck(data, rpc);
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
      title={chrome.i18n.getMessage('dialog_title_token')}
      {...props}
      header={header}
      redHeader>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_to" content={`@${data.to}`} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem
        title="dialog_amount"
        content={`${data.amount} ${data.currency}`}
      />
      <Separator type={'horizontal'} fullSize />
      <RequestTokenBalance
        username={data.username}
        amount={parseFloat(data.amount)}
        currency={data.currency}
        hiveEngineConfig={hiveEngineConfig}
      />

      {data.memo && data.memo.length ? (
        <>
          <Separator type={'horizontal'} fullSize />
          <RequestItem title="dialog_memo" content={`${memoField}`} />
        </>
      ) : (
        <></>
      )}
    </Operation>
  );
};

export default SendToken;
