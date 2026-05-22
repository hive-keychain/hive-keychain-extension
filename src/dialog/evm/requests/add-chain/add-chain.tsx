import { Card } from '@common-ui/card/card.component';
import { EvmOperation } from '@dialog/evm/evm-operation/evm-operation';
import { EvmTransactionWarningsComponent } from '@dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useTransactionHook } from '@dialog/evm/requests/transaction-warnings/transaction.hook';
import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { AddChainRequest } from '@popup/evm/interfaces/evm-requests.interfaces';
import { CustomEvmChainForm } from '@popup/evm/pages/home/settings/evm-custom-chains/custom-evm-chain-form.component';
import {
  EvmTransactionType,
  TransactionConfirmationFields,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmRpcUrlUtils } from '@popup/evm/utils/evm-rpc-url.utils';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { EvmInputDisplayType } from '@popup/evm/utils/evm-transaction-parser.utils';
import {
  BlockExplorerType,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useEffect, useState } from 'react';
import { CommunicationUtils } from 'src/utils/communication.utils';

interface Props {
  request: EvmRequest<AddChainRequest>;
  data: EvmRequestMessage;
  afterCancel: (requestId: number, tab: number) => void;
}

export const AddChain = (props: Props) => {
  const { request, data } = props;
  const transactionHook = useTransactionHook(data, request);

  const addChainRequest = request.params[0] as AddChainRequest;
  const chainName = addChainRequest.chainName ?? '';
  const nativeCurrencySymbol = addChainRequest.nativeCurrency?.symbol ?? '';

  const [isUpdatingChain, setIsUpdatingChain] = useState<boolean>();
  const [defaultChainToAdd, setDefaultChainToAdd] = useState<EvmChain>();

  const initialChain: EvmChain = {
    name: chainName,
    type: ChainType.EVM,
    mainToken: nativeCurrencySymbol,
    defaultTransactionType: EvmTransactionType.EIP_1559,
    logo: addChainRequest.iconUrls?.[0] || '',
    chainId: addChainRequest.chainId,
    rpcs: addChainRequest.rpcUrls.map((url, index) => ({
      url,
      isDefault: index === 0,
    })),
    blockExplorer: {
      url: addChainRequest.blockExplorerUrls?.[0] || '',
      type: BlockExplorerType.BLOCKSCOUT,
    },
    blockExplorerApi: { url: '', type: BlockExplorerType.BLOCKSCOUT },
  };

  useEffect(() => {
    init();
  }, [request]);

  const handleCancel = () => {
    props.afterCancel(request.request_id, data.tab);
  };

  const init = async () => {
    transactionHook.setLoading(true);
    transactionHook.setReady(false);
    const setupChains = await ChainUtils.getSetupChains();
    if (
      setupChains.find((chain) => chain.chainId === addChainRequest.chainId)
    ) {
      setIsUpdatingChain(true);
      setDefaultChainToAdd(undefined);
    } else {
      setDefaultChainToAdd(
        await ChainUtils.getChainFromDefaultChains<EvmChain>(
          addChainRequest.chainId,
        ),
      );
      setIsUpdatingChain(false);
    }
    const fields: TransactionConfirmationFields = { otherFields: [] };

    fields.otherFields.push({
      name: 'evm_chain_name',
      value: chainName,
      type: EvmInputDisplayType.STRING,
    });
    fields.otherFields.push({
      name: 'evm_chain_id',
      value: addChainRequest.chainId,
      type: EvmInputDisplayType.STRING,
    });
    fields.otherFields.push({
      name: 'evm_chain_symbol',
      value: nativeCurrencySymbol,
      type: EvmInputDisplayType.STRING,
    });
    fields.otherFields.push({
      name: 'evm_chain_rpcs',
      value: addChainRequest.rpcUrls.join(', '),
      type: EvmInputDisplayType.LONG_TEXT,
    });

    transactionHook.setFields(fields);
    setTimeout(() => {
      transactionHook.setReady(true);
      transactionHook.setLoading(false);
    }, 250);
  };

  const addDefaultChain = async () => {
    if (defaultChainToAdd) {
      await ChainUtils.addChainToSetupChains(defaultChainToAdd);
      await EvmRpcUtils.addCustomRpcsFromList(
        addChainRequest.rpcUrls,
        defaultChainToAdd,
      );
    }
  };

  const updateChain = async () => {
    const chain = await ChainUtils.getChain<EvmChain>(addChainRequest.chainId);
    if (addChainRequest.rpcUrls.length > 0) {
      await EvmRpcUtils.addCustomRpcsFromList(addChainRequest.rpcUrls, chain);
    }
  };

  const sendSuccessResponse = () => {
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

  const handleSubmitNewChain = async (chain: EvmChain) => {
    const rpcUrls = chain.rpcs.map((rpc) => rpc.url);
    EvmRpcUrlUtils.assertValidHttpsRpcUrls(rpcUrls);

    await ChainUtils.addCustomChain(chain);
    await EvmRpcUtils.addCustomRpcsFromList(rpcUrls, chain);
    await EvmRpcUtils.setActiveRpc(chain.rpcs[0], chain);
    sendSuccessResponse();
  };

  const handleConfirm = async () => {
    if (isUpdatingChain) {
      await updateChain();
    } else {
      await addDefaultChain();
    }

    sendSuccessResponse();
  };

  if (isUpdatingChain === false && !defaultChainToAdd) {
    return (
      <div className="request-add-custom-chain-page">
        <Card className="request-add-custom-chain-card">
          <div className="title">
            {chrome.i18n.getMessage('evm_add_chain')}
          </div>
          <div className="caption">
            {chrome.i18n.getMessage('evm_add_chain_caption', [
              data.dappInfo.domain,
            ])}
          </div>
          <CustomEvmChainForm
            onCancel={handleCancel}
            onSubmit={handleSubmitNewChain}
            initialChain={initialChain}
            submitLabel="dialog_confirm"
          />
        </Card>
      </div>
    );
  }

  if (isUpdatingChain === undefined) {
    return null;
  }

  return (
    <EvmOperation
      request={request}
      domain={data.dappInfo.domain}
      origin={data.dappInfo.origin}
      tab={data.tab}
      afterCancel={handleCancel}
      title={chrome.i18n.getMessage(
        isUpdatingChain ? 'evm_update_chain' : 'evm_add_chain',
      )}
      onConfirm={handleConfirm}
      caption={chrome.i18n.getMessage(
        isUpdatingChain ? 'evm_update_chain_caption' : 'evm_add_chain_caption',
        [data.dappInfo.domain],
      )}
      fields={<EvmTransactionWarningsComponent warningHook={transactionHook} />}
      bottomPanel={<></>}
      transactionHook={transactionHook}></EvmOperation>
  );
};
