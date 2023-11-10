import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { RequestId, RequestSwap } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { SwapConfig, SwapServerStatus } from '@interfaces/swap-token.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useEffect, useState } from 'react';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import Operation from 'src/dialog/components/operation/operation';
import RequestBalance from 'src/dialog/components/request-balance/request-balance';
import RequestItem from 'src/dialog/components/request-item/request-item';
import RequestTokenBalance from 'src/dialog/components/request-token-balance/request-token-balance';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';
import DialogError from 'src/dialog/pages/error';
import HiveUtils from 'src/utils/hive.utils';
import { SwapTokenUtils } from 'src/utils/swap-token.utils';

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
  const [serverStatus, setServerStatus] = useState<SwapServerStatus>();
  const [swapConfig, setSwapConfig] = useState<SwapConfig>();
  const [forceLoading, setForceLoading] = useState(false);
  useEffect(() => {
    SwapTokenUtils.getServerStatus()
      .then((s) => {
        setServerStatus(s);
      })
      .catch(() =>
        setServerStatus({
          isServerStopped: true,
          isMaintenanceOn: false,
          layerTwoDelayed: false,
        }),
      );
    SwapTokenUtils.getConfig().then((c) => setSwapConfig(c));
  }, []);

  const renderUsername = () => {
    return !accounts ? (
      <RequestItem title={'dialog_account'} content={`@${data.username}`} />
    ) : (
      <></>
    );
  };

  const onConfirmSwap = async () => {
    setForceLoading(true);
    chrome.runtime.sendMessage({
      command: BackgroundCommand.ACCEPT_TRANSACTION,
      value: {
        data: {
          ...data,
          username: anonymousProps.username,
          swapAccount: swapConfig?.account,
        },
        tab: props.tab,
        domain: props.domain,
        keep: false,
      },
    });
  };

  if (
    !serverStatus ||
    (!swapConfig &&
      !serverStatus.isMaintenanceOn &&
      !serverStatus.isServerStopped) ||
    forceLoading
  )
    return <LoadingComponent />;
  else if (
    serverStatus.isMaintenanceOn ||
    serverStatus.isServerStopped ||
    (swapConfig && data.slippage > swapConfig.slippage.min)
  ) {
    return (
      <DialogError
        data={{
          msg: {
            display_msg: chrome.i18n.getMessage(
              serverStatus.isMaintenanceOn
                ? 'swap_under_maintenance'
                : serverStatus.isServerStopped
                ? 'service_unavailable_message'
                : 'swap_min_slippage_error',
              swapConfig && data.slippage > swapConfig!.slippage.min
                ? [swapConfig?.slippage?.min + '']
                : undefined,
            ),
          },
        }}
      />
    );
  } else
    return (
      <Operation
        title={chrome.i18n.getMessage('dialog_title_swap')}
        {...props}
        header={
          serverStatus.layerTwoDelayed
            ? chrome.i18n.getMessage('swap_layer_two_delayed')
            : ''
        }
        redHeader
        onConfirm={onConfirmSwap}
        {...anonymousProps}>
        {renderUsername()}
        <RequestItem
          title="dialog_swap"
          content={`${data.amount} ${data.startToken} ==> ${data.steps[
            data.steps.length - 1
          ].estimate.toFixed(HiveUtils.isLayer1Token(data.endToken) ? 3 : 6)} ${
            data.endToken
          }`}
        />
        {HiveUtils.isLayer1Token(data.startToken) ? (
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
        <RequestItem title="dialog_slippage" content={data.slippage + '%'} />
        <RequestItem title="swap_fee" content={swapConfig?.fee.amount + '%'} />
      </Operation>
    );
};

export default Swap;
