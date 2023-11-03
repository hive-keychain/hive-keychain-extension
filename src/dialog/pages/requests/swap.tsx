import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { RequestId, RequestSwap } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
import RequestBalance from 'src/dialog/components/request-balance/request-balance';
import RequestItem from 'src/dialog/components/request-item/request-item';
import RequestTokenBalance from 'src/dialog/components/request-token-balance/request-token-balance';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';

type Props = {
  data: RequestSwap & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  hiveEngineConfig: HiveEngineConfig;
  accounts?: string[];
};

const Swap = (props: Props) => {
  const { data, rpc, hiveEngineConfig, accounts } = props;
  const anonymousProps = useAnonymousRequest(data, accounts);
  const renderUsername = () => {
    return !accounts ? (
      <RequestItem title={'dialog_account'} content={`@${data.username}`} />
    ) : (
      <></>
    );
  };
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_swap')}
      {...props}
      {...anonymousProps}>
      {renderUsername()}
      <RequestItem
        title="dialog_swap"
        content={`${data.amount} ${data.startToken} ==> ${data.endToken}`}
      />
      {['HIVE', 'HBD'].includes(data.startToken) ? (
        <RequestBalance
          username={anonymousProps.username}
          amount={data.amount}
          currency={data.startToken}
          rpc={rpc}
        />
      ) : (
        <RequestTokenBalance
          username={anonymousProps.username}
          amount={data.amount}
          currency={data.startToken}
          hiveEngineConfig={hiveEngineConfig}
        />
      )}
      <RequestItem title="dialog_slippage" content={data.slippage + ''} />
    </Operation>
  );
};

export default Swap;
