import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmTokenInfoShort } from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmTransactionType,
  ProviderTransactionData,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
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
  const [selectedFee, setSelectedFee] = useState<GasFeeEstimationBase>();
  const [suggestedFee, setSuggestedFee] = useState<GasFeeEstimationBase>();
  const [amount, setAmount] = useState<number>();
  const [receiverAddress, setReceiverAddress] = useState<string>();

  const [selectedAccount, setSelectedAccount] = useState<EvmAccount>();

  const [transactionData, setTransactionData] =
    useState<ProviderTransactionData>();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const lastChain = await EvmChainUtils.getLastEvmChain();
    setChain(lastChain as EvmChain);

    const params = request.params[0];

    const usedAccount = accounts.find(
      (account) => account.wallet.address === params.from,
    );

    setSelectedAccount({
      ...usedAccount!,
      wallet: HDNodeWallet.fromPhrase(usedAccount?.wallet.mnemonic?.phrase!),
    });

    let tokenAddress;

    let tData = {
      gasLimit: params.gasLimit,
      gasPrice: params.gasPrice,
      maxFeePerGas: params.maxFeePerGas,
      maxPriorityFeePerGas: params.maxPriorityFeePerGas,
    } as ProviderTransactionData;

    if (usedAccount) {
      if (params.data) {
        const contract = new ethers.Contract(params.to, Erc20Abi);
        const transferDecodedData = contract.interface.decodeFunctionData(
          'transfer',
          params.data,
        );
        console.log({ transferDecodedData });
        setReceiverAddress(transferDecodedData[0]);
        setAmount(transferDecodedData[1]);
        tokenAddress = params.to;

        tData.from = params.from;
        tData.value = params.value;
        tData.toContract = tokenAddress;
        tData.data = {
          receiverAddress: transferDecodedData[0],
          amount: transferDecodedData[1] / 1000000,
        };
      } else {
        setAmount(params.amount);
        setReceiverAddress(params.to);

        tData.from = params.from;
        tData.value = params.value;
        tData.to = params.to;
      }
      tData.type = params.type ?? chain?.defaultTransactionType;

      switch (tData.type) {
        case EvmTransactionType.EIP_1559: {
          if (!tData.maxFeePerGas) tData.maxFeePerGas = tData.gasPrice;
          if (!tData.maxPriorityFeePerGas)
            tData.maxPriorityFeePerGas = tData.gasPrice;
          break;
        }
        case EvmTransactionType.LEGACY: {
          console.log(!tData.gasPrice, tData.gasPrice);
          if (!tData.gasPrice) {
            tData.gasPrice = tData.maxFeePerGas;
          }
          break;
        }
      }
      setTransactionData(tData);
      setTokenInfo(
        await EvmTokensUtils.getTokenInfo(lastChain.chainId, tokenAddress),
      );
    } else {
      console.log('No corresponding account found');
    }
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
        selectedAccount &&
        transactionData && (
          <GasFeePanel
            chain={chain}
            tokenInfo={tokenInfo}
            receiverAddress={receiverAddress}
            amount={0}
            wallet={selectedAccount.wallet}
            selectedFee={selectedFee}
            onSelectFee={setSelectedFee}
            transactionType={transactionData.type}
            transactionData={transactionData}
          />
        )
      }
    />
  );
};
