import { Card } from '@common-ui/card/card.component';
import { EvmDappInfo, EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { CustomEvmChainForm } from '@popup/evm/pages/home/settings/evm-custom-chains/custom-evm-chain-form.component';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React from 'react';
import { CommunicationUtils } from 'src/utils/communication.utils';

interface Props {
  request: EvmRequest;
  dappInfo: EvmDappInfo;
  tab: number;
  requestedChainId: string;
  initialChain?: Partial<EvmChain>;
}

export const RequestAddCustomEvmChain = ({
  request,
  dappInfo,
  tab,
  requestedChainId,
  initialChain,
}: Props) => {
  const handleCancel = async () => {
    await CommunicationUtils.runtimeSendMessage({
      command: BackgroundCommand.REJECT_EVM_TRANSACTION,
      value: {
        request,
        tab,
        domain: dappInfo.domain,
      },
    });
    window.close();
  };

  const handleSubmit = async (chain: EvmChain) => {
    await CommunicationUtils.runtimeSendMessage({
      command: BackgroundCommand.ACCEPT_ADD_CUSTOM_EVM_CHAIN,
      value: {
        request,
        tab,
        dappInfo,
        requestedChain: chain,
      },
    });
    window.close();
  };

  return (
    <div className="request-add-custom-chain-page">
      <Card className="request-add-custom-chain-card">
        <div className="title">
          {chrome.i18n.getMessage('evm_request_add_custom_chain_title')}
        </div>
        <div className="caption">
          {chrome.i18n.getMessage('evm_request_add_custom_chain_caption', [
            dappInfo.domain,
            requestedChainId,
          ])}
        </div>
        <CustomEvmChainForm
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          initialChain={initialChain ?? { chainId: requestedChainId }}
          submitLabel="dialog_confirm"
        />
      </Card>
    </div>
  );
};
