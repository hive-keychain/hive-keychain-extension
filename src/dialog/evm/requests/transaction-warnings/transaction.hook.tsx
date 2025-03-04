import { EvmRequest } from '@interfaces/evm-provider.interface';
import {
  EvmTransactionVerificationInformation,
  EvmTransactionWarning,
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
  TransactionConfirmationField,
  TransactionConfirmationFields,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import {
  EvmInputDisplayType,
  EvmTransactionParserUtils,
} from '@popup/evm/utils/evm-transaction-parser.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useState } from 'react';
import { ConfirmationPageEvmFields } from 'src/common-ui/confirmation-page/confirmation-page.interface';
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

  const [confirmationPageFields, setConfirmationPageFields] =
    useState<ConfirmationPageEvmFields[]>();

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

  // TODO
  const ignoreAllWarnings = () => {
    if (fields) {
      const newFields: TransactionConfirmationFields = { ...fields! };
      for (const fields of newFields.otherFields) {
        if (fields.warnings)
          fields.warnings.forEach((warning) => {
            warning.ignored = true;
          });
      }
      setFields(newFields);
    } else if (confirmationPageFields) {
      const newFields: ConfirmationPageEvmFields[] = [
        ...confirmationPageFields,
      ];

      for (const fields of newFields) {
        if (fields.warnings)
          fields.warnings.forEach((warning) => {
            warning.ignored = true;
          });
      }
      setConfirmationPageFields(newFields);
    }
    closePopup();
  };

  const getAllNotIgnoredWarnings = (): EvmTransactionWarning[] => {
    const localFields = getFields();

    if (!localFields || localFields.length === 0) return [];
    const warnings: EvmTransactionWarning[] = [];
    localFields.forEach((field) =>
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
      //TODO  display error message
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

  // TODO fix
  const handleOnConfirmClick = () => {
    if (hasWarning()) {
      setWarningsPopupOpened(true);
    } else {
      setLoading(true);

      if (fields) {
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
      } else if (confirmationPageFields) {
        //TODO see what to do here
        console.log('on confirmation page');
      }
    }
  };

  const getFields = () => {
    if (fields) return fields.otherFields;
    else if (confirmationPageFields) {
      return confirmationPageFields;
    } else return [];
  };

  const getAllFieldsWithNotIgnoredWarnings = () => {
    const localFields = getFields();
    console.log({ localFields, fields, confirmationPageFields });
    if (!localFields || localFields.length === 0) return [];
    //@ts-ignore
    return localFields.filter(
      (field: TransactionConfirmationField | ConfirmationPageEvmFields) =>
        field.warnings &&
        field.warnings.some(
          (warning: EvmTransactionWarning) => warning.ignored === false,
        ),
    );
  };

  const hasWarning = () => {
    const localFields = getFields();

    if (localFields)
      return localFields?.some(
        (field) =>
          field.warnings &&
          field.warnings.length > 0 &&
          field.warnings.some((warning) => warning.ignored === false),
      );

    return false;
  };

  const ignoreWarning = (fieldIndex: number, warningIndex: number) => {
    if (fields) {
      const newFields: TransactionConfirmationFields = { ...fields! };
      if (
        newFields.otherFields &&
        !!newFields.otherFields[fieldIndex].warnings
      ) {
        newFields.otherFields[fieldIndex].warnings![warningIndex].ignored =
          true;
      }
      setFields(newFields);
    } else if (confirmationPageFields) {
      const newFields: ConfirmationPageEvmFields[] = [
        ...confirmationPageFields,
      ];
      if (!!newFields[fieldIndex].warnings) {
        newFields[fieldIndex].warnings![warningIndex].ignored = true;
      }
      setConfirmationPageFields(newFields);
    }

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
    confirmationPageFields,
    setConfirmationPageFields,
  };
};

export type useTransactionHook = ReturnType<typeof useTransactionHook>;
