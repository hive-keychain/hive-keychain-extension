import { Card } from '@common-ui/card/card.component';
import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmCustomToken } from '@popup/evm/interfaces/evm-custom-tokens.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmCustomErc20Form,
  EvmCustomErc20FormData,
  EvmCustomErc20FormRef,
} from '@popup/evm/pages/home/evm-add-custom-asset-popup/evm-custom-erc20-form.component';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { CommunicationUtils } from 'src/utils/communication.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
interface WatchAssetOptions {
  address: string;
  symbol?: string;
  decimals?: number;
  image?: string;
}

interface WatchAssetRequest {
  type: string;
  options: WatchAssetOptions;
}

interface Props {
  request: EvmRequest<WatchAssetRequest>;
  data: EvmRequestMessage;
  afterCancel: (requestId: number, tab: number) => void;
}

const getWatchAssetRequest = (
  request: EvmRequest<WatchAssetRequest>,
): WatchAssetRequest | null => {
  const watchAssetRequest = request.params?.[0] as
    | WatchAssetRequest
    | undefined;
  if (
    !watchAssetRequest ||
    watchAssetRequest.type !== EVMSmartContractType.ERC20 ||
    !watchAssetRequest.options ||
    typeof watchAssetRequest.options.address !== 'string'
  ) {
    return null;
  }
  return watchAssetRequest;
};

export const WatchAsset = ({ request, data, afterCancel }: Props) => {
  const [chain, setChain] = useState<EvmChain | null>(null);
  const formRef = useRef<EvmCustomErc20FormRef>(null);
  const watchAssetRequest = getWatchAssetRequest(request);
  const activeWalletAddress = data.accounts?.[0]?.address ?? '';

  useEffect(() => {
    let mounted = true;

    const loadChain = async () => {
      const chainId =
        request.chainId ??
        (await EvmChainUtils.getLastEvmChainIdForOrigin(data.dappInfo.origin));

      if (!chainId) {
        return;
      }

      const activeChain = await ChainUtils.getChain<EvmChain>(chainId);
      if (mounted) {
        setChain(activeChain);
      }
    };

    void loadChain();

    return () => {
      mounted = false;
    };
  }, [data.dappInfo.origin, request]);

  const initialForm = useMemo(
    () => ({
      contractAddress: watchAssetRequest?.options.address ?? '',
      symbol: watchAssetRequest?.options.symbol ?? '',
      decimals: watchAssetRequest?.options.decimals ?? '',
      logo: watchAssetRequest?.options.image ?? '',
    }),
    [watchAssetRequest],
  );

  const handleCancel = () => {
    afterCancel(request.request_id, data.tab);
  };

  const handleSave = async (form: EvmCustomErc20FormData) => {
    if (!chain) {
      throw new Error('Missing EVM chain');
    }

    const token: EvmCustomToken = {
      address: form.contractAddress,
      type: EVMSmartContractType.ERC20,
      metadata: {
        type: EVMSmartContractType.ERC20,
        name: form.name,
        symbol: form.symbol,
        decimals: form.decimals,
        logo: form.logo,
      },
    };

    await EvmTokensUtils.addCustomToken(chain, activeWalletAddress, token);
  };

  const handleConfirm = async () => {
    const saved = await formRef.current?.submit();
    if (!saved) {
      return;
    }

    CommunicationUtils.runtimeSendMessage({
      command: BackgroundCommand.SEND_EVM_RESPONSE_TO_SW,
      value: {
        requestId: request.request_id,
        tab: data.tab,
        origin: data.dappInfo.origin,
        result: true,
      },
    });
  };

  return (
    <EvmOperation
      afterCancel={handleCancel}
      request={request}
      domain={data.dappInfo.domain}
      origin={data.dappInfo.origin}
      tab={data.tab}
      title={I18nUtils.getMessage('evm_watch_asset_title')}
      caption={I18nUtils.getMessage('evm_watch_asset_caption', [
        data.dappInfo.domain,
      ])}
      onConfirm={handleConfirm}
      confirmDisabled={!chain || !watchAssetRequest}
      bottomPanel={
        chain &&
        watchAssetRequest && (
          <Card className="watch-asset-card evm-add-custom-asset-popup">
            <EvmCustomErc20Form
              ref={formRef}
              chain={chain}
              walletAddress={activeWalletAddress}
              initialForm={initialForm}
              autoResolveContract
              renderFooter={false}
              onSave={handleSave}
            />
          </Card>
        )
      }
    />
  );
};
