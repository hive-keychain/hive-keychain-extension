import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { RequestId, RequestSendToken } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import React, { useEffect, useState } from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';
import RequestTokenBalance from 'src/dialog/components/request-token-balance/request-token-balance';
import { useTransferCheck } from 'src/dialog/hooks/transfer-check';
import FormatUtils from 'src/utils/format.utils';

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
  const [precision, setPrecision] = useState(3);
  let memoField = memo;
  if (memo.length) {
    if (memo.startsWith('#')) {
      memoField = `${memo} (${chrome.i18n.getMessage('popup_encrypted')})`;
    }
  } else {
    memoField = chrome.i18n.getMessage('popup_empty');
  }

  useEffect(() => {
    TokensUtils.getTokenPrecision(data.currency).then((precision) => {
      data.amount = parseFloat(data.amount).toFixed(precision);
      setPrecision(precision);
    });
  }, []);

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
        content={`${FormatUtils.formatCurrencyValue(
          data.amount,
          precision,
          true,
        )} ${data.currency}`}
      />
      <Separator type={'horizontal'} fullSize />
      <RequestTokenBalance
        username={data.username}
        amount={parseFloat(data.amount)}
        currency={data.currency}
        precision={precision}
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
