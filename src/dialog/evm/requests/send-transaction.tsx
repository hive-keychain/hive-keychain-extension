import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import React, { useEffect, useState } from 'react';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { EvmRequestMessage } from 'src/dialog/multichain/request/request-confirmation';

interface Props {
  request: EvmRequest;
  accounts: EvmAccount[];
  data: EvmRequestMessage;
}
export const SendTransaction = (props: Props) => {
  const { accounts, data, request } = props;

  const [chain, setChain] = useState<EvmChain>();

  useEffect(() => {
    init();
    console.log({ data, request, accounts });
  }, []);

  const init = async () => {
    const lastChain = await EvmChainUtils.getLastEvmChain();
    setChain(lastChain as EvmChain);

    const token = await EvmTokensUtils.getTokenInfo(lastChain.chainId);
    console.log(request);
    console.log(token);
  };

  return (
    <>
      <EvmOperation
        data={request}
        domain={data.domain}
        tab={data.tab}
        title={chrome.i18n.getMessage(
          'dialog_evm_decrypt_send_transaction_title',
        )}>
        <></>
        <></>
      </EvmOperation>
      {/* {chain && <GasFeePanel
        chain={chain}
        tokenInfo={undefined}
        receiverAddress={''}
        amount={0}
        wallet={accounts[0]}
        onSelectFee={function (fee: GasFeeEstimation): void {
          throw new Error('Function not implemented.');
        }}
      />} */}
    </>
  );
};
