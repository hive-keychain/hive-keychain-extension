import { BalanceChangeCard } from '@dialog/components/balance-change-card/balance-change-card.component';
import type { BalanceInfo } from '@dialog/components/balance-change-card/balance-change-card.interface';
import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import {
  EvmSmartContractInfo,
  EvmSmartContractInfoErc20,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmTransactionType,
  EvmTransactionVerificationInformation,
  ProviderTransactionData,
  TransactionConfirmationFields,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmTokenLogo } from '@popup/evm/pages/home/evm-token-logo/evm-token-logo.component';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import {
  EvmInputDisplayType,
  EvmTransactionParserUtils,
} from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmNFTUtils } from '@popup/evm/utils/nft.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import Decimal from 'decimal.js';
import { ethers, HDNodeWallet, Wallet } from 'ethers';
import EventEmitter from 'events';
import React, { useEffect, useMemo, useState } from 'react';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { reorderEvmConfirmationFields } from 'src/dialog/evm/requests/transaction-warnings/transaction-field-order.utils';
import { EvmTransactionWarningsComponent } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import FormatUtils from 'src/utils/format.utils';
import Logger from 'src/utils/logger.utils';

interface Props {
  request: EvmRequest;
  accounts: EvmAccount[];
  data: EvmRequestMessage;
  afterCancel: (requestId: number, tab: number) => void;
}

export const SendTransaction = (props: Props) => {
  const { accounts, data, request, afterCancel } = props;

  const transactionHook = useTransactionHook(data, request);

  const [caption, setCaption] = useState<string>();
  const [chain, setChain] = useState<EvmChain>();
  const [tokenInfo, setTokenInfo] = useState<EvmSmartContractInfo>();
  const [selectedAccount, setSelectedAccount] = useState<EvmAccount>();
  const [receiver, setReceiver] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState<number>();

  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>();

  const [shouldDisplayBalanceChange, setShouldDisplayBalanceChange] =
    useState(false);

  const [transactionData, setTransactionData] =
    useState<ProviderTransactionData>();

  const forceOpenGasFeePanelEvent = useMemo(() => new EventEmitter(), []);

  useEffect(() => {
    init();
  }, [request]);

  useEffect(() => {
    if (tokenInfo && selectedAccount && chain && transferAmount !== undefined) {
      void initBalance(tokenInfo);
    }
  }, [
    chain,
    selectedAccount,
    tokenInfo,
    transactionHook.selectedFee,
    transferAmount,
  ]);

  const handleCopyAddress = (address: string) => {
    void copyTextWithToast(address, COPY_GENERIC_MESSAGE_KEY);
  };

  const init = async () => {
    transactionHook.setLoading(true);
    transactionHook.setReady(false);
    let transactionConfirmationFields = {} as TransactionConfirmationFields;
    let lastTransactionInfo: EvmTransactionVerificationInformation | undefined;

    const chainTmp = await ChainUtils.getChain<EvmChain>(request.chainId!);

    setChain(chainTmp as EvmChain);

    const mainToken = (await EvmTokensUtils.getMainTokenInfo(
      (chainTmp as EvmChain)!,
    )) as EvmSmartContractInfo;

    const params = request.params[0];
    let resolvedReceiver: string | null = null;
    let resolvedTransferAmount: number | undefined;

    const usedAccount = accounts.find(
      (account) =>
        account.wallet.address.toLowerCase() === params.from.toLowerCase(),
    );

    await transactionHook.initPendingTransactionWarning(
      usedAccount?.wallet!,
      chainTmp as EvmChain,
    );

    setSelectedAccount({
      ...usedAccount!,
      wallet: HDNodeWallet.fromPhrase(usedAccount?.wallet.mnemonic?.phrase!),
    });

    const provider = await EthersUtils.getProvider(chainTmp as EvmChain);
    const connectedWallet = new Wallet(
      HDNodeWallet.fromPhrase(usedAccount?.wallet.mnemonic?.phrase!).signingKey,
      provider,
    );
    let tokenAddress: string | null = null;

    let tData = {
      gasLimit: params.gasLimit,
      gasPrice: params.gasPrice,
      maxFeePerGas: params.maxFeePerGas,
      maxPriorityFeePerGas: params.maxPriorityFeePerGas,
      accessList: params.accessList,
    } as ProviderTransactionData;

    transactionConfirmationFields.otherFields = [];
    if (chainTmp) {
      transactionConfirmationFields.otherFields.push({
        type: EvmInputDisplayType.STRING,
        name: 'evm_chain',
        value: (
          <div className="value-content">
            <EvmTokenLogo tokenInfo={mainToken} />
            <div className="chain-container">
              <div className="chain-name">{chainTmp.name}</div>
            </div>
          </div>
        ),
      });
    }
    transactionConfirmationFields.otherFields.push(
      transactionHook.buildInitialDomainField(),
    );
    transactionHook.setFields({ ...transactionConfirmationFields });

    if (usedAccount) {
      const usedAccountInput = await transactionHook.getWalletAddressInput(
        usedAccount.wallet.address,
        chainTmp.chainId,
        {} as any,
        accounts,
        'dialog_account',
      );
      transactionConfirmationFields.otherFields.push({
        ...usedAccountInput,
      });

      // Case with data
      if (params.data) {
        tData.value = params.value;

        tokenAddress = params.to;
        // Case of the execution of a smart contract
        if (params.to) {
          const usedToken = await EvmTokensUtils.getTokenInfo(
            chainTmp.chainId,
            tokenAddress!,
          );
          const proxyTarget =
            usedToken.type !== EVMSmartContractType.NATIVE
              ? usedToken.proxyTarget
              : null;

          setTokenInfo(usedToken);

          const populateFallbackParsedDataFields = async (reason: string) => {
            const transactionInfo =
              await EvmTransactionParserUtils.verifyTransactionInformation(
                data.dappInfo.domain,
                params.to,
                usedAccount.wallet.address,
                proxyTarget,
              );
            lastTransactionInfo = transactionInfo;

            transactionHook.setUnableToReachBackend(
              !!(transactionInfo && transactionInfo.unableToReach),
            );

            transactionConfirmationFields.otherFields.push({
              name: 'evm_operation_smart_contract_address',
              type: EvmInputDisplayType.CONTRACT_ADDRESS,
              value: (
                <div className="value-content">
                  {usedToken && <EvmTokenLogo tokenInfo={usedToken} />}
                  <div>{EvmFormatUtils.formatAddress(tokenAddress!)}</div>
                </div>
              ),
              ...(await EvmTransactionParserUtils.getSmartContractWarningAndInfo(
                params.to,
                chainTmp.chainId,
                transactionInfo,
                accounts,
              )),
            });

            const parsedData = await EvmTransactionParserUtils.parseData(
              params.data,
              chainTmp as EvmChain,
            );

            if (parsedData?.inputs && parsedData?.operationName) {
              transactionConfirmationFields.operationName =
                parsedData.operationName;

              for (let index = 0; index < parsedData.inputs.length; index++) {
                const input = parsedData.inputs[index];

                let value;
                const inputDisplayType = input.type;

                switch (inputDisplayType) {
                  case EvmInputDisplayType.WALLET_ADDRESS:
                  case EvmInputDisplayType.CONTRACT_ADDRESS:
                    value = EvmFormatUtils.formatAddress(input.value);
                    break;

                  case EvmInputDisplayType.BALANCE: {
                    const decimals =
                      usedToken.type === EVMSmartContractType.ERC20
                        ? (usedToken as EvmSmartContractInfoErc20).decimals
                        : 18;
                    value = `${FormatUtils.withCommas(
                      new Decimal(input.value.toString())
                        .div(new Decimal(10).pow(decimals ?? 18))
                        .toNumber(),
                      decimals ?? 18,
                      true,
                    )} ${usedToken?.symbol}`;
                    break;
                  }
                  case EvmInputDisplayType.UINT256:
                  case EvmInputDisplayType.NUMBER:
                    value = FormatUtils.withCommas(input.value);
                    break;
                  case EvmInputDisplayType.STRING:
                    value = String(input.value);
                    break;
                  default:
                    value = '';
                }
                transactionConfirmationFields.otherFields.push({
                  name: `param ${index + 1}`,
                  type: inputDisplayType,
                  value: value,
                });
              }
            } else {
              transactionConfirmationFields.operationName =
                chrome.i18n.getMessage(
                  'dialog_evm_decrypt_send_transaction_title',
                );

              transactionConfirmationFields.otherFields.push({
                name: 'evm_transaction_data',
                type: EvmInputDisplayType.LONG_TEXT,
                value: params.data,
              });
            }
          };

          let abiSource: 'light-node' | 'signature-registry' = 'light-node';
          let abi = await EvmLightNodeUtils.getAbi(chainTmp.chainId, params.to);

          if (!abi) {
            abiSource = 'signature-registry';
            abi = await EvmTransactionParserUtils.findAbiFromData(
              params.data,
              chainTmp as EvmChain,
            );
          }

          let normalizedAbi = EvmTokensUtils.normalizeAbi(abi);

          const decodeTransactionData = (
            abiToDecode: any[] | null,
            decodeSource: 'light-node' | 'signature-registry',
          ) => {
            if (!abiToDecode) {
              return null;
            }

            try {
              const contract = new ethers.Contract(
                params.to,
                abiToDecode,
                connectedWallet,
              );
              const decoded = contract.interface.parseTransaction({
                data: params.data,
                value: params.value,
              });

              return decoded;
            } catch (error) {
              return null;
            }
          };

          let decodedTransactionData = decodeTransactionData(
            normalizedAbi,
            abiSource,
          );

          if (!decodedTransactionData && abiSource !== 'signature-registry') {
            const fallbackAbi = EvmTokensUtils.normalizeAbi(
              await EvmTransactionParserUtils.findAbiFromData(
                params.data,
                chainTmp as EvmChain,
              ),
            );

            const fallbackDecodedTransactionData = decodeTransactionData(
              fallbackAbi,
              'signature-registry',
            );

            if (fallbackDecodedTransactionData) {
              abiSource = 'signature-registry';
              normalizedAbi = fallbackAbi;
              decodedTransactionData = fallbackDecodedTransactionData;
            }
          }

          tData.abi = normalizedAbi ?? undefined;

          if (normalizedAbi && decodedTransactionData) {
            const contractType = EvmTokensUtils.getTokenType(normalizedAbi);
            const parsedArgs = decodedTransactionData.args
              ? EvmTransactionParserUtils.parseArgs(decodedTransactionData.args)
              : [];
            const contract = new ethers.Contract(
              params.to,
              normalizedAbi,
              connectedWallet,
            );

            tData.method = decodedTransactionData.name;
            tData.args = parsedArgs;
            tData.signature = decodedTransactionData.signature;

            setShouldDisplayBalanceChange(
              EvmTransactionParserUtils.shouldDisplayBalanceChange(
                normalizedAbi,
                decodedTransactionData.name,
              ),
            );

            const translatedOperationName = chrome.i18n.getMessage(
              `evm_operation_${decodedTransactionData.name}`,
            );
            transactionConfirmationFields.operationName =
              translatedOperationName && translatedOperationName.length > 0
                ? translatedOperationName
                : decodedTransactionData.name;

            const transactionInfo =
              await EvmTransactionParserUtils.verifyTransactionInformation(
                data.dappInfo.domain,
                params.to,
                usedAccount.wallet.address,
                proxyTarget,
              );
            lastTransactionInfo = transactionInfo;

            transactionHook.setUnableToReachBackend(
              !!(transactionInfo && transactionInfo.unableToReach),
            );

            transactionConfirmationFields.otherFields.push({
              name: 'evm_operation_smart_contract_address',
              type: EvmInputDisplayType.CONTRACT_ADDRESS,
              value: (
                <div
                  className="value-content address-content"
                  onClick={() => handleCopyAddress(tokenAddress!)}>
                  {usedToken && <EvmTokenLogo tokenInfo={usedToken} />}
                  <div>{EvmFormatUtils.formatAddress(tokenAddress!)}</div>
                </div>
              ),
              ...(await EvmTransactionParserUtils.getSmartContractWarningAndInfo(
                params.to,
                chainTmp.chainId,
                transactionInfo,
                accounts,
              )),
            });

            if (Number(decodedTransactionData.value) > 0) {
              transactionConfirmationFields.mainTokenAmount = {
                name: 'evm_main_token_amount',
                type: EvmInputDisplayType.BALANCE,
                value: `${FormatUtils.withCommas(
                  ethers.formatEther(Number(decodedTransactionData.value)),
                  18,
                  true,
                )}  ${chainTmp?.mainToken}`,
              };
            }

            let tokenId;

            if (decodedTransactionData.fragment.inputs) {
              for (
                let index = 0;
                index < decodedTransactionData.fragment.inputs.length;
                index++
              ) {
                const input = decodedTransactionData.fragment.inputs[index];
                const argumentValue = decodedTransactionData.args[index];

                if (
                  EvmTransactionParserUtils.recipientInputNameList.includes(
                    input.name,
                  )
                ) {
                  resolvedReceiver = String(argumentValue);
                  setReceiver(resolvedReceiver);
                  tData.to = argumentValue;
                }
                if (
                  EvmTransactionParserUtils.amountInputNameList.includes(
                    input.name,
                  )
                ) {
                  const decimals =
                    usedToken.type === EVMSmartContractType.ERC20
                      ? (usedToken as EvmSmartContractInfoErc20).decimals
                      : 18;
                  resolvedTransferAmount = new Decimal(argumentValue.toString())
                    .div(new Decimal(10).pow(decimals ?? 18))
                    .toNumber();
                  setTransferAmount(resolvedTransferAmount);
                }
                if (input.name === 'tokenId' || input.name === 'id') {
                  tokenId = argumentValue;
                }

                let value;
                const inputDisplayType =
                  EvmTransactionParserUtils.getDisplayInputType(
                    normalizedAbi,
                    decodedTransactionData.name,
                    input.type,
                    input.name,
                    usedToken,
                  );
                switch (inputDisplayType) {
                  case EvmInputDisplayType.WALLET_ADDRESS: {
                    const inputDisplay =
                      await transactionHook.getWalletAddressInput(
                        argumentValue,
                        chainTmp.chainId,
                        transactionInfo,
                        accounts,
                      );
                    value = inputDisplay.value;
                    break;
                  }
                  case EvmInputDisplayType.CONTRACT_ADDRESS: {
                    value = EvmFormatUtils.formatAddress(argumentValue);
                    break;
                  }

                  case EvmInputDisplayType.BALANCE: {
                    const decimals =
                      usedToken.type === EVMSmartContractType.ERC20
                        ? (usedToken as EvmSmartContractInfoErc20).decimals
                        : 18;
                    value = `${FormatUtils.withCommas(
                      new Decimal(argumentValue.toString())
                        .div(new Decimal(10).pow(decimals ?? 18))
                        .toNumber(),
                      decimals ?? 18,
                      true,
                    )}  ${usedToken?.symbol}`;
                    break;
                  }
                  case EvmInputDisplayType.NUMBER: {
                    value = FormatUtils.withCommas(argumentValue);
                    break;
                  }
                  case EvmInputDisplayType.STRING: {
                    value = String(argumentValue);
                    break;
                  }
                  default:
                    value = String(argumentValue);
                }
                transactionConfirmationFields.otherFields.push({
                  name: input.name,
                  type: inputDisplayType,
                  value: value,
                  warnings: await EvmTransactionParserUtils.getFieldWarnings(
                    normalizedAbi,
                    decodedTransactionData.name,
                    input.type,
                    input.name,
                    argumentValue,
                    chainTmp.chainId,
                    transactionInfo,
                    accounts,
                  ),
                });
              }
              if (
                (contractType === EVMSmartContractType.ERC721 ||
                  contractType === EVMSmartContractType.ERC1155) &&
                tokenId
              ) {
                const metadata = await EvmNFTUtils.getMetadata(
                  contractType,
                  tokenId,
                  contract,
                );
                const src = metadata.image;
                transactionConfirmationFields.otherFields.push({
                  name: '',
                  type: EvmInputDisplayType.STRING_CENTERED,
                  value: <div className="nft-name">{metadata.name}</div>,
                });
                transactionConfirmationFields.otherFields.push({
                  name: '',
                  type: EvmInputDisplayType.IMAGE,
                  value: <img src={src} />,
                });
              }
            }

            if (resolvedReceiver && resolvedTransferAmount !== undefined) {
              tData.decodedData = {
                receiverAddress: resolvedReceiver,
                amount: resolvedTransferAmount,
              };
            }
          } else {
            await populateFallbackParsedDataFields(
              normalizedAbi ? 'decode-failed' : 'missing-abi',
            );
          }

          tData.from = params.from;
          tData.value = params.value;
          tData.to = tokenAddress!;
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
          lastTransactionInfo = transactionInfo;
          transactionHook.setUnableToReachBackend(
            !!(transactionInfo && transactionInfo.unableToReach),
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
        lastTransactionInfo = transactionInfo;

        transactionHook.setUnableToReachBackend(
          !!(transactionInfo && transactionInfo.unableToReach),
        );

        setTokenInfo(
          (await EvmTokensUtils.getMainTokenInfo(
            chainTmp as EvmChain,
          )) as EvmSmartContractInfo,
        );

        setShouldDisplayBalanceChange(true);

        transactionConfirmationFields.operationName = chrome.i18n.getMessage(
          'evm_operation_transfer',
        );

        transactionConfirmationFields.mainTokenAmount = {
          name: 'evm_main_token_amount',
          type: EvmInputDisplayType.BALANCE,
          value: `${FormatUtils.withCommas(
            new Decimal(Number(params.value))
              .div(new Decimal(EvmFormatUtils.WEI))
              .toNumber(),
            8,
            true,
          )} ${(chainTmp as EvmChain)?.mainToken}`,
        };

        transactionConfirmationFields.otherFields.push(
          await transactionHook.getWalletAddressInput(
            params.from,
            chainTmp.chainId,
            transactionInfo,
            accounts,
            'evm_operation_from',
            true,
          ),
        );

        transactionConfirmationFields.otherFields.push(
          await transactionHook.getWalletAddressInput(
            params.to,
            chainTmp.chainId,
            transactionInfo,
            accounts,
            'evm_operation_to',
          ),
        );

        resolvedReceiver = params.to;
        resolvedTransferAmount = new Decimal(
          ethers.toBigInt(params?.value ?? '0').toString(),
        )
          .div(new Decimal(EvmFormatUtils.WEI))
          .toNumber();
        setReceiver(resolvedReceiver);
        setTransferAmount(resolvedTransferAmount);
        tData.decodedData = {
          receiverAddress: resolvedReceiver!,
          amount: resolvedTransferAmount,
        };

        setTokenInfo(
          (await EvmTokensUtils.getMainTokenInfo(
            chainTmp as EvmChain,
          )) as EvmSmartContractInfo,
        );

        tData.from = params.from;
        tData.value = params.value;
        tData.to = params.to;
      }

      tData.type =
        params.type ?? (chainTmp as EvmChain)?.defaultTransactionType;

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
        case EvmTransactionType.EIP_155: {
          transactionConfirmationFields.otherFields.push({
            name: 'evm_access_list',
            type: EvmInputDisplayType.LONG_TEXT,
            value: JSON.stringify(params.accessList),
            style: { fontWeight: 500 },
          });
          setCaption(chrome.i18n.getMessage('evm_access_list_caption_message'));
          break;
        }
      }
      setTransactionData(tData);
      transactionConfirmationFields.otherFields = reorderEvmConfirmationFields(
        transactionConfirmationFields.otherFields,
      );
      transactionHook.setFields(transactionConfirmationFields);
      if (lastTransactionInfo) {
        void transactionHook.hydrateDomainFieldWarnings(lastTransactionInfo);
      }
    } else {
      Logger.error('No corresponding account found');
    }
    setTimeout(() => {
      transactionHook.setReady(true);
      transactionHook.setLoading(false);
    }, 250);
  };

  const initBalance = async (tokenInfo: EvmSmartContractInfo) => {
    setBalanceInfo(
      await EvmTokensUtils.getBalanceInfo(
        selectedAccount?.wallet.address!,
        chain!,
        tokenInfo,
        transferAmount!,
        transactionHook.selectedFee,
      ),
    );
  };

  const handleClickOnConfirm = () => {
    if (
      transactionHook.selectedFee?.maxFeeInEth.equals(-1) ||
      transactionHook.selectedFee?.estimatedFeeInEth.equals(-1) ||
      transactionHook.selectedFee?.gasLimit.equals(-1) ||
      transactionHook.selectedFee?.priorityFeeInGwei?.equals(-1)
    ) {
      // Force open gas fee panel
      forceOpenGasFeePanelEvent.emit('forceOpenCustomFeePanel');
    }
    transactionHook.handleOnConfirmClick();
  };

  const handleCancel = () => {
    afterCancel(request.request_id, data.tab);
  };

  return (
    <>
      {transactionHook.fields && (
        <EvmOperation
          afterCancel={handleCancel}
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
              {transactionHook.ready &&
                transactionHook.fields &&
                chain &&
                selectedAccount &&
                transactionData &&
                transactionData.type !== EvmTransactionType.EIP_155 && (
                  <GasFeePanel
                    chain={chain}
                    wallet={selectedAccount.wallet}
                    selectedFee={transactionHook.selectedFee}
                    onSelectFee={transactionHook.setSelectedFee}
                    transactionType={transactionData.type}
                    transactionData={transactionData}
                    setErrorMessage={transactionHook.setErrorMessage}
                  />
                )}
              {shouldDisplayBalanceChange &&
                balanceInfo &&
                balanceInfo.mainBalance.before &&
                balanceInfo.mainBalance.estimatedAfter && (
                  <BalanceChangeCard balanceInfo={balanceInfo} />
                )}
            </>
          }
          onConfirm={() => handleClickOnConfirm()}
          transactionHook={transactionHook}
        />
      )}
      <LoadingComponent hide={!transactionHook.loading} />
    </>
  );
};
