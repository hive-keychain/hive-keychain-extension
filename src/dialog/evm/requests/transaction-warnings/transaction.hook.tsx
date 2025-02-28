import { EvmRequest } from '@interfaces/evm-provider.interface';
import {
  EvmTransactionVerificationInformation,
  EvmTransactionWarning,
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
  TransactionConfirmationFields,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import {
  EvmInputDisplayType,
  EvmTransactionParserUtils,
} from '@popup/evm/utils/evm-transaction-parser.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useState } from 'react';
import { EvmAddressComponent } from 'src/common-ui/evm/evm-address/evm-address.component';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { EvmRequestMessage } from 'src/dialog/multichain/request/request-confirmation';

interface SelectedWarning {
  warning: EvmTransactionWarning;
  fieldIndex: number;
  warningIndex: number;
}

export const useTransactionHook = (
  data: EvmRequestMessage,
  request: EvmRequest,
) => {
  const [selectedSingleWarning, setSelectedSingleWarning] =
    useState<SelectedWarning>();

  const [fields, setFields] = useState<TransactionConfirmationFields>();
  const [bypassWarning, setBypassWarning] = useState(false);
  const [whitelistLabel, setWhitelistLabel] = useState('');
  const [warningsPopupOpened, setWarningsPopupOpened] = useState(false);
  const [singleWarningPopupOpened, setSingleWarningPopupOpened] =
    useState(false);

  const [selectedFee, setSelectedFee] = useState<GasFeeEstimationBase>();

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

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
            selectedSingleWarning.warning.onConfirm(whitelistLabel);
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

  const hasWarning = () => {
    return fields?.otherFields.some(
      (field) =>
        field.warnings &&
        field.warnings.length > 0 &&
        field.warnings.some((warning) => warning.ignored === false),
    );
  };

  const ignoreWarning = (fieldIndex: number, warningIndex: number) => {
    const newFields: TransactionConfirmationFields = { ...fields! };
    if (newFields.otherFields && !!newFields.otherFields[fieldIndex].warnings) {
      newFields.otherFields[fieldIndex].warnings![warningIndex].ignored = true;
    }
    setFields(newFields);
    closePopup();
  };

  const getDomainWarnings = async (
    transactionInfo: EvmTransactionVerificationInformation,
  ) => {
    return {
      name: 'dialog_evm_domain',
      type: EvmInputDisplayType.STRING,
      value: (
        <div className="value-content">
          <PreloadedImage src={data.dappInfo.logo} />
          <div>{data.dappInfo.domain}</div>
        </div>
      ),
      warnings: await EvmTransactionParserUtils.getDomainWarnings(
        data.dappInfo.domain,
        data.dappInfo.protocol,
        transactionInfo,
      ),
    };
  };
  const getWalletAddressInput = async (
    address: string,
    chainId: string,
    transactionInfo: EvmTransactionVerificationInformation,
  ) => {
    return {
      name: 'evm_operation_to',
      type: EvmInputDisplayType.WALLET_ADDRESS,
      value: <EvmAddressComponent address={address} chainId={chainId} />,
      warnings: await EvmTransactionParserUtils.getAddressWarning(
        address,
        chainId,
        transactionInfo,
      ),
    };
  };

  return {
    fields,
    setFields,
    selectedSingleWarning,
    setSelectedSingleWarning,
    bypassWarning,
    setBypassWarning,
    whitelistLabel,
    setWhitelistLabel,
    warningsPopupOpened,
    setWarningsPopupOpened,
    singleWarningPopupOpened,
    setSingleWarningPopupOpened,
    loading,
    setLoading,
    closePopup,
    ignoreAllWarnings,
    getAllFieldsWithNotIgnoredWarnings,
    handleSingleWarningIgnore,
    handleOnConfirmClick,
    hasWarning,
    ignoreWarning,
    getDomainWarnings,
    getWalletAddressInput,
    getAllNotIgnoredWarnings,
    openSingleWarningPopup,
    selectedFee,
    setSelectedFee,
    ready,
    setReady,
  };
};

export type useTransactionHook = ReturnType<typeof useTransactionHook>;
