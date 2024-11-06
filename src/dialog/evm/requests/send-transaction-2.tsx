import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EtherscanApi } from '@popup/evm/api/etherscan.api';
import {
  EvmTokenInfoShort,
  EvmTokenInfoShortErc20,
} from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmTransactionType,
  ProviderTransactionData,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmTokenLogo } from '@popup/evm/pages/home/evm-token-logo/evm-token-logo.component';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import {
  AbiParserUtils,
  EvmInputDisplayType,
} from '@popup/evm/utils/abi-parser.utils';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { ethers, HDNodeWallet } from 'ethers';
import React, { useEffect, useState } from 'react';
import { EvmAccountDisplayComponent } from 'src/common-ui/evm/evm-account-display/evm-account-display.component';
import RequestItem from 'src/dialog/components/request-item/request-item';
import { EvmRequestItem } from 'src/dialog/evm/components/evm-request-item/evm-request-item';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { EvmRequestMessage } from 'src/dialog/multichain/request/request-confirmation';
import FormatUtils from 'src/utils/format.utils';

interface Props {
  request: EvmRequest;
  accounts: EvmAccount[];
  data: EvmRequestMessage;
}

export interface TransactionConfirmationField {
  name: string;
  value: any;
  type: string;
}

interface TransactionConfirmationFields {
  operationName?: string;
  mainTokenAmount?: TransactionConfirmationField;
  otherFields: TransactionConfirmationField[];
}

export const SendTransaction2 = (props: Props) => {
  const { accounts, data, request } = props;

  const [chain, setChain] = useState<EvmChain>();
  const [tokenInfo, setTokenInfo] = useState<EvmTokenInfoShort>();
  const [selectedFee, setSelectedFee] = useState<GasFeeEstimationBase>();
  const [selectedAccount, setSelectedAccount] = useState<EvmAccount>();
  const [receiver, setReceiver] = useState<string>();

  const [transactionData, setTransactionData] =
    useState<ProviderTransactionData>();

  const [fields, setFields] = useState<TransactionConfirmationFields>();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    let transactionConfirmationFields = {} as TransactionConfirmationFields;

    const lastChain = await EvmChainUtils.getLastEvmChain();
    setChain(lastChain as EvmChain);
    const params = request.params[0];

    console.log(lastChain);

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
        transactionConfirmationFields.otherFields = [];
        const abi = await EtherscanApi.getAbi(
          lastChain! as EvmChain,
          params.to,
        );

        tokenAddress = params.to;

        const usedToken = await EvmTokensUtils.getTokenInfo(
          lastChain.chainId,
          tokenAddress,
        );
        setTokenInfo(usedToken);

        const contract = new ethers.Contract(params.to, abi);

        const decodedTransactionData = contract.interface.parseTransaction({
          data: params.data,
          value: params.value,
        });
        console.log({ decodedTransactionData });

        transactionConfirmationFields.operationName =
          decodedTransactionData?.name;

        transactionConfirmationFields.otherFields.push({
          name: 'evm_operation_smart_contract_address',
          type: 'address',
          value: (
            <div className="value-content">
              <div>{EvmFormatUtils.formatAddress(tokenAddress)}</div>
              <EvmTokenLogo tokenInfo={usedToken} />
            </div>
          ),
        });

        if (Number(decodedTransactionData?.value) > 0)
          transactionConfirmationFields.mainTokenAmount = {
            name: 'mainTokenAmount',
            type: 'number',
            value: `${FormatUtils.withCommas(
              Number(decodedTransactionData?.value),
            )}  ${chain?.mainToken}`,
          };

        if (decodedTransactionData?.fragment.inputs)
          for (
            let index = 0;
            index < decodedTransactionData.fragment.inputs.length;
            index++
          ) {
            const input = decodedTransactionData?.fragment.inputs[index];
            if (input.name === 'recipient') {
              setReceiver(decodedTransactionData.args[index]);
            }

            let value;
            const inputDisplayType = AbiParserUtils.getDisplayInputType(
              abi,
              decodedTransactionData.name,
              input.type,
              input.name,
            );

            console.log({
              test: decodedTransactionData.args[index],
              inputDisplayType,
              usedToken,
            });

            switch (inputDisplayType) {
              case EvmInputDisplayType.ADDRESS:
                value = EvmFormatUtils.formatAddress(
                  decodedTransactionData.args[index],
                );
                break;

              case EvmInputDisplayType.BALANCE:
                value = `${FormatUtils.withCommas(
                  new Decimal(Number(decodedTransactionData.args[index]))
                    .div(new Decimal(EvmFormatUtils.GWEI))
                    .toNumber(),
                  (usedToken as EvmTokenInfoShortErc20).decimals,
                  true,
                )}  ${usedToken?.symbol}`;
                break;
              case EvmInputDisplayType.NUMBER:
                value = FormatUtils.withCommas(
                  decodedTransactionData.args[index],
                );
                break;
              case EvmInputDisplayType.STRING:
                value = decodedTransactionData.args[index];
                break;
            }
            transactionConfirmationFields.otherFields.push({
              name: input.name,
              type: input.type,
              value: value,
            });
          }

        tData.from = params.from;
        tData.value = params.value;
        tData.toContract = tokenAddress;
      } else {
        console.log({ params });

        transactionConfirmationFields.mainTokenAmount = {
          name: 'mainTokenAmount',
          type: 'number',
          value: Number(params?.value),
        };

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
      setFields(transactionConfirmationFields);

      console.log({ transactionConfirmationFields });
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
          {fields?.operationName && (
            <div className="transaction-operation-name">
              {chrome.i18n.getMessage(`evm_operation_${fields.operationName}`)}
            </div>
          )}

          {selectedAccount && chain && (
            <div className="account-chain-panel">
              <EvmAccountDisplayComponent account={selectedAccount} />

              <div className="chain-info">
                <div className="chain-name">{chain.name}</div>
                <img className="chain-logo" src={chain.logo} />
              </div>
            </div>
          )}

          {fields?.mainTokenAmount !== undefined &&
            fields?.mainTokenAmount !== null &&
            tokenInfo && (
              <RequestItem
                title="popup_html_transfer_amount"
                content={`${FormatUtils.withCommas(
                  fields?.mainTokenAmount.toString(),
                  8,
                  true,
                )}  ${tokenInfo?.symbol}`}
              />
            )}

          {fields &&
            fields.otherFields?.map((f, index) => (
              <EvmRequestItem key={`${f.name}-${index}`} field={f} />
            ))}
        </>
      }
      bottomPanel={
        fields &&
        chain &&
        tokenInfo &&
        receiver &&
        selectedAccount &&
        transactionData && (
          <GasFeePanel
            chain={chain}
            tokenInfo={tokenInfo}
            receiverAddress={receiver}
            amount={0} // TODO change
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
