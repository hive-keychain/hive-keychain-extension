import { EvmRequestItem } from '@dialog/evm/components/evm-request-item/evm-request-item';
import { EvmOperation } from '@dialog/evm/evm-operation/evm-operation';
import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmInputDisplayType } from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React, { useEffect, useState } from 'react';
import { ChainLogo } from 'src/common-ui/chain-logo/chain-logo.component';

interface Props {
  request: EvmRequest;
  data: EvmRequestMessage;
  afterCancel: (requestId: number, tab: number) => void;
}

const getRequestedChainId = (request: EvmRequest): string =>
  ((request.params?.[0] as { chainId?: string } | undefined)?.chainId ??
    request.chainId ??
    '') as string;

export const SwitchChain = ({ request, data, afterCancel }: Props) => {
  const [chain, setChain] = useState<EvmChain | null>(null);
  const requestedChainId = getRequestedChainId(request);

  useEffect(() => {
    let mounted = true;

    const loadChain = async () => {
      if (!requestedChainId) return;
      const requestedChain =
        await ChainUtils.getChain<EvmChain>(requestedChainId);
      if (mounted) {
        setChain(requestedChain);
      }
    };

    void loadChain();

    return () => {
      mounted = false;
    };
  }, [requestedChainId]);

  const handleCancel = () => {
    afterCancel(request.request_id, data.tab);
  };

  return (
    <EvmOperation
      request={request}
      domain={data.dappInfo.domain}
      origin={data.dappInfo.origin}
      tab={data.tab}
      afterCancel={handleCancel}
      title={chrome.i18n.getMessage('evm_switch_chain')}
      caption={chrome.i18n.getMessage('evm_switch_chain_caption', [
        data.dappInfo.domain,
      ])}
      fields={
        <>
          <EvmRequestItem
            field={{
              name: 'evm_chain',
              type: EvmInputDisplayType.STRING,
              value: (
                <div className="value-content">
                  {chain && (
                    <ChainLogo
                      chainName={chain.name}
                      logoUri={chain.logo}
                      className="chain-logo"
                    />
                  )}
                  <div className="chain-name">
                    {chain?.name ?? requestedChainId}
                  </div>
                </div>
              ),
            }}
          />
          <EvmRequestItem
            field={{
              name: 'evm_chain_id',
              type: EvmInputDisplayType.STRING,
              value: requestedChainId,
            }}
          />
        </>
      }
    />
  );
};
