import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmTokenInfoShort } from '@popup/evm/interfaces/evm-tokens.interface';
import { GasFeeEstimation } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ethers, HDNodeWallet } from 'ethers';
import React, { useEffect, useState } from 'react';
import RequestItem from 'src/dialog/components/request-item/request-item';
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
  const [tokenInfo, setTokenInfo] = useState<EvmTokenInfoShort>();
  const [selectedFee, setSelectedFee] = useState<GasFeeEstimation>();

  const [amount, setAmount] = useState<number>();
  const [receiverAddress, setReceiverAddress] = useState<string>();

  const [selectedAccount, setSelectedAccount] = useState<EvmAccount>();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const lastChain = await EvmChainUtils.getLastEvmChain();
    setChain(lastChain as EvmChain);
    const transferData = request.params[0];

    const usedAccount = accounts.find(
      (account) => account.wallet.address === transferData.from,
    );

    setSelectedAccount({
      ...usedAccount!,
      wallet: HDNodeWallet.fromPhrase(usedAccount?.wallet.mnemonic?.phrase!),
    });

    let tokenAddress;

    if (transferData.data && usedAccount) {
      const contract = new ethers.Contract(transferData.to, Erc20Abi);
      const transferDecodedData = contract.interface.decodeFunctionData(
        'transfer',
        transferData.data,
      );
      console.log({ transferDecodedData });
      setReceiverAddress(transferDecodedData[0]);
      setAmount(transferDecodedData[1]);
      tokenAddress = transferData.to;
    } else {
      setAmount(transferData.amount);
      setReceiverAddress(transferData.to);
    }

    setTokenInfo(await EvmTokensUtils.getTokenInfo(lastChain.chainId));
  };

  return (
    <EvmOperation
      data={request}
      domain={data.domain}
      tab={data.tab}
      title={chrome.i18n.getMessage(
        'dialog_evm_decrypt_send_transaction_title',
      )}
      fields={
        <>
          {receiverAddress && (
            <RequestItem
              title="popup_html_transfer_from"
              content={EvmFormatUtils.formatAddress(request.params[0].from)}
            />
          )}
          {receiverAddress && (
            <RequestItem
              title="popup_html_transfer_to"
              content={EvmFormatUtils.formatAddress(receiverAddress)}
            />
          )}
          {amount && (
            <RequestItem
              title="popup_html_transfer_amount"
              content={amount.toString()}
            />
          )}
        </>
      }
      bottomPanel={
        chain &&
        tokenInfo &&
        receiverAddress &&
        selectedAccount && (
          <GasFeePanel
            chain={chain}
            tokenInfo={tokenInfo}
            receiverAddress={receiverAddress}
            amount={0}
            wallet={selectedAccount.wallet}
            selectedFee={selectedFee}
            onSelectFee={setSelectedFee}
          />
        )
      }
    />
  );
};
