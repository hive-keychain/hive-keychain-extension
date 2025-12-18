import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { RequestId, RequestSwap } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { SwapConfig, SwapServerStatus } from '@interfaces/swap-token.interface';
import HiveUtils from '@popup/hive/utils/hive.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useEffect, useState } from 'react';
import AmountWithLogo from 'src/common-ui/amount-with-logo/amount-with-logo';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import RequestBalance from 'src/dialog/components/request-balance/request-balance';
import RequestItem from 'src/dialog/components/request-item/request-item';
import RequestTokenBalance from 'src/dialog/components/request-token-balance/request-token-balance';
import Operation from 'src/dialog/hive/operation/operation';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';
import { DialogError } from 'src/dialog/multichain/error/error';
import { CommunicationUtils } from 'src/utils/communication.utils';
import { SwapTokenUtils } from 'src/utils/swap-token.utils';

type Props = {
  data: RequestSwap & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  hiveEngineConfig: HiveEngineConfig;
  accounts?: string[];
  afterCancel: (requestId: number, tab: number) => void;
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
    return !accounts && data.username ? (
      <UsernameWithAvatar title={'dialog_account'} username={data.username} />
    ) : (
      <></>
    );
  };

  const renderOptionalPartnerParams = () => {
    return data.partnerUsername && data.partnerFee ? (
      <>
        <UsernameWithAvatar
          title="swap_partner_username"
          username={data.partnerUsername}
        />
        {/* <RequestItem title="swap_partner_fee" content={data.partnerFee + '%'} /> */}
      </>
    ) : (
      <></>
    );
  };

  const onConfirmSwap = async () => {
    setForceLoading(true);
    CommunicationUtils.runtimeSendMessage({
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
    (swapConfig && data.slippage < swapConfig.slippage.min)
  ) {
    return (
      <DialogError
        data={{
          command: DialogCommand.SEND_DIALOG_ERROR,
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
            tab: props.tab,
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

        <AmountWithLogo
          title="html_popup_swap_swap_from"
          amount={data.amount}
          symbol={data.startToken}
          icon={
            data.startToken === 'HIVE'
              ? SVGIcons.WALLET_HIVE_LOGO
              : SVGIcons.WALLET_HBD_LOGO
          }
        />
        <AmountWithLogo
          title="html_popup_swap_swap_to"
          amount={(
            (data.steps[data.steps.length - 1].estimate *
              (100 - (swapConfig?.fee.amount || 0) - (data.partnerFee || 0))) /
            100
          ).toFixed(HiveUtils.isLayer1Token(data.endToken) ? 3 : 6)}
          symbol={data.endToken}
          icon={
            data.endToken === 'HIVE'
              ? SVGIcons.WALLET_HIVE_LOGO
              : SVGIcons.WALLET_HBD_LOGO
          }
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
        {renderOptionalPartnerParams()}
        {/* <CollaspsibleItem title= */}
        <RequestItem title="dialog_slippage" content={data.slippage + '%'} />
      </Operation>
    );
};

export default Swap;
