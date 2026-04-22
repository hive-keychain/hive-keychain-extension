import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React from 'react';
import { CustomEvmChainForm } from '@popup/evm/pages/home/settings/evm-custom-chains/custom-evm-chain-form.component';

interface OwnProps {
  onSuccess: () => void;
  onCancel: () => void;
  /** When set, form loads this chain and saves with `updateCustomChain(originalChainId, chain)`. */
  chainToEdit?: EvmChain;
}

/** Errors are shown inside the form so they stay above the modal content (global setErrorMessage renders behind the modal). */
export const AddCustomEvmChainForm = ({
  onSuccess,
  onCancel,
  chainToEdit,
}: OwnProps) => {
  return (
    <CustomEvmChainForm
      onCancel={onCancel}
      chainToEdit={chainToEdit}
      onSubmit={async (chain) => {
        if (chainToEdit) {
          await ChainUtils.updateCustomChain(chainToEdit.chainId, chain);
        } else {
          await ChainUtils.addCustomChain(chain);
        }
        if (chain.rpcs.length > 0) {
          await EvmRpcUtils.setActiveRpc(chain.rpcs[0], chain);
        }
        await onSuccess();
      }}
    />
  );
};
