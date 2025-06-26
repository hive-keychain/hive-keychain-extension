import { RequestId, RequestTransfer } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import Operation from 'src/dialog/components/operation/operation';
import RequestBalance from 'src/dialog/components/request-balance/request-balance';
import RequestItem from 'src/dialog/components/request-item/request-item';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';
import { useTransferCheck } from 'src/dialog/hooks/transfer-check';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';

type Props = {
  data: RequestTransfer & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

const Transfer = (props: Props) => {
  const { data, accounts, rpc } = props;
  const { memo } = data;
  const anonymousProps = useAnonymousRequest(data, accounts);
  const header = useTransferCheck(data, rpc);

  let memoField = memo;
  if (memo.length) {
    if (memo.startsWith('#')) {
      memoField = `${memo} (${chrome.i18n.getMessage('popup_encrypted')})`;
    }
  } else {
    memoField = chrome.i18n.getMessage('popup_empty');
  }

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
      title={chrome.i18n.getMessage('dialog_title_transfer')}
      header={header}
      redHeader
      {...anonymousProps}
      {...props}>
      {renderUsername()}
      <UsernameWithAvatar title="dialog_to" username={data.to} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem
        title="dialog_amount"
        content={`${FormatUtils.formatCurrencyValue(
          data.amount,
        )} ${CurrencyUtils.getCurrencyLabel(data.currency, rpc.testnet)}`}
      />
      <Separator type={'horizontal'} fullSize />
      <RequestBalance
        username={anonymousProps.username}
        rpc={props.rpc}
        amount={parseFloat(data.amount)}
        currency={data.currency}
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

export default Transfer;
