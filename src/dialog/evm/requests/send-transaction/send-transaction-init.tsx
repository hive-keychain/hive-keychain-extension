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
import { EvmAccountOrPublic } from '@popup/evm/interfaces/wallet.interface';
import { EvmTokenLogo } from '@popup/evm/pages/home/evm-token-logo/evm-token-logo.component';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
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
import { ethers } from 'ethers';
import React from 'react';
import { EvmAccountImage } from 'src/common-ui/evm/evm-account-image/evm-account-image.component';
import { EvmAddressComponent } from 'src/common-ui/evm/evm-address/evm-address.component';
import { formatDecodedArgumentDisplayValue } from 'src/dialog/evm/requests/send-transaction/send-transaction-argument-format';
import {
  formatDecodedTupleForConfirmationField,
  isTupleAbiInput,
  type AbiParamFragment,
} from 'src/dialog/evm/requests/send-transaction/send-transaction-decoded-tuple';
import type { RunSendTransactionInitParams } from 'src/dialog/evm/requests/send-transaction/send-transaction.types';
import {
  removeMatchingFromField,
  reorderEvmConfirmationFields,
} from 'src/dialog/evm/requests/transaction-warnings/transaction-field-order.utils';
import FormatUtils from 'src/utils/format.utils';
import Logger from 'src/utils/logger.utils';

const renderCopyableFormattedAddress = (
  address: string,
  chainId: string,
  localAccounts: EvmAccountOrPublic[],
  prefix?: React.ReactNode,
) => (
  <EvmAddressComponent
    address={address}
    chainId={chainId}
    canCopy
    prefix={prefix}
    localAccounts={localAccounts}
  />
);

const formatExactDecimalWithCommas = (
  value: string,
  decimals: number,
  removeTrailingZeros = false,
) => {
  const parts = new Decimal(value).toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  let finalNumber = parts.join('.');

  if (removeTrailingZeros) {
    finalNumber = finalNumber.replace(
      /^([\d,]+)$|^([\d,]+)\.0*$|^([\d,]+\.[0-9]*?)0*$/,
      '$1$2$3',
    );
  }

  return finalNumber;
};

export const formatMainTokenWeiAmount = (
  value: ethers.BigNumberish,
  symbol?: string,
) =>
  `${formatExactDecimalWithCommas(
    ethers.formatEther(value),
    18,
    true,
  )} ${symbol ?? ''}`.trim();

const getNativePaymentValue = (
  decodedValue: ethers.BigNumberish | null | undefined,
  requestValue: ethers.BigNumberish | null | undefined,
) => {
  const decodedValueIsPositive =
    decodedValue != null && ethers.toBigInt(decodedValue) > BigInt(0);
  const value = decodedValueIsPositive ? decodedValue : requestValue;

  if (value == null || ethers.toBigInt(value) <= BigInt(0)) {
    return null;
  }

  return value;
};

const getDecodedFieldName = (
  tokenType: EVMSmartContractType | null,
  methodName: string,
  inputName: string,
  inputType: string,
  inputIndex: number,
) => {
  const normalizedMethodName = methodName.toLowerCase();
  const normalizedTokenType = `${tokenType ?? ''}`.toUpperCase();
  const normalizedInputType = `${inputType ?? ''}`.toLowerCase();
  const isErc721Like =
    normalizedTokenType.includes('ERC721') ||
    normalizedTokenType.includes('ERC721_ENUMERABLE');
  const isNft = isErc721Like || normalizedTokenType.includes('ERC1155');

  if (inputName === 'numberOfTokens') {
    return 'evm_nft_number_of_tokens';
  }

  if (isErc721Like && normalizedMethodName === 'approve' && inputIndex === 0) {
    return 'evm_operation_to';
  }

  if (
    isErc721Like &&
    normalizedMethodName === 'approve' &&
    (inputIndex === 1 ||
      normalizedInputType.startsWith('uint') ||
      ['amount', 'tokenid', 'id'].includes(inputName.toLowerCase()))
  ) {
    return 'evm_nft_token_id';
  }

  if (
    isNft &&
    normalizedMethodName === 'setapprovalforall' &&
    (inputName === 'approved' || inputName === '_approved')
  ) {
    return 'evm_nft_approve_all';
  }

  return inputName?.trim() ? inputName : `param ${inputIndex + 1}`;
};

const shouldDisplayDecodedField = (
  tokenType: EVMSmartContractType | null,
  methodName: string,
  inputIndex: number,
) => {
  const normalizedMethodName = methodName.toLowerCase();
  const normalizedTokenType = `${tokenType ?? ''}`.toUpperCase();
  const isErc721Like =
    normalizedTokenType.includes('ERC721') ||
    normalizedTokenType.includes('ERC721_ENUMERABLE');

  if (isErc721Like && normalizedMethodName === 'approve') {
    return inputIndex <= 1;
  }

  return true;
};

const isNftTokenType = (tokenType?: EVMSmartContractType | null) => {
  const normalizedTokenType = `${tokenType ?? ''}`.toUpperCase();
  return (
    normalizedTokenType.includes('ERC721') ||
    normalizedTokenType.includes('ERC721_ENUMERABLE') ||
    normalizedTokenType.includes('ERC1155')
  );
};

const getDecodedFieldTokenType = (
  contractType: EVMSmartContractType | null,
  usedTokenType: EVMSmartContractType,
) => {
  if (isNftTokenType(usedTokenType)) return usedTokenType;
  return contractType ?? usedTokenType;
};

export async function runSendTransactionInit(
  initParams: RunSendTransactionInitParams,
): Promise<void> {
  const { request, data, accounts, transactionHook, onCopyAddress, setters } =
    initParams;
  const {
    setChain,
    setSelectedAccount,
    setCaption,
    setTokenInfo,
    setReceiver,
    setTransferAmount,
    setShouldDisplayBalanceChange,
    setTransactionData,
    setPrefetchedMainTokenFromInit,
  } = setters;

  transactionHook.setLoading(true);
  transactionHook.setReady(false);
  let transactionConfirmationFields = {} as TransactionConfirmationFields;
  let lastTransactionInfo: EvmTransactionVerificationInformation | undefined;

  try {
    const chainTmp = await ChainUtils.getChain<EvmChain>(
      request.params[0].chainId ?? request.chainId!,
    );

    setChain(chainTmp as EvmChain);

    const params = request.params[0];
    let resolvedReceiver: string | null = null;
    let resolvedTransferAmount: number | undefined;

    const usedAccount = accounts.find(
      (account) =>
        EvmAccountUtils.getEvmAccountAddress(
          account as EvmAccountOrPublic,
        ).toLowerCase() === params.from.toLowerCase(),
    );
    const usedAccountAddress = usedAccount
      ? EvmAccountUtils.getEvmAccountAddress(usedAccount as EvmAccountOrPublic)
      : undefined;

    const contractPromise =
      params.data && params.to
        ? EvmLightNodeUtils.getContract(chainTmp.chainId, params.to).catch(
            (error) => {
              Logger.error(
                'Failed to fetch contract metadata from light node; falling back to bundled decoding',
                error,
              );
              return null;
            },
          )
        : undefined;
    const providerPromise = EthersUtils.getProvider(chainTmp as EvmChain);
    const mainTokenPromise = EvmTokensUtils.getMainTokenInfo(
      (chainTmp as EvmChain)!,
    ) as Promise<EvmSmartContractInfo>;
    const pendingTransactionWarningPromise =
      transactionHook.initPendingTransactionWarning(
        usedAccountAddress ?? params.from,
        chainTmp as EvmChain,
      );
    const usedAccountInputPromise = usedAccountAddress
      ? transactionHook.getWalletAddressInput(
          usedAccountAddress,
          chainTmp.chainId,
          {} as EvmTransactionVerificationInformation,
          accounts,
          'dialog_account',
        )
      : Promise.resolve(null);

    const mainToken = await mainTokenPromise;
    setPrefetchedMainTokenFromInit(mainToken);
    setTokenInfo(mainToken);
    setTransferAmount(
      new Decimal(ethers.toBigInt(params?.value ?? '0').toString())
        .div(new Decimal(EvmFormatUtils.WEI))
        .toNumber(),
    );
    setShouldDisplayBalanceChange(true);

    await pendingTransactionWarningPromise;

    if (usedAccount && usedAccountAddress) {
      const { wallet: _omitWallet, ...rest } = usedAccount as any;
      setSelectedAccount({ ...rest, address: usedAccountAddress });
    }

    const provider = await providerPromise;
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
      const usedAccountInput = await usedAccountInputPromise;
      if (usedAccountInput) {
        transactionConfirmationFields.otherFields.push({
          ...usedAccountInput,
        });
      }

      // Case with data
      if (params.data) {
        tData.value = params.value;

        tokenAddress = params.to;
        // Case of the execution of a smart contract
        if (params.to) {
          const fetchedContractOnce = (await contractPromise!) ?? undefined;
          const fallbackTokenInfo: EvmSmartContractInfoErc20 = {
            type: EVMSmartContractType.ERC20,
            chainId: String(chainTmp.chainId),
            contractAddress: tokenAddress!,
            name: '',
            symbol: '',
            logo: '',
            backgroundColor: '',
            priceUsd: 0,
            decimals: 18,
            validated: 0,
            isProxy: false,
            proxyTarget: null,
            possibleSpam: false,
            verifiedContract: false,
          };
          const usedTokenPromise = EvmTokensUtils.getTokenInfo(
            chainTmp.chainId,
            tokenAddress!,
            fetchedContractOnce,
          ).catch((error) => {
            Logger.error(
              'Failed to resolve token info from light node; using minimal fallback',
              error,
            );
            return fallbackTokenInfo as EvmSmartContractInfo;
          });
          const lightNodeAbiPromise = EvmLightNodeUtils.getAbi(
            chainTmp.chainId,
            params.to,
            fetchedContractOnce,
          ).catch((error) => {
            Logger.error(
              'Failed to fetch ABI from light node; bundled-ABI fallback will be used if applicable',
              error,
            );
            return null;
          });
          const [usedToken, lightNodeAbi] = await Promise.all([
            usedTokenPromise,
            lightNodeAbiPromise,
          ]);
          const proxyTarget =
            usedToken.type !== EVMSmartContractType.NATIVE
              ? usedToken.proxyTarget
              : null;
          const transactionInfoPromise =
            EvmTransactionParserUtils.verifyTransactionInformation(
              data.dappInfo.domain,
              params.to,
              usedAccountAddress,
              proxyTarget,
            );
          const populateFallbackParsedDataFields = async (reason: string) => {
            const transactionInfo = await transactionInfoPromise;
            lastTransactionInfo = transactionInfo;

            transactionHook.setUnableToReachBackend(
              !!(transactionInfo && transactionInfo.unableToReach),
            );

            transactionConfirmationFields.otherFields.push({
              name: 'evm_operation_smart_contract_address',
              type: EvmInputDisplayType.CONTRACT_ADDRESS,
              value: renderCopyableFormattedAddress(
                tokenAddress!,
                chainTmp.chainId,
                accounts,
                <EvmAccountImage address={tokenAddress!} small />,
              ),
              ...(await EvmTransactionParserUtils.getSmartContractWarningAndInfo(
                params.to,
                chainTmp.chainId,
                transactionInfo,
                accounts,
                usedToken,
              )),
            });

            transactionConfirmationFields.operationName =
              chrome.i18n.getMessage(
                'dialog_evm_decrypt_send_transaction_title',
              );

            transactionConfirmationFields.otherFields.push({
              name: 'evm_transaction_data',
              type: EvmInputDisplayType.LONG_TEXT,
              value: params.data,
            });
          };

          const abi = lightNodeAbi;

          let normalizedAbi = EvmTokensUtils.normalizeAbi(abi);
          const normalizedBundledAbi = EvmTokensUtils.normalizeAbi(
            EvmTransactionParserUtils.getBundledAbiByDataSelector(params.data),
          );
          const hasAnyAbi = !!normalizedAbi || !!normalizedBundledAbi;

          const decodeTransactionData = (abiToDecode: any[] | null) => {
            if (!abiToDecode) {
              return null;
            }

            try {
              const contract = new ethers.Contract(
                params.to,
                abiToDecode,
                provider,
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

          let decodedTransactionData = decodeTransactionData(normalizedAbi);
          if (
            (!normalizedAbi || !decodedTransactionData) &&
            normalizedBundledAbi
          ) {
            const bundledDecodedTransactionData =
              decodeTransactionData(normalizedBundledAbi);
            if (bundledDecodedTransactionData) {
              normalizedAbi = normalizedBundledAbi;
              decodedTransactionData = bundledDecodedTransactionData;
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
              provider,
            );

            tData.method = decodedTransactionData.name;
            tData.args = parsedArgs;
            tData.signature = decodedTransactionData.signature;

            const shouldDisplayTokenBalance =
              EvmTransactionParserUtils.shouldDisplayBalanceChange(
                normalizedAbi,
                decodedTransactionData.name,
              );
            const shouldUseDecodedAmountForBalance = shouldDisplayTokenBalance;

            if (shouldDisplayTokenBalance) {
              setTokenInfo(usedToken);
            }

            setShouldDisplayBalanceChange(true);

            const translatedOperationName = chrome.i18n.getMessage(
              `evm_operation_${decodedTransactionData.name}`,
            );
            transactionConfirmationFields.operationName =
              translatedOperationName && translatedOperationName.length > 0
                ? translatedOperationName
                : decodedTransactionData.name;

            const transactionInfo = await transactionInfoPromise;
            lastTransactionInfo = transactionInfo;

            transactionHook.setUnableToReachBackend(
              !!(transactionInfo && transactionInfo.unableToReach),
            );

            transactionConfirmationFields.otherFields.push({
              name: 'evm_operation_smart_contract_address',
              type: EvmInputDisplayType.CONTRACT_ADDRESS,
              value: renderCopyableFormattedAddress(
                tokenAddress!,
                chainTmp.chainId,
                accounts,
                <EvmAccountImage address={tokenAddress!} small />,
              ),
              ...(await EvmTransactionParserUtils.getSmartContractWarningAndInfo(
                params.to,
                chainTmp.chainId,
                transactionInfo,
                accounts,
                usedToken,
              )),
            });

            const nativePaymentValue = getNativePaymentValue(
              decodedTransactionData.value,
              params.value,
            );

            if (nativePaymentValue) {
              transactionConfirmationFields.mainTokenAmount = {
                name: 'evm_main_token_amount',
                type: EvmInputDisplayType.BALANCE,
                value: formatMainTokenWeiAmount(
                  nativePaymentValue,
                  chainTmp?.mainToken,
                ),
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
                  ) &&
                  (typeof argumentValue === 'string' ||
                    typeof argumentValue === 'bigint')
                ) {
                  resolvedReceiver = String(argumentValue);
                  setReceiver(resolvedReceiver);
                  if (typeof argumentValue === 'string') {
                    tData.to = argumentValue;
                  }
                }
                if (
                  shouldUseDecodedAmountForBalance &&
                  EvmTransactionParserUtils.amountInputNameList.includes(
                    input.name,
                  ) &&
                  (typeof argumentValue === 'bigint' ||
                    typeof argumentValue === 'number' ||
                    typeof argumentValue === 'string')
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

                const inputDisplayType =
                  EvmTransactionParserUtils.getDisplayInputType(
                    normalizedAbi,
                    decodedTransactionData.name,
                    input.type,
                    input.name,
                    usedToken,
                  );
                const resolvedDisplayType = isTupleAbiInput(input as AbiParamFragment)
                  ? EvmInputDisplayType.TUPLE
                  : inputDisplayType;
                const decodedFieldTokenType = getDecodedFieldTokenType(
                  contractType,
                  usedToken.type,
                );
                const fieldName = getDecodedFieldName(
                  decodedFieldTokenType,
                  decodedTransactionData.name,
                  input.name,
                  input.type,
                  index,
                );
                if (
                  !shouldDisplayDecodedField(
                    decodedFieldTokenType,
                    decodedTransactionData.name,
                    index,
                  )
                ) {
                  continue;
                }
                const fieldAddress = [
                  EvmInputDisplayType.ADDRESS,
                  EvmInputDisplayType.WALLET_ADDRESS,
                ].includes(resolvedDisplayType)
                  ? String(argumentValue)
                  : undefined;
                const value = isTupleAbiInput(input as AbiParamFragment)
                  ? await formatDecodedTupleForConfirmationField(
                      input as AbiParamFragment,
                      argumentValue,
                      usedToken,
                      chainTmp as EvmChain,
                      transactionInfo,
                      accounts,
                      transactionHook,
                      normalizedAbi,
                      decodedTransactionData.name,
                    )
                  : await formatDecodedArgumentDisplayValue(
                      inputDisplayType,
                      argumentValue,
                      usedToken,
                      chainTmp as EvmChain,
                      transactionInfo,
                      accounts,
                      transactionHook,
                    );
                transactionConfirmationFields.otherFields.push({
                  name: fieldName,
                  type: resolvedDisplayType,
                  value: value,
                  ...(fieldAddress ? { address: fieldAddress } : {}),
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
              hasAnyAbi ? 'decode-failed' : 'missing-abi',
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
              usedAccountAddress,
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
            usedAccountAddress,
          );
        lastTransactionInfo = transactionInfo;

        transactionHook.setUnableToReachBackend(
          !!(transactionInfo && transactionInfo.unableToReach),
        );

        setTokenInfo(mainToken);

        setShouldDisplayBalanceChange(true);

        transactionConfirmationFields.operationName = chrome.i18n.getMessage(
          'evm_operation_transfer',
        );

        transactionConfirmationFields.mainTokenAmount = {
          name: 'evm_main_token_amount',
          type: EvmInputDisplayType.BALANCE,
          value: formatMainTokenWeiAmount(
            params.value,
            (chainTmp as EvmChain)?.mainToken,
          ),
        };

        const [fromInput, toInput] = await Promise.all([
          transactionHook.getWalletAddressInput(
            params.from,
            chainTmp.chainId,
            transactionInfo,
            accounts,
            'evm_operation_from',
            true,
          ),
          transactionHook.getWalletAddressInput(
            params.to,
            chainTmp.chainId,
            transactionInfo,
            accounts,
            'evm_operation_to',
          ),
        ]);

        transactionConfirmationFields.otherFields.push(fromInput, toInput);

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
        removeMatchingFromField(transactionConfirmationFields.otherFields),
      );
      transactionHook.setFields(transactionConfirmationFields);
      if (lastTransactionInfo) {
        void transactionHook.hydrateDomainFieldWarnings(lastTransactionInfo);
      }
    } else {
      Logger.error('No corresponding account found');
    }
  } catch (error) {
    Logger.error(
      'Unhandled error while initializing send-transaction dialog; clearing loading state to avoid hang',
      error,
    );
  } finally {
    transactionHook.setReady(true);
    transactionHook.setLoading(false);
  }
}
