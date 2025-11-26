import { EvmRequest } from '@interfaces/evm-provider.interface';
import { AvalancheApi } from '@popup/evm/api/avalanche.api';
import { BlockscoutApi } from '@popup/evm/api/blockscout.api';
import { EtherscanApi } from '@popup/evm/api/etherscan.api';
import {
  EvmSmartContractInfo,
  EvmSmartContractInfoErc20,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmTransactionType,
  ProviderTransactionData,
  TransactionConfirmationFields,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmTokenLogo } from '@popup/evm/pages/home/evm-token-logo/evm-token-logo.component';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import { EvmPrices } from '@popup/evm/reducers/prices.reducer';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmPricesUtils } from '@popup/evm/utils/evm-prices.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import {
  EvmInputDisplayType,
  EvmTransactionParserUtils,
} from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmNFTUtils } from '@popup/evm/utils/nft.utils';
import {
  BlockExplorerType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import Decimal from 'decimal.js';
import { ethers, HDNodeWallet, Wallet } from 'ethers';
import EventEmitter from 'events';
import React, { useEffect, useMemo, useState } from 'react';
import { Card } from 'src/common-ui/card/card.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { EvmTransactionWarningsComponent } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import { EvmRequestMessage } from 'src/dialog/multichain/request/request-confirmation';
import FormatUtils from 'src/utils/format.utils';
import Logger from 'src/utils/logger.utils';

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
  const [tokenInfo, setTokenInfo] = useState<EvmSmartContractInfo>();
  const [selectedAccount, setSelectedAccount] = useState<EvmAccount>();
  const [receiver, setReceiver] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState<number>();

  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>();

  const [shouldDisplayBalanceChange, setShouldDisplayBalanceChange] =
    useState(false);

  const [evmPrices, setEvmPrices] = useState<EvmPrices>();

  const [transactionData, setTransactionData] =
    useState<ProviderTransactionData>();

  const forceOpenGasFeePanelEvent = useMemo(() => new EventEmitter(), []);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (tokenInfo && selectedAccount && transferAmount !== undefined) {
      initBalance(tokenInfo);
    }
  }, [tokenInfo, selectedAccount, transferAmount]);

  const init = async () => {
    let transactionConfirmationFields = {} as TransactionConfirmationFields;

    const chainTmp = await ChainUtils.getChain<EvmChain>(data.data.chainId!);

    setChain(chainTmp as EvmChain);

    const mainToken = await EvmTokensUtils.getMainTokenInfo(
      (chainTmp as EvmChain)!,
    );
    setEvmPrices(await EvmPricesUtils.fetchPrices([mainToken]));

    const params = request.params[0];

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
    let tokenAddress;

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
            <div>{`${chainTmp.name} (${chainTmp.chainId})`}</div>
          </div>
        ),
      });
    }

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
        const proxy = await EvmTransactionParserUtils.getSmartContractProxy(
          params.to,
          chainTmp as EvmChain,
        );
        let abi;
        switch (chainTmp.blockExplorerApi?.type) {
          case BlockExplorerType.BLOCKSCOUT:
            abi = await BlockscoutApi.getAbi(
              chainTmp! as EvmChain,
              proxy ?? params.to,
            );
            break;
          case BlockExplorerType.AVALANCHE_SCAN: {
            abi = await AvalancheApi.getAbi(
              chainTmp! as EvmChain,
              proxy ?? params.to,
            );
            break;
          }
          case BlockExplorerType.BLOCKSCOUT:
            abi = await EtherscanApi.getAbi(
              chainTmp! as EvmChain,
              proxy ?? params.to,
            );
            break;
        }

        tData.abi = abi;

        tokenAddress = params.to;

        // Case of the execution of a smart contract
        if (params.to) {
          const usedToken = await EvmTokensUtils.getTokenInfo(
            chainTmp.chainId,
            tokenAddress,
          );

          setTokenInfo(usedToken);

          if (!abi) {
            abi = await EvmTransactionParserUtils.findAbiFromData(
              params.data,
              chainTmp as EvmChain,
            );
          }

          if (abi) {
            const contractType = EvmTokensUtils.getTokenType(abi);
            const contract = new ethers.Contract(
              params.to,
              abi,
              connectedWallet,
            );

            const decodedTransactionData = contract.interface.parseTransaction({
              data: params.data,
              value: params.value,
            });

            tData.method = decodedTransactionData?.name;
            tData.args = decodedTransactionData?.args;

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
                proxy,
              );

            transactionHook.setUnableToReachBackend(
              !!(transactionInfo && transactionInfo.unableToReach),
            );

            transactionConfirmationFields.otherFields.push(
              await transactionHook.getDomainWarnings(transactionInfo),
            );

            transactionConfirmationFields.otherFields.push({
              name: 'evm_operation_smart_contract_address',
              type: EvmInputDisplayType.CONTRACT_ADDRESS,
              value: (
                <div className="value-content">
                  {usedToken && <EvmTokenLogo tokenInfo={usedToken} />}
                  <div>{EvmFormatUtils.formatAddress(tokenAddress)}</div>
                </div>
              ),
              ...(await EvmTransactionParserUtils.getSmartContractWarningAndInfo(
                params.to,
                chainTmp.chainId,
                transactionInfo,
                accounts,
              )),
            });

            // TODO change here
            if (Number(decodedTransactionData?.value) > 0) {
              transactionConfirmationFields.mainTokenAmount = {
                name: 'evm_main_token_amount',
                type: EvmInputDisplayType.BALANCE,
                value: `${FormatUtils.withCommas(
                  Number(decodedTransactionData?.value),
                )}  ${chain?.mainToken}`,
              };
            }

            let tokenId;

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
                if (input.name === 'tokenId' || input.name === 'id') {
                  tokenId = decodedTransactionData.args[index];
                }

                let value;
                const inputDisplayType =
                  EvmTransactionParserUtils.getDisplayInputType(
                    abi,
                    decodedTransactionData.name,
                    input.type,
                    input.name,
                    tokenInfo,
                  );
                switch (inputDisplayType) {
                  case EvmInputDisplayType.WALLET_ADDRESS: {
                    const inputDisplay =
                      await transactionHook.getWalletAddressInput(
                        decodedTransactionData.args[index],
                        chainTmp.chainId,
                        transactionInfo,
                        accounts,
                      );
                    value = inputDisplay.value;
                    break;
                  }
                  case EvmInputDisplayType.CONTRACT_ADDRESS: {
                    value = EvmFormatUtils.formatAddress(
                      decodedTransactionData.args[index],
                    );
                    break;
                  }

                  case EvmInputDisplayType.BALANCE: {
                    value = `${FormatUtils.withCommas(
                      new Decimal(Number(decodedTransactionData.args[index]))
                        .div(
                          new Decimal(
                            Math.pow(
                              10,
                              (usedToken as EvmSmartContractInfoErc20).decimals,
                            ),
                          ),
                        )
                        .toNumber(),
                      (usedToken as EvmSmartContractInfoErc20).decimals,
                      true,
                    )}  ${usedToken?.symbol}`;
                    break;
                  }
                  case EvmInputDisplayType.NUMBER: {
                    value = FormatUtils.withCommas(
                      decodedTransactionData.args[index],
                    );
                    break;
                  }
                  case EvmInputDisplayType.STRING: {
                    value = String(decodedTransactionData.args[index]);
                    break;
                  }
                  default:
                    console.log({
                      inputDisplayType,
                      input,
                      decodedTransactionData,
                    });
                    value = String(decodedTransactionData.args[index]);
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
                    decodedTransactionData.args[index],
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
          } else {
            const transactionInfo =
              await EvmTransactionParserUtils.verifyTransactionInformation(
                data.dappInfo.domain,
                params.to,
                usedAccount.wallet.address,
                proxy,
              );

            transactionHook.setUnableToReachBackend(
              !!(transactionInfo && transactionInfo.unableToReach),
            );

            transactionConfirmationFields.otherFields.push(
              await transactionHook.getDomainWarnings(transactionInfo),
            );

            transactionConfirmationFields.otherFields.push({
              name: 'evm_operation_smart_contract_address',
              type: EvmInputDisplayType.CONTRACT_ADDRESS,
              value: (
                <div className="value-content">
                  {usedToken && <EvmTokenLogo tokenInfo={usedToken} />}
                  <div>{EvmFormatUtils.formatAddress(tokenAddress)}</div>
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

                  case EvmInputDisplayType.BALANCE:
                    value = `${FormatUtils.withCommas(
                      new Decimal(Number(input.value))
                        .div(new Decimal(EvmFormatUtils.WEI))
                        .toNumber(),
                      (usedToken as EvmSmartContractInfoErc20).decimals,
                      true,
                    )} ${usedToken?.symbol}`;
                    break;
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
              proxy,
            );
          transactionHook.setUnableToReachBackend(
            !!(transactionInfo && transactionInfo.unableToReach),
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

        transactionHook.setUnableToReachBackend(
          !!(transactionInfo && transactionInfo.unableToReach),
        );

        transactionConfirmationFields.otherFields.push(
          await transactionHook.getDomainWarnings(transactionInfo),
        );

        setTokenInfo(
          await EvmTokensUtils.getMainTokenInfo(chainTmp as EvmChain),
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

        setReceiver(params.to);
        setTransferAmount(
          new Decimal(Number(params?.value))
            .div(new Decimal(EvmFormatUtils.WEI))
            .toNumber(),
        );

        setTokenInfo(
          await EvmTokensUtils.getMainTokenInfo(chainTmp as EvmChain),
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
      transactionHook.setFields(transactionConfirmationFields);
    } else {
      Logger.error('No corresponding account found');
    }
    transactionHook.setReady(true);
    transactionHook.setLoading(false);
  };

  const initBalance = async (tokenInfo: EvmSmartContractInfo) => {
    const balance = await EvmTokensUtils.getTokenBalance(
      selectedAccount?.wallet.address!,
      chain!,
      tokenInfo,
    );

    setBalanceInfo({
      before: `${balance?.formattedBalance!} ${tokenInfo.symbol}`,
      estimatedAfter: `${FormatUtils.withCommas(
        new Decimal(balance?.balanceInteger!).sub(transferAmount!).toString(),
        (tokenInfo as EvmSmartContractInfoErc20).decimals || 8,
        true,
      )}  ${tokenInfo?.symbol}`,
    });
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

  return (
    <>
      {transactionHook.fields && evmPrices && (
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
              {shouldDisplayBalanceChange && balanceInfo && (
                <Card className="balance-change-panel">
                  <div className="balance-change-title">
                    {chrome.i18n.getMessage('evm_balance_change_title')}
                  </div>

                  <div className="balance-panel">
                    <div className="balance-before">{balanceInfo?.before}</div>
                    <SVGIcon
                      icon={SVGIcons.GLOBAL_TRIANGLE_ARROW}
                      className="icon"
                    />
                    <div className="balance-after">
                      {balanceInfo?.estimatedAfter}
                    </div>
                  </div>
                </Card>
              )}
              {transactionHook.ready &&
                transactionHook.fields &&
                chain &&
                selectedAccount &&
                transactionData &&
                transactionData.type !== EvmTransactionType.EIP_155 && (
                  <GasFeePanel
                    chain={chain}
                    tokenInfo={tokenInfo}
                    wallet={selectedAccount.wallet}
                    selectedFee={transactionHook.selectedFee}
                    onSelectFee={transactionHook.setSelectedFee}
                    transactionType={transactionData.type}
                    transactionData={transactionData}
                    prices={evmPrices}
                    setErrorMessage={transactionHook.setErrorMessage}
                  />
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
