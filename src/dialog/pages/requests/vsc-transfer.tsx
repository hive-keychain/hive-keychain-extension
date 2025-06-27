import { RequestId, RequestVscTransfer } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { FormatUtils } from 'hive-keychain-commons';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';
import RequestVscBalance from 'src/dialog/components/request-vsc-balance/request-vsc-balance';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';

type Props = {
  data: RequestVscTransfer & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

const VscTransfer = (props: Props) => {
  const { data, accounts, rpc } = props;
  const anonymousProps = useAnonymousRequest(data, accounts);

  const renderUsername = () => {
    return !accounts ? (
      <>
        <RequestItem title={'dialog_account'} content={`@${data.username}`} />
        <Separator type={'horizontal'} fullSize />
      </>
    ) : (
      <></>
    );
  };

  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_vsc_transfer')}
      header={chrome.i18n.getMessage('dialog_title_vsc_transfer_header', [
        data.currency,
      ])}
      {...anonymousProps}
      {...props}>
      {renderUsername()}
      <RequestItem title="dialog_to" content={data.to} />
      <Separator type={'horizontal'} fullSize />

      <RequestItem
        title="dialog_amount"
        content={`${FormatUtils.formatCurrencyValue(
          data.amount,
        )} ${CurrencyUtils.getCurrencyLabel(data.currency, rpc.testnet)}`}
      />
      {data.memo.length ? (
        <>
          <Separator type={'horizontal'} fullSize />
          <RequestItem title="dialog_memo" content={data.memo} />
        </>
      ) : undefined}
      <Separator type={'horizontal'} fullSize />
      <RequestVscBalance
        username={anonymousProps.username}
        amount={parseFloat(data.amount)}
        currency={data.currency.toLowerCase() as 'hive' | 'hbd'}
      />
      {data.netId ? (
        <>
          <Separator type={'horizontal'} fullSize />
          <RequestItem title="dialog_netid" content={data.netId} />
        </>
      ) : undefined}
    </Operation>
  );
};

export default VscTransfer;
