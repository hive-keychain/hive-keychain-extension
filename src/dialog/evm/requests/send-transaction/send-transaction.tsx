import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EtherscanApi } from '@popup/evm/api/etherscan.api';
import {
  EvmTokenInfoShort,
  EvmTokenInfoShortErc20,
} from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmTransactionType,
  ProviderTransactionData,
  TransactionConfirmationFields,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmTokenLogo } from '@popup/evm/pages/home/evm-token-logo/evm-token-logo.component';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import {
  EvmInputDisplayType,
  EvmTransactionParserUtils,
} from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { ethers, HDNodeWallet, Wallet } from 'ethers';
import React, { useEffect, useState } from 'react';
import { Card } from 'src/common-ui/card/card.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { EvmTransactionWarningsComponent } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import { EvmRequestMessage } from 'src/dialog/multichain/request/request-confirmation';
import FormatUtils from 'src/utils/format.utils';

interface Props {
  request: EvmRequest;
  accounts: EvmAccount[];
  data: EvmRequestMessage;
}

interface BalanceInfo {
  before: string;
  estimatedAfter: string;
}

export const SendTransaction = (props: Props) => {
  const { accounts, data, request } = props;

  const transactionHook = useTransactionHook(data, request);

  const [caption, setCaption] = useState<string>();
  const [chain, setChain] = useState<EvmChain>();
  const [tokenInfo, setTokenInfo] = useState<EvmTokenInfoShort>();
  const [selectedAccount, setSelectedAccount] = useState<EvmAccount>();
  const [receiver, setReceiver] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState<number>();

  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>();

  const [shouldDisplayBalanceChange, setShouldDisplayBalanceChange] =
    useState(false);

  const [transactionData, setTransactionData] =
    useState<ProviderTransactionData>();

  useEffect(() => {
    console.log(
      transactionHook.ready,
      transactionHook.fields,
      chain,
      selectedAccount,
      transactionData,
      receiver,
    );
  });

  useEffect(() => {
    // console.log({ data, request });
    init();
  }, []);

  useEffect(() => {
    if (tokenInfo && selectedAccount && transferAmount !== undefined) {
      initBalance(tokenInfo);
    }
  }, [tokenInfo, selectedAccount, transferAmount]);

  const init = async () => {
    let transactionConfirmationFields = {} as TransactionConfirmationFields;

    const lastChain = await EvmChainUtils.getLastEvmChain();
    setChain(lastChain as EvmChain);
    const params = request.params[0];

    const usedAccount = accounts.find(
      (account) =>
        account.wallet.address.toLowerCase() === params.from.toLowerCase(),
    );

    setSelectedAccount({
      ...usedAccount!,
      wallet: HDNodeWallet.fromPhrase(usedAccount?.wallet.mnemonic?.phrase!),
    });

    const provider = EthersUtils.getProvider(lastChain as EvmChain);
    const connectedWallet = new Wallet(
      HDNodeWallet.fromPhrase(usedAccount?.wallet.mnemonic?.phrase!).signingKey,
      provider,
    );
    let tokenAddress;

    let tData = {
      gasLimit: params.gasLimit,
      gasPrice: params.gasPrice,
      maxFeePerGas: params.maxFeePerGas,
      maxPriorityFeePerGas: params.maxPriorityFeePerGas,
    } as ProviderTransactionData;

    transactionConfirmationFields.otherFields = [];

    if (usedAccount) {
      // Case with data
      if (params.data) {
        const abi = await EtherscanApi.getAbi(
          lastChain! as EvmChain,
          params.to,
        );
        tData.abi = abi;

        console.log(abi);

        tokenAddress = params.to;

        // Case of the execution of a smart contract
        if (params.to) {
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

          tData.method = decodedTransactionData?.name;
          tData.args = decodedTransactionData?.args;

          // console.log(decodedTransactionData);

          setShouldDisplayBalanceChange(
            EvmTransactionParserUtils.shouldDisplayBalanceChange(
              abi,
              decodedTransactionData?.name!,
            ),
          );

          const translatedOperationName = chrome.i18n.getMessage(
            `evm_operation_${decodedTransactionData?.name}`,
          );
          transactionConfirmationFields.operationName =
            translatedOperationName && translatedOperationName.length > 0
              ? translatedOperationName
              : decodedTransactionData?.name;

          const transactionInfo =
            await EvmTransactionParserUtils.verifyTransactionInformation(
              data.dappInfo.domain,
              params.to,
              usedAccount.wallet.address,
            );

          transactionConfirmationFields.otherFields.push(
            await transactionHook.getDomainWarnings(transactionInfo),
          );

          transactionConfirmationFields.otherFields.push({
            name: 'evm_operation_smart_contract_address',
            type: EvmInputDisplayType.ADDRESS,
            value: (
              <div className="value-content">
                <div>{EvmFormatUtils.formatAddress(tokenAddress)}</div>
                {usedToken && <EvmTokenLogo tokenInfo={usedToken} />}
              </div>
            ),
            ...(await EvmTransactionParserUtils.getSmartContractWarningAndInfo(
              params.to,
              lastChain.chainId,
              transactionInfo,
            )),
          });

          if (Number(decodedTransactionData?.value) > 0) {
            transactionConfirmationFields.mainTokenAmount = {
              name: 'mainTokenAmount',
              type: EvmInputDisplayType.BALANCE,
              value: `${FormatUtils.withCommas(
                Number(decodedTransactionData?.value),
              )}  ${chain?.mainToken}`,
            };
          }

          if (decodedTransactionData?.fragment.inputs) {
            for (
              let index = 0;
              index < decodedTransactionData.fragment.inputs.length;
              index++
            ) {
              const input = decodedTransactionData?.fragment.inputs[index];
              if (
                EvmTransactionParserUtils.recipientInputNameList.includes(
                  input.name,
                )
              ) {
                setReceiver(decodedTransactionData.args[index]);
                tData.to = decodedTransactionData.args[index];
              }
              if (
                EvmTransactionParserUtils.amountInputNameList.includes(
                  input.name,
                )
              ) {
                setTransferAmount(
                  new Decimal(Number(decodedTransactionData.args[index]))
                    .div(new Decimal(EvmFormatUtils.WEI))
                    .toNumber(),
                );
              }

              let value;
              const inputDisplayType =
                EvmTransactionParserUtils.getDisplayInputType(
                  abi,
                  decodedTransactionData.name,
                  input.type,
                  input.name,
                );

              switch (inputDisplayType) {
                case EvmInputDisplayType.ADDRESS:
                  value = EvmFormatUtils.formatAddress(
                    decodedTransactionData.args[index],
                  );
                  break;

                case EvmInputDisplayType.BALANCE:
                  value = `${FormatUtils.withCommas(
                    new Decimal(Number(decodedTransactionData.args[index]))
                      .div(new Decimal(EvmFormatUtils.WEI))
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
                type: EvmTransactionParserUtils.getDisplayInputType(
                  abi,
                  decodedTransactionData.name,
                  input.type,
                  input.name,
                ),
                value: value,
                warnings: await EvmTransactionParserUtils.getFieldWarnings(
                  abi,
                  decodedTransactionData.name,
                  input.type,
                  input.name,
                  value,
                  lastChain.chainId,
                  transactionInfo,
                ),
              });
            }
          }

          tData.from = params.from;
          tData.value = params.value;
          tData.to = tokenAddress;
          tData.data = params.data;
        } else {
          // Case of smart contract deployment
          // Unknown ABI
          setCaption(
            chrome.i18n.getMessage(
              'evm_contract_deployment_transaction_caption',
            ),
          );

          setReceiver('');

          tData.data = params.data;

          transactionConfirmationFields.operationName = chrome.i18n.getMessage(
            `evm_operation_contract_deployment_transaction`,
          );

          const transactionInfo =
            await EvmTransactionParserUtils.verifyTransactionInformation(
              data.dappInfo.domain,
              params.to,
              usedAccount.wallet.address,
            );

          transactionConfirmationFields.otherFields.push(
            await transactionHook.getDomainWarnings(transactionInfo),
          );

          transactionConfirmationFields.otherFields.push({
            name: 'evm_smart_contract_data',
            type: EvmInputDisplayType.LONG_TEXT,
            value: params.data,
          });
        }
      } else {
        // Classic transfer
        const transactionInfo =
          await EvmTransactionParserUtils.verifyTransactionInformation(
            data.dappInfo.domain,
            params.to,
            usedAccount.wallet.address,
          );

        transactionConfirmationFields.otherFields.push(
          await transactionHook.getDomainWarnings(transactionInfo),
        );

        setTokenInfo(
          await EvmTokensUtils.getMainTokenInfo(lastChain as EvmChain),
        );

        setShouldDisplayBalanceChange(true);

        transactionConfirmationFields.operationName = chrome.i18n.getMessage(
          'evm_operation_transfer',
        );

        transactionConfirmationFields.mainTokenAmount = {
          name: 'mainTokenAmount',
          type: EvmInputDisplayType.BALANCE,
          value: `${FormatUtils.withCommas(
            new Decimal(Number(params.value))
              .div(new Decimal(EvmFormatUtils.GWEI))
              .toNumber(),
            8,
            true,
          )} ${(lastChain as EvmChain)?.mainToken}`,
        };

        transactionConfirmationFields.otherFields.push(
          await transactionHook.getAddressInput(
            params.to,
            lastChain.chainId,
            transactionInfo,
          ),
        );

        setReceiver(params.to);
        setTransferAmount(
          new Decimal(Number(params?.value))
            .div(new Decimal(EvmFormatUtils.GWEI))
            .toNumber(),
        );

        setTokenInfo(
          await EvmTokensUtils.getMainTokenInfo(lastChain as EvmChain),
        );

        tData.from = params.from;
        tData.value = params.value;
        tData.to = params.to;
      }
      tData.type =
        params.type ?? (lastChain as EvmChain)?.defaultTransactionType;

      switch (tData.type) {
        case EvmTransactionType.EIP_1559: {
          if (!tData.maxFeePerGas) tData.maxFeePerGas = tData.gasPrice;
          if (!tData.maxPriorityFeePerGas)
            tData.maxPriorityFeePerGas = tData.gasPrice;
          break;
        }
        case EvmTransactionType.LEGACY: {
          if (!tData.gasPrice) {
            tData.gasPrice = tData.maxFeePerGas;
          }
          break;
        }
      }
      // console.log(tData);
      setTransactionData(tData);
      transactionHook.setFields(transactionConfirmationFields);

      // console.log({ transactionConfirmationFields });
    } else {
      console.log('No corresponding account found');
    }
    transactionHook.setReady(true);
    transactionHook.setLoading(false);
  };

  const initBalance = async (tokenInfo: EvmTokenInfoShort) => {
    const balance = await EvmTokensUtils.getTokenBalance(
      selectedAccount?.wallet.address!,
      chain!,
      tokenInfo,
    );

    setBalanceInfo({
      before: `${balance?.formattedBalance!} ${tokenInfo.symbol}`,
      estimatedAfter: `${FormatUtils.withCommas(
        new Decimal(balance?.balanceInteger!).sub(transferAmount!).toString(),
        (tokenInfo as EvmTokenInfoShortErc20).decimals || 8,
        true,
      )}  ${tokenInfo?.symbol}`,
    });
  };

  return (
    <>
      {transactionHook.fields && (
        <EvmOperation
          request={request}
          domain={data.dappInfo.domain}
          tab={data.tab}
          title={transactionHook.fields.operationName!}
          caption={caption}
          fields={
            <EvmTransactionWarningsComponent warningHook={transactionHook} />
          }
          bottomPanel={
            <>
              {shouldDisplayBalanceChange && (
                <Card className="balance-change-panel">
                  <div className="balance-change-title">
                    {chrome.i18n.getMessage('evm_balance_change_title')}
                  </div>
                  <div className="balance-before">
                    {chrome.i18n.getMessage('evm_balance_before')}
                    {balanceInfo?.before}
                  </div>
                  <div className="balance-after">
                    {chrome.i18n.getMessage('evm_balance_after')}
                    {balanceInfo?.estimatedAfter}
                  </div>
                </Card>
              )}
              {transactionHook.ready &&
                transactionHook.fields &&
                chain &&
                selectedAccount &&
                transactionData && (
                  <GasFeePanel
                    chain={chain}
                    tokenInfo={tokenInfo}
                    wallet={selectedAccount.wallet}
                    selectedFee={transactionHook.selectedFee}
                    onSelectFee={transactionHook.setSelectedFee}
                    transactionType={transactionData.type}
                    transactionData={transactionData}
                  />
                )}
            </>
          }
          onConfirm={transactionHook.handleOnConfirmClick}
          warningHook={transactionHook}
        />
      )}
      <LoadingComponent hide={!transactionHook.loading} />
    </>
  );
};
