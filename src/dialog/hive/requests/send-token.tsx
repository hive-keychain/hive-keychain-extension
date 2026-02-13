import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { RequestId, RequestSendToken } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import React, { useEffect, useState } from 'react';
import AmountWithLogo from 'src/common-ui/amount-with-logo/amount-with-logo';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import RequestItem from 'src/dialog/components/request-item/request-item';
import RequestTokenBalance from 'src/dialog/components/request-token-balance/request-token-balance';
import Operation from 'src/dialog/hive/operation/operation';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';
import { useTransferCheck } from 'src/dialog/hooks/transfer-check';
import FormatUtils from 'src/utils/format.utils';

type Props = {
  data: RequestSendToken & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  hiveEngineConfig: HiveEngineConfig;
  afterCancel: (requestId: number, tab: number) => void;
  accounts?: string[];
};

const SendToken = (props: Props) => {
  const { data, rpc, hiveEngineConfig, accounts } = props;
  const { memo } = data;
  const header = useTransferCheck(data, rpc);
  const anonymousProps = useAnonymousRequest(data, accounts);
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

  const renderUsername = () => {
    return !accounts && data.username ? (
      <>
        <UsernameWithAvatar
          title="dialog_account"
          username={anonymousProps.username}
        />
        <Separator type={'horizontal'} fullSize />
      </>
    ) : (
      <></>
    );
  };

  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_token')}
      {...anonymousProps}
      {...props}
      header={header}
      redHeader>
      {renderUsername()}
      <UsernameWithAvatar title="dialog_to" username={data.to} />
      <Separator type={'horizontal'} fullSize />
      <AmountWithLogo
        title="dialog_amount"
        amount={FormatUtils.formatCurrencyValue(data.amount, precision, true)}
        symbol={data.currency}
      />
      <Separator type={'horizontal'} fullSize />
      <RequestTokenBalance
        username={anonymousProps.username}
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
