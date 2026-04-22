import { Card } from '@common-ui/card/card.component';
import { EvmDappInfo, EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { CustomEvmChainForm } from '@popup/evm/pages/home/settings/evm-custom-chains/custom-evm-chain-form.component';
import { ChainListOrgUtils } from '@popup/evm/utils/chain-list-org.utils';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useEffect, useState } from 'react';
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
  const [defaultChain, setDefaultChain] = useState<EvmChain | undefined>(
    undefined,
  );

  useEffect(() => {
    if (initialChain) {
      ChainListOrgUtils.findByChainId(Number(requestedChainId)).then(
        (chain) => {
          if (chain) {
            setDefaultChain({
              chainId: requestedChainId,
              defaultTransactionType: EvmTransactionType.EIP_1559,
              logo: chain.icon
                ? `https://icons.llamao.fi/icons/chains/rsz_${chain.icon}.jpg`
                : undefined,
              rpcs: chain.rpc
                .filter((rpc) => !rpc.url.startsWith('wss://'))
                .map((rpc) => ({
                  url: rpc.url,
                  isDefault: false,
                })),
              mainToken: chain.nativeCurrency.symbol.toUpperCase(),
              name: chain.name,
              type: ChainType.EVM,
              blockExplorer: chain.explorers?.[0]?.url
                ? { url: chain.explorers?.[0]?.url }
                : undefined,
              testnet: chain.isTestnet,
              isCustom: true,
              active: true,
              disableTokensAndHistoryAutoLoading: true,
              addTokensManually: true,
              manualDiscoverAvailable: false,
              manualLoadHistory: false,
              onlyCustomFee: true,
            } as EvmChain);
          }
        },
      );
    }
  }, []);
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
          initialChain={defaultChain ?? { chainId: requestedChainId }}
          submitLabel="dialog_confirm"
        />
      </Card>
    </div>
  );
};
