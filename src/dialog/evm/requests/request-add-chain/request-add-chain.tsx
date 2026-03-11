import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import { Card } from '@common-ui/card/card.component';
import { EvmRequestItem } from '@dialog/evm/components/evm-request-item/evm-request-item';
import { EvmDappInfo, EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmInputDisplayType } from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React from 'react';
import { CommunicationUtils } from 'src/utils/communication.utils';

interface Props {
  request: EvmRequest;
  requestedChain: EvmChain;
  dappInfo: EvmDappInfo;
  tab: number;
}

export const RequestAddEvmChain = (props: Props) => {
  const { request, requestedChain, dappInfo, tab } = props;

  const handleConfirm = () => {
    CommunicationUtils.runtimeSendMessage({
      command: BackgroundCommand.ACCEPT_ADD_EVM_CHAIN,
      value: {
        request: request,
        tab: tab,
        dappInfo: dappInfo,
        requestedChain: requestedChain,
      },
    });
  };

  const handleCancel = () => {
    CommunicationUtils.runtimeSendMessage({
      command: BackgroundCommand.REJECT_EVM_TRANSACTION,
      value: {
        request,
        tab,
        domain: dappInfo.domain,
      },
    });
    window.close();
  };

  return (
    <div className="request-add-chain-page">
      <Card className="request-add-chain-card">
        <div className="title">
          {chrome.i18n.getMessage('evm_request_add_chain_title')}
        </div>
        <div className="caption">
          {chrome.i18n.getMessage('evm_request_add_chain_caption', [
            dappInfo.domain,
          ])}
        </div>
        <div className="requested-chain">
          <EvmRequestItem
            field={{
              name: chrome.i18n.getMessage('evm_chain'),
              type: EvmInputDisplayType.STRING,
              value: (
                <div className="value-content">
                  <img src={requestedChain.logo} className="chain-logo" />
                  <div className="chain-name">{requestedChain.name}</div>
                </div>
              ),
            }}
          />
          <EvmRequestItem
            field={{
              name: chrome.i18n.getMessage('evm_chain_id'),
              type: EvmInputDisplayType.STRING,
              value: requestedChain.chainId,
            }}
          />
        </div>
      </Card>
      <div className="bottom-panel">
        <ButtonComponent
          label="dialog_cancel"
          type={ButtonType.ALTERNATIVE}
          onClick={handleCancel}
          height="small"
        />
        <ButtonComponent
          type={ButtonType.IMPORTANT}
          label="dialog_confirm"
          onClick={handleConfirm}
          height="small"
        />
      </div>
    </div>
  );
};
