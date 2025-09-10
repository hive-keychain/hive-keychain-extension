import { EvmOperation } from '@dialog/evm/evm-operation/evm-operation';
import { EvmTransactionWarningsComponent } from '@dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useTransactionHook } from '@dialog/evm/requests/transaction-warnings/transaction.hook';
import { EvmRequestMessage } from '@dialog/multichain/request/request-confirmation';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { AddChainRequest } from '@popup/evm/interfaces/evm-requests.interfaces';
import {
  EvmTransactionType,
  TransactionConfirmationFields,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { EvmInputDisplayType } from '@popup/evm/utils/evm-transaction-parser.utils';
import {
  BlockExporerType,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React, { useEffect, useState } from 'react';

interface Props {
  request: EvmRequest<AddChainRequest>;
  data: EvmRequestMessage;
}

export const AddChain = (props: Props) => {
  const { request, data } = props;
  const warningHook = useTransactionHook(data, request);

  const addChainRequest = request.params[0] as AddChainRequest;

  const [isUpdatingChain, setIsUpdatingChain] = useState(false);

  const [newChain, setNewChain] = useState<EvmChain>({
    name: addChainRequest.chainName,
    type: ChainType.EVM,
    mainToken: addChainRequest.nativeCurrency.symbol,
    defaultTransactionType: EvmTransactionType.EIP_1559,
    logo: addChainRequest.iconUrls?.[0] || '',
    chainId: addChainRequest.chainId,
    rpcs: addChainRequest.rpcUrls.map((url) => ({
      url: url,
      isDefault: false,
    })), // TODO will need to merge with existing rpcs (add to customs)
    blockExplorer: {
      url: addChainRequest.blockExplorerUrls?.[0] || '',
      type: BlockExporerType.ETHERSCAN,
    },
    blockExplorerApi: { url: '', type: BlockExporerType.ETHERSCAN },
  });

  useEffect(() => {
    console.log(props);
    init();
  }, []);

  const init = async () => {
    const setupChains = await ChainUtils.getSetupChains();
    if (
      setupChains.find((chain) => chain.chainId === addChainRequest.chainId)
    ) {
      setIsUpdatingChain(true);
    } else {
      setIsUpdatingChain(false);
    }
    const fields: TransactionConfirmationFields = { otherFields: [] };

    fields.otherFields.push({
      name: 'evm_chain_name',
      value: addChainRequest.chainName,
      type: EvmInputDisplayType.STRING,
    });
    fields.otherFields.push({
      name: 'evm_chain_id',
      value: addChainRequest.chainId,
      type: EvmInputDisplayType.STRING,
    });
    fields.otherFields.push({
      name: 'evm_chain_symbol',
      value: addChainRequest.nativeCurrency.symbol,
      type: EvmInputDisplayType.STRING,
    });
    fields.otherFields.push({
      name: 'evm_chain_rpcs',
      value: addChainRequest.rpcUrls.join(', '),
      type: EvmInputDisplayType.LONG_TEXT,
    });

    warningHook.setFields(fields);
  };

  const saveNewChain = async () => {
    console.log('saveNewChain');
    const chain = await ChainUtils.getChainFromDefaultChains<EvmChain>(
      addChainRequest.chainId,
    );
    console.log('chain', chain);
    await ChainUtils.addChainToSetupChains(chain);
    if (addChainRequest.rpcUrls.length > 0) {
      await EvmRpcUtils.addCustomRpcsFromList(addChainRequest.rpcUrls, chain);
      await EvmRpcUtils.setActiveRpc(
        { url: addChainRequest.rpcUrls[0], isDefault: false },
        chain,
      );
    }
  };

  const updateChain = async () => {
    const chain = await ChainUtils.getChain<EvmChain>(addChainRequest.chainId);
    if (addChainRequest.rpcUrls.length > 0) {
      await EvmRpcUtils.addCustomRpcsFromList(addChainRequest.rpcUrls, chain);
      await EvmRpcUtils.setActiveRpc(
        { url: addChainRequest.rpcUrls[0], isDefault: false },
        chain,
      );
    }
  };

  const handleConfirm = async () => {
    if (isUpdatingChain) {
      await updateChain();
    } else {
      await saveNewChain();
    }
  };

  return (
    <EvmOperation
      request={request}
      domain={data.dappInfo.domain}
      tab={0}
      title={chrome.i18n.getMessage(
        isUpdatingChain ? 'evm_update_chain' : 'evm_add_chain',
      )}
      onConfirm={handleConfirm}
      caption={chrome.i18n.getMessage(
        isUpdatingChain ? 'evm_update_chain_caption' : 'evm_add_chain_caption',
        [data.dappInfo.domain],
      )}
      fields={<EvmTransactionWarningsComponent warningHook={warningHook} />}
      bottomPanel={
        <></>
        // <FormContainer onSubmit={saveNewChain}>
        //   <InputComponent
        //     type={InputType.TEXT}
        //     label="Chain Name"
        //     skipLabelTranslation
        //     value={newChain.name}
        //     onChange={(value) => updateNewChain('name', value)}
        //   />
        //   <InputComponent
        //     type={InputType.TEXT}
        //     label="Chain ID"
        //     skipLabelTranslation
        //     value={newChain.chainId}
        //     onChange={(value) => updateNewChain('chainId', value)}
        //   />
        //   {newChain.rpcs.map((rpc, index) => (
        //     <InputComponent
        //       type={InputType.TEXT}
        //       label="RPC URL"
        //       skipLabelTranslation
        //       value={rpc.url}
        //       onChange={(value) => updateNewChain(`rpcs.url.${index}`, value)}
        //     />
        //   ))}
        //   {newChain.blockExplorer && (
        //     <InputComponent
        //       type={InputType.TEXT}
        //       label="Block explorer URL"
        //       skipLabelTranslation
        //       value={newChain.blockExplorer.url}
        //       onChange={(value) => updateNewChain('blockExplorer.url', value)}
        //     />
        //   )}
        //   <InputComponent
        //     type={InputType.TEXT}
        //     label="Symbol"
        //     skipLabelTranslation
        //     value={newChain.mainToken}
        //     onChange={(value) => updateNewChain('mainToken', value)}
        //   />
        // </FormContainer>
      }
      transactionHook={warningHook}></EvmOperation>
  );
};
