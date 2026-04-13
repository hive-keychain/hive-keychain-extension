import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { Message } from '@interfaces/message.interface';
import { EtherRPCCustomError } from '@popup/evm/interfaces/evm-errors.interface';
import {
  EvmTransactionType,
  EvmTransactionVerificationInformation,
  EvmTransactionWarning,
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
  TransactionConfirmationField,
  TransactionConfirmationFields,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import {
  EvmInputDisplayType,
  EvmTransactionParserUtils,
} from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { MessageType } from '@reference-data/message-type.enum';
import { HDNodeWallet } from 'ethers';
import React, { useEffect, useState } from 'react';
import { ConfirmationPageEvmFields } from 'src/common-ui/confirmation-page/confirmation-page.interface';
import { EvmAddressComponent } from 'src/common-ui/evm/evm-address/evm-address.component';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { CommunicationUtils } from 'src/utils/communication.utils';
import { DappRequestUtils } from 'src/utils/dapp-request.utils';
import { EvmWarningUtils } from 'src/utils/evm/evm-warning.utils';

const EVM_DOMAIN_FIELD_NAME = 'dialog_evm_domain';

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

  const [duplicatedTransactionField, setDuplicatedTransactionWarning] =
    useState<TransactionConfirmationField>();

  const [pendingTransactionWarningField, setPendingTransactionWarningField] =
    useState<TransactionConfirmationField>();

  const [shouldDisplayBlockButton, setShouldDisplayBlockButton] =
    useState<boolean>();

  const [eip7702WarningField, setEip7702WarningField] =
    useState<TransactionConfirmationField>();

  const [unableToReachBackend, setUnableToReachBackend] = useState(false);

  const [message, setMessage] = useState<Message>();

  const [hasBlockingError, setHasBlockingError] = useState(false);

  useEffect(() => {
    initDuplicateRequestWarningField();
    initEip7702WarningField();

    initShouldDiplayBlockButton();
  }, [request]);

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

  const setErrorMessage = (error: EtherRPCCustomError | undefined) => {
    if (error) {
      setHasBlockingError(error.isBlocking ?? false);
    }
    if (error?.message) {
      setMessage({
        key: error.message,
        type: MessageType.ERROR,
        params: [],
      });
    } else {
      setMessage(undefined);
    }
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
        selectedSingleWarning.warning.warningKey,
      );
    }
  };

  const ignoreWarning = (
    fieldIndex: number,
    warningIndex: number,
    warningKey?: string,
  ) => {
    if (warningKey) {
      switch (warningKey) {
        case 'duplicatedTransaction': {
          if (duplicatedTransactionField) {
            const newDuplicated = { ...duplicatedTransactionField };
            newDuplicated.warnings![0].ignored = true;
            setDuplicatedTransactionWarning(newDuplicated);
          }
          break;
        }
        case 'pendingTransaction': {
          if (pendingTransactionWarningField) {
            const newPending = { ...pendingTransactionWarningField };
            newPending.warnings![0].ignored = true;
            setPendingTransactionWarningField(newPending);
          }
          break;
        }
        case 'eip7702': {
          if (eip7702WarningField) {
            const newEip7702 = { ...eip7702WarningField };
            newEip7702.warnings![0].ignored = true;
            setEip7702WarningField(newEip7702);
          }
          break;
        }
      }
    } else if (fields) {
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

  const ignoreAllWarnings = () => {
    if (fields) {
      if (duplicatedTransactionField) {
        const newDuplicated = { ...duplicatedTransactionField };
        newDuplicated.warnings![0].ignored = true;
        setDuplicatedTransactionWarning(newDuplicated);
      }
      if (pendingTransactionWarningField) {
        const newPending = { ...pendingTransactionWarningField };
        newPending.warnings![0].ignored = true;
        setPendingTransactionWarningField(newPending);
      }
      if (eip7702WarningField) {
        const newEip7702 = { ...eip7702WarningField };
        newEip7702.warnings![0].ignored = true;
        setEip7702WarningField(newEip7702);
      }

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

  const getAllFieldsWithNotIgnoredWarnings = () => {
    const localFields = getFields();

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

  const initPendingTransactionWarning = async (
    wallet: HDNodeWallet,
    chain: EvmChain,
  ) => {
    const pendingTransactionsInfo =
      await EvmTransactionsUtils.hasPendingTransaction(wallet, chain);
    if (pendingTransactionsInfo?.hasPending) {
      setPendingTransactionWarningField({
        name: '',
        type: EvmInputDisplayType.STRING,
        value: <div className="value-content"></div>,
        warnings: [
          {
            ignored: false,
            level: EvmTransactionWarningLevel.HIGH,
            message: 'evm_pending_transaction_warning',
            type: EvmTransactionWarningType.BASE,
            warningKey: 'pendingTransaction',
          },
        ],
      });
    }
  };

  const handleOnConfirmClick = () => {
    if (hasWarning()) {
      setWarningsPopupOpened(true);
    } else {
      setLoading(true);

      if (fields) {
        CommunicationUtils.runtimeSendMessage({
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
    if (fields)
      if (duplicatedTransactionField)
        return [...fields.otherFields, duplicatedTransactionField];
      else return fields.otherFields;
    else if (confirmationPageFields) {
      return confirmationPageFields;
    } else return [];
  };

  const hasWarning = () => {
    const localFields = getFields();

    const hasDuplicatedWarning =
      duplicatedTransactionField !== undefined &&
      duplicatedTransactionField.warnings !== undefined &&
      duplicatedTransactionField.warnings[0].ignored === false;

    const hasPendingTransactionWarning =
      pendingTransactionWarningField !== undefined &&
      pendingTransactionWarningField.warnings !== undefined &&
      pendingTransactionWarningField.warnings[0].ignored === false;

    const hasEip7702Warning =
      eip7702WarningField !== undefined &&
      eip7702WarningField.warnings !== undefined &&
      eip7702WarningField.warnings[0].ignored === false;

    if (localFields)
      return (
        localFields?.some(
          (field) =>
            field.warnings &&
            field.warnings.length > 0 &&
            field.warnings.some((warning) => warning.ignored === false),
        ) ||
        hasDuplicatedWarning ||
        hasPendingTransactionWarning ||
        hasEip7702Warning
      );

    return false;
  };

  /** Renders dapp domain immediately; call {@link hydrateDomainFieldWarnings} after verify. */
  const buildInitialDomainField = (): TransactionConfirmationField => ({
    name: EVM_DOMAIN_FIELD_NAME,
    type: EvmInputDisplayType.STRING,
    value: (
      <div className="value-content">
        <PreloadedImage src={data.dappInfo.logo} />
        <div>{data.dappInfo.domain}</div>
      </div>
    ),
    warnings: [],
  });

  const hydrateDomainFieldWarnings = async (
    transactionInfo: EvmTransactionVerificationInformation,
  ) => {
    const warnings = await EvmTransactionParserUtils.getDomainWarnings(
      data.dappInfo.domain,
      data.dappInfo.protocol,
      transactionInfo,
    );
    setFields((prev) => {
      if (!prev?.otherFields) return prev;
      const idx = prev.otherFields.findIndex(
        (f) => f.name === EVM_DOMAIN_FIELD_NAME,
      );
      if (idx === -1) return prev;
      const next: TransactionConfirmationFields = {
        ...prev,
        otherFields: [...prev.otherFields],
      };
      next.otherFields[idx] = { ...next.otherFields[idx], warnings };
      return next;
    });
  };
  const getWalletAddressInput = async (
    address: string,
    chainId: string,
    transactionInfo: EvmTransactionVerificationInformation,
    localAccounts: EvmAccount[],
    name: string = '',
    skipWarnings: boolean = false,
  ) => {
    return {
      name: name,
      type: EvmInputDisplayType.WALLET_ADDRESS,
      value: (
        <EvmAddressComponent
          address={address}
          chainId={chainId}
          canCopy={true}
        />
      ),
      warnings: skipWarnings
        ? []
        : await EvmTransactionParserUtils.getAddressWarning(
            address,
            chainId,
            transactionInfo,
            localAccounts,
          ),
    };
  };

  const initDuplicateRequestWarningField = async () => {
    if (!request.method) return;
    const savedRequest = await EvmWarningUtils.checkRequestHash(
      request,
      data.dappInfo.domain,
    );
    if (savedRequest) {
      const field: TransactionConfirmationField = {
        name: 'evm_warning_possible_duplicated_transaction_title',
        type: EvmInputDisplayType.LONG_TEXT,
        value: (
          <div>
            <b>{chrome.i18n.getMessage('evm_warning_eip7702_title')}</b>
            <div>{JSON.stringify(savedRequest.request)}</div>
          </div>
        ),
        warnings: [
          {
            ignored: false,
            level: EvmTransactionWarningLevel.HIGH,
            type: EvmTransactionWarningType.BASE,
            message: 'evm_warning_possible_duplicated_transaction',
            warningKey: 'duplicatedTransaction',
          } as EvmTransactionWarning,
        ],
      };
      setDuplicatedTransactionWarning(field);
    }
  };

  const initEip7702WarningField = async () => {
    if (!request.method) return;
    if (
      request.params &&
      request.params[0] &&
      request.params[0].type &&
      request.params[0].type === EvmTransactionType.EIP_7702
    ) {
      setEip7702WarningField({
        name: 'evm_warning_eip7702_title',
        type: EvmInputDisplayType.LONG_TEXT,
        value: null,
        warnings: [
          {
            ignored: false,
            level: EvmTransactionWarningLevel.HIGH,
            type: EvmTransactionWarningType.BASE,
            message: 'evm_warning_eip7702_message',
            warningKey: 'eip7702',
          } as EvmTransactionWarning,
        ],
      });
    }
  };

  const initShouldDiplayBlockButton = async () => {
    if (!request.method) return;
    setShouldDisplayBlockButton(
      await DappRequestUtils.checkIfHasTooManyRequest(data.dappInfo.domain),
    );
  };

  return {
    fields,
    // setTransactionFields,
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
    buildInitialDomainField,
    hydrateDomainFieldWarnings,
    getWalletAddressInput,
    getAllNotIgnoredWarnings,
    openSingleWarningPopup,
    selectedFee,
    setSelectedFee,
    ready,
    setReady,
    confirmationPageFields,
    setConfirmationPageFields,
    duplicatedTransactionField,
    shouldDisplayBlockButton,
    unableToReachBackend,
    setUnableToReachBackend,
    message,
    setErrorMessage,
    hasBlockingError,
    setHasBlockingError,
    initPendingTransactionWarning,
    pendingTransactionWarningField,
    eip7702WarningField,
  };
};

export type useTransactionHook = ReturnType<typeof useTransactionHook>;
