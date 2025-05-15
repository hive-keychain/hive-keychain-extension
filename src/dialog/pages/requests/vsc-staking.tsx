import { RequestId, RequestVscStaking } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { FormatUtils, VscStakingOperation } from 'hive-keychain-commons';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';
import RequestVscBalance from 'src/dialog/components/request-vsc-balance/request-vsc-balance';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';

type Props = {
  data: RequestVscStaking & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

const VscStaking = (props: Props) => {
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

  const renderVscBalances = () => {
    if (data.operation === VscStakingOperation.STAKING) {
      return (
        <>
          <Separator type={'horizontal'} fullSize />
          <RequestVscBalance
            username={anonymousProps.username}
            amount={parseFloat(data.amount)}
            currency={'hbd'}
          />
          {data.to === `hive:${anonymousProps.username}` && (
            <>
              <Separator type={'horizontal'} fullSize />
              <RequestVscBalance
                username={anonymousProps.username}
                amount={parseFloat(data.amount)}
                receiver
                currency={'hbd_savings'}
              />
            </>
          )}
        </>
      );
    } else {
      return (
        <>
          <Separator type={'horizontal'} fullSize />
          <RequestVscBalance
            username={anonymousProps.username}
            amount={parseFloat(data.amount)}
            currency={'hbd_savings'}
          />
        </>
      );
    }
  };

  return (
    <Operation
      title={chrome.i18n.getMessage(
        `dialog_title_vsc_${data.operation.toLowerCase()}`,
      )}
      header={chrome.i18n.getMessage(
        `dialog_title_vsc_${data.operation.toLowerCase()}_header`,
        [data.currency],
      )}
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
      {renderVscBalances()}
      {data.netId ? (
        <>
          <Separator type={'horizontal'} fullSize />
          <RequestItem title="dialog_netid" content={data.netId} />
        </>
      ) : undefined}
    </Operation>
  );
};

export default VscStaking;
