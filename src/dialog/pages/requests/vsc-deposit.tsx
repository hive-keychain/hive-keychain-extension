import { RequestId, RequestVscDeposit } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { FormatUtils } from 'hive-keychain-commons';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import Operation from 'src/dialog/components/operation/operation';
import RequestBalance from 'src/dialog/components/request-balance/request-balance';
import RequestItem from 'src/dialog/components/request-item/request-item';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';

type Props = {
  data: RequestVscDeposit & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

const VscDeposit = (props: Props) => {
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
      title={chrome.i18n.getMessage('dialog_title_vsc_deposit')}
      header={chrome.i18n.getMessage(
        data.to?.startsWith('0x')
          ? 'dialog_title_vsc_deposit'
          : 'dialog_title_vsc_hive_deposit_header',
        [data.currency],
      )}
      {...anonymousProps}
      {...props}>
      {renderUsername()}
      <RequestItem
        title="dialog_to"
        content={data.to || `hive:${anonymousProps.username}`}
      />
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
    </Operation>
  );
};

export default VscDeposit;
