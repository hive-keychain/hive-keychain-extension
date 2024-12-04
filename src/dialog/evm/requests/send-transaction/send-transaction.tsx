import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EtherscanApi } from '@popup/evm/api/etherscan.api';
import {
  EvmTokenInfoShort,
  EvmTokenInfoShortErc20,
} from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmTransactionType,
  EvmTransactionVerificationInformation,
  EvmTransactionWarning,
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
  ProviderTransactionData,
  TransactionConfirmationFields,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmTokenLogo } from '@popup/evm/pages/home/evm-token-logo/evm-token-logo.component';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import { EvmAddressesUtils } from '@popup/evm/utils/addresses.utils';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import {
  EvmInputDisplayType,
  EvmTransactionParserUtils,
} from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import Decimal from 'decimal.js';
import { ethers, HDNodeWallet } from 'ethers';
import React, { useEffect, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { Card } from 'src/common-ui/card/card.component';
import {
  BackgroundType,
  CheckboxPanelComponent,
} from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { EvmAccountDisplayComponent } from 'src/common-ui/evm/evm-account-display/evm-account-display.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
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

interface BalanceInfo {
  before: string;
  estimatedAfter: string;
}

interface SelectedWarning {
  warning: EvmTransactionWarning;
  fieldIndex: number;
  warningIndex: number;
}

export const SendTransaction = (props: Props) => {
  const { accounts, data, request } = props;

  const [caption, setCaption] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [warningsPopupOpened, setWarningsPopupOpened] = useState(false);
  const [singleWarningPopupOpened, setSingleWarningPopupOpened] =
    useState(false);
  const [chain, setChain] = useState<EvmChain>();
  const [tokenInfo, setTokenInfo] = useState<EvmTokenInfoShort>();
  const [selectedFee, setSelectedFee] = useState<GasFeeEstimationBase>();
  const [selectedAccount, setSelectedAccount] = useState<EvmAccount>();
  const [receiver, setReceiver] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState<number>();

  const [selectedSingleWarning, setSelectedSingleWarning] =
    useState<SelectedWarning>();

  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>();

  const [shouldDisplayBalanceChange, setShouldDisplayBalanceChange] =
    useState(false);

  const [transactionData, setTransactionData] =
    useState<ProviderTransactionData>();

  const [fields, setFields] = useState<TransactionConfirmationFields>();
  const [bypassWarning, setBypassWarning] = useState(false);
  const [whitelistLabel, setWhitelistLabel] = useState('');

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (tokenInfo && selectedAccount && transferAmount !== undefined) {
      initBalance(tokenInfo);
    }
  }, [tokenInfo, selectedAccount, transferAmount]);

  const getDomainWarnings = (
    transactionInfo: EvmTransactionVerificationInformation,
  ) => {
    return {
      name: 'dialog_evm_domain',
      type: EvmInputDisplayType.STRING,
      value: (
        <div className="value-content">
          <div>{data.dappInfo.domain}</div>
          <PreloadedImage src={data.dappInfo.logo} />
        </div>
      ),
      warnings: EvmTransactionParserUtils.getDomainWarnings(
        data.dappInfo.domain,
        data.dappInfo.protocol,
        transactionInfo,
      ),
    };
  };
  const getAddressInput = async (
    address: string,
    chainId: string,
    transactionInfo: EvmTransactionVerificationInformation,
  ) => {
    const label = await EvmAddressesUtils.getAddressLabel(address, chainId);
    return {
      name: 'evm_operation_to',
      type: EvmInputDisplayType.ADDRESS,
      value: (
        <div className="value-content-vertical">
          <div>{EvmFormatUtils.formatAddress(address)}</div>
          {label && <div className="label">{label}</div>}
        </div>
      ),
      warnings: await EvmTransactionParserUtils.getAddressWarning(
        address,
        chainId,
        transactionInfo,
      ),
    };
  };

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

          setShouldDisplayBalanceChange(
            EvmTransactionParserUtils.shouldDisplayBalanceChange(
              abi,
              decodedTransactionData?.name!,
            ),
          );

          transactionConfirmationFields.operationName =
            chrome.i18n.getMessage(
              `evm_operation_${decodedTransactionData?.name}`,
            ) ?? decodedTransactionData?.name;

          const transactionInfo =
            await EvmTransactionParserUtils.verifyTransactionInformation(
              data.dappInfo.domain,
              params.to,
              usedAccount.wallet.address,
            );
          console.log(transactionInfo);

          transactionConfirmationFields.otherFields.push(
            getDomainWarnings(transactionInfo),
          );

          transactionConfirmationFields.otherFields.push({
            name: 'evm_operation_smart_contract_address',
            type: EvmInputDisplayType.ADDRESS,
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
              type: EvmInputDisplayType.BALANCE,
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
              if (input.name === 'amount') {
                console.log(decodedTransactionData.args[index]);
                setTransferAmount(
                  new Decimal(Number(decodedTransactionData.args[index]))
                    .div(new Decimal(EvmFormatUtils.GWEI))
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
                ),
              });
            }

          tData.from = params.from;
          tData.value = params.value;
          tData.toContract = tokenAddress;
        } else {
          // Case of smart contract deployment
          // Unknown ABI
          console.log({ data });
          setCaption(
            chrome.i18n.getMessage(
              'evm_contract_deployment_transaction_caption',
            ),
          );

          setReceiver(null);

          tData.smartContract = params.data;

          transactionConfirmationFields.operationName = chrome.i18n.getMessage(
            `evm_operation_contract_deployment_transaction`,
          );

          const transactionInfo =
            await EvmTransactionParserUtils.verifyTransactionInformation(
              data.dappInfo.domain,
              params.to,
              usedAccount.wallet.address,
            );
          console.log(transactionInfo);

          transactionConfirmationFields.otherFields.push(
            getDomainWarnings(transactionInfo),
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
        console.log(transactionInfo);

        transactionConfirmationFields.otherFields.push(
          getDomainWarnings(transactionInfo),
        );

        setTokenInfo(
          await EvmTokensUtils.getMainTokenInfo(lastChain as EvmChain),
        );

        console.log({ params, chain });

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
          await getAddressInput(params.to, lastChain.chainId, transactionInfo),
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
    setLoading(false);
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

  const ignoreWarning = (fieldIndex: number, warningIndex: number) => {
    const newFields: TransactionConfirmationFields = { ...fields! };
    if (newFields.otherFields && !!newFields.otherFields[fieldIndex].warnings) {
      newFields.otherFields[fieldIndex].warnings![warningIndex].ignored = true;
    }
    setFields(newFields);
    closePopup();
  };

  const ignoreAllWarnings = () => {
    const newFields: TransactionConfirmationFields = { ...fields! };
    for (const fields of newFields.otherFields) {
      if (fields.warnings)
        fields.warnings.forEach((warning) => {
          warning.ignored = true;
        });
    }
    setFields(newFields);
    closePopup();
  };

  const hasWarning = () => {
    return fields?.otherFields.some(
      (field) =>
        field.warnings &&
        field.warnings.length > 0 &&
        field.warnings.some((warning) => warning.ignored === false),
    );
  };

  const getAllFieldsWithNotIgnoredWarnings = (
    fields: TransactionConfirmationFields,
  ) => {
    if (!fields) return [];
    return fields?.otherFields.filter(
      (field) =>
        field.warnings &&
        field.warnings.some((warning) => warning.ignored === false),
    );
  };

  const handleOnConfirmClick = () => {
    if (hasWarning()) {
      setWarningsPopupOpened(true);
    } else {
      setLoading(true);
      chrome.runtime.sendMessage({
        command: BackgroundCommand.ACCEPT_EVM_TRANSACTION,
        value: {
          request: request,
          tab: data.tab,
          domain: data.dappInfo.domain,
          extraData: {
            gasFee: selectedFee,
          },
        },
      });
    }
  };

  const closePopup = () => {
    setWarningsPopupOpened(false);
    setSingleWarningPopupOpened(false);
    setSelectedSingleWarning(undefined);
  };

  const openSingleWarningPopup = (
    fieldIndex: number,
    warningIndex: number,
    warning: EvmTransactionWarning,
  ) => {
    setSelectedSingleWarning({
      warning,
      fieldIndex,
      warningIndex,
    });

    setSingleWarningPopupOpened(true);
  };

  useEffect(() => {
    console.log({ fields: fields });
  });

  const handleSingleWarningIgnore = (
    selectedSingleWarning: SelectedWarning,
  ) => {
    if (
      selectedSingleWarning?.warning.level ===
        EvmTransactionWarningLevel.HIGH &&
      !bypassWarning
    ) {
      // display error message
    } else {
      if (selectedSingleWarning.warning.onConfirm) {
        switch (selectedSingleWarning.warning.type) {
          case EvmTransactionWarningType.WHITELIST_ADDRESS: {
            selectedSingleWarning.warning.onConfirm(
              whitelistLabel,
              receiver,
              chain?.chainId,
            );
            break;
          }
        }
      }
      setBypassWarning(false);
      ignoreWarning(
        selectedSingleWarning.fieldIndex!,
        selectedSingleWarning.warningIndex,
      );
    }
  };

  const getAllNotIgnoredWarnings = (): EvmTransactionWarning[] => {
    if (!fields) return [];
    const warnings: EvmTransactionWarning[] = [];
    fields.otherFields.forEach((field) =>
      warnings.push(
        ...(field.warnings?.filter((warning) => !warning.ignored) ?? []),
      ),
    );
    return warnings;
  };

  return (
    <>
      {fields && (
        <EvmOperation
          request={request}
          domain={data.dappInfo.domain}
          tab={data.tab}
          title={fields.operationName!}
          caption={caption}
          fields={
            <>
              {fields?.operationName && (
                <div className="transaction-operation-name">
                  {chrome.i18n.getMessage(
                    `evm_operation_${fields.operationName}`,
                  )}
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
                    content={fields.mainTokenAmount.value}
                  />
                )}

              {fields &&
                fields.otherFields?.map((f, index) => (
                  <EvmRequestItem
                    key={`${f.name}-${index}`}
                    field={f}
                    onWarningClicked={(warningIndex: number) =>
                      openSingleWarningPopup(
                        index,
                        warningIndex,
                        f.warnings![warningIndex],
                      )
                    }
                  />
                ))}
            </>
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
              {fields && chain && selectedAccount && transactionData && (
                <GasFeePanel
                  chain={chain}
                  tokenInfo={tokenInfo}
                  receiverAddress={receiver}
                  amount={transferAmount}
                  wallet={selectedAccount.wallet}
                  selectedFee={selectedFee}
                  onSelectFee={setSelectedFee}
                  transactionType={transactionData.type}
                  transactionData={transactionData}
                />
              )}
            </>
          }
          onConfirm={handleOnConfirmClick}
        />
      )}
      <LoadingComponent hide={!loading} />
      {warningsPopupOpened && hasWarning() && (
        <PopupContainer
          className="transaction-warning-content"
          onClickOutside={closePopup}>
          <div className="warning-top-panel">
            <SVGIcon className="icon" icon={SVGIcons.MESSAGE_ERROR} />
            <div className={`title`}>
              {chrome.i18n.getMessage(
                'evm_transaction_transaction_has_warning',
              )}
            </div>
          </div>
          <div className="warnings">
            {fields &&
              getAllFieldsWithNotIgnoredWarnings(fields).map((field) => (
                <>
                  <div className="field-name">
                    {chrome.i18n.getMessage(field.name)}
                  </div>
                  {field.warnings?.map((warning, warningIndex) => {
                    if (warning.ignored === false) {
                      return (
                        <div
                          className="warning"
                          key={`warning-${field.name}-warning-${warningIndex}`}>
                          <SVGIcon
                            className={`warning-icon ${warning?.level}`}
                            icon={SVGIcons.GLOBAL_WARNING}
                          />
                          <div className="warning-message">
                            {chrome.i18n.getMessage(warning?.message!)}
                          </div>
                        </div>
                      );
                    }
                  })}
                </>
              ))}
          </div>

          {EvmTransactionParserUtils.getHighestWarning(
            getAllNotIgnoredWarnings(),
          ) === EvmTransactionWarningLevel.HIGH && (
            <CheckboxPanelComponent
              onChange={(value) => setBypassWarning(value)}
              checked={bypassWarning}
              title="evm_transaction_warning_high_level_bypass_message"
              backgroundType={BackgroundType.FILLED}
            />
          )}

          <div className="buttons-container">
            <ButtonComponent
              label="dialog_cancel"
              type={ButtonType.ALTERNATIVE}
              onClick={closePopup}
              height="small"
            />
            <ButtonComponent
              type={ButtonType.IMPORTANT}
              label="evm_send_transaction_ignore_all_warnings"
              onClick={ignoreAllWarnings}
              height="small"
              disabled={
                EvmTransactionParserUtils.getHighestWarning(
                  getAllNotIgnoredWarnings(),
                ) === EvmTransactionWarningLevel.HIGH && !bypassWarning
              }
            />
          </div>
        </PopupContainer>
      )}
      {singleWarningPopupOpened && selectedSingleWarning && (
        <PopupContainer
          className="transaction-warning-content"
          onClickOutside={closePopup}>
          <div className="warning-top-panel">
            <SVGIcon className="icon" icon={SVGIcons.MESSAGE_ERROR} />
          </div>
          <div className="warnings">
            <div className="warning">
              <SVGIcon
                className={`warning-icon ${selectedSingleWarning.warning.level}`}
                icon={SVGIcons.GLOBAL_WARNING}
              />
              <div className="warning-message">
                {chrome.i18n.getMessage(selectedSingleWarning.warning.message!)}
              </div>
            </div>
          </div>
          {selectedSingleWarning.warning.level ===
            EvmTransactionWarningLevel.HIGH && (
            <CheckboxPanelComponent
              onChange={(value) => setBypassWarning(value)}
              checked={bypassWarning}
              title="evm_transaction_warning_high_level_bypass_message"
              backgroundType={BackgroundType.FILLED}
            />
          )}

          {selectedSingleWarning.warning.type ===
            EvmTransactionWarningType.WHITELIST_ADDRESS && (
            <InputComponent
              value={whitelistLabel}
              type={InputType.TEXT}
              onChange={setWhitelistLabel}
            />
          )}

          <div className="buttons-container">
            <ButtonComponent
              label="dialog_cancel"
              type={ButtonType.ALTERNATIVE}
              onClick={closePopup}
              height="small"
            />
            <ButtonComponent
              type={ButtonType.IMPORTANT}
              label="evm_send_transaction_ignore_warning"
              onClick={() => handleSingleWarningIgnore(selectedSingleWarning)}
              height="small"
              disabled={
                selectedSingleWarning.warning.level ===
                  EvmTransactionWarningLevel.HIGH && !bypassWarning
              }
            />
          </div>
        </PopupContainer>
      )}
    </>
  );
};
