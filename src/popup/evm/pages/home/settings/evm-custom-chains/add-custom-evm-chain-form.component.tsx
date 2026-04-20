import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CustomEvmChainForm } from '@popup/evm/pages/home/settings/evm-custom-chains/custom-evm-chain-form.component';

interface OwnProps {
  onSuccess: () => void;
  onCancel: () => void;
  /** When set, form loads this chain and saves with `updateCustomChain(originalChainId, chain)`. */
  chainToEdit?: EvmChain;
}

const AddCustomEvmChainFormInner = ({
  onSuccess,
  onCancel,
  chainToEdit,
  setErrorMessage,
}: OwnProps & PropsFromRedux) => {
  return (
    <CustomEvmChainForm
      onCancel={onCancel}
      chainToEdit={chainToEdit}
      setErrorMessage={setErrorMessage}
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

const connector = connect(null, { setErrorMessage });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AddCustomEvmChainForm = connector(AddCustomEvmChainFormInner);
