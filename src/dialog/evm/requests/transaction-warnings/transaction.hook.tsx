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
import { EvmAccountOrPublic } from '@popup/evm/interfaces/wallet.interface';
import {
  EvmInputDisplayType,
  EvmTransactionParserUtils,
} from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { MessageType } from '@reference-data/message-type.enum';
import React, { useEffect, useState } from 'react';
import { ConfirmationPageEvmFields } from 'src/common-ui/confirmation-page/confirmation-page.interface';
import { EvmAddressComponent } from 'src/common-ui/evm/evm-address/evm-address.component';
import { EvmRiskWarningUtils } from 'src/common-ui/evm/evm-risk-warning/evm-risk-warning.utils';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { CommunicationUtils } from 'src/utils/communication.utils';
import { DappRequestUtils } from 'src/utils/dapp-request.utils';
import { EvmWarningUtils } from 'src/utils/evm/evm-warning.utils';
import { WarningsPopupFieldRef } from 'src/dialog/evm/requests/transaction-warnings/warnings-popup-field-ref.type';

export type { WarningsPopupFieldRef };

const EVM_DOMAIN_FIELD_NAME = 'dialog_evm_domain';

export const useTransactionHook = (
  data: EvmRequestMessage,
  request: EvmRequest,
) => {
  const [fields, setFields] = useState<TransactionConfirmationFields>();

  const [confirmationPageFields, setConfirmationPageFields] =
    useState<ConfirmationPageEvmFields[]>();

  const [bypassWarning, setBypassWarning] = useState(false);
  const [whitelistLabels, setWhitelistLabels] = useState<Record<string, string>>(
    {},
  );

  const [warningsPopupOpened, setWarningsPopupOpened] = useState(false);
  const [warningsPopupFieldRef, setWarningsPopupFieldRef] =
    useState<WarningsPopupFieldRef | null>(null);

  const [selectedFee, setSelectedFee] = useState<GasFeeEstimationBase>();

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [securityCheckPending, setSecurityCheckPending] = useState(false);

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
    setWarningsPopupFieldRef(null);
    setWhitelistLabels({});
  };

  const resolveFieldByRef = (
    fieldRef: WarningsPopupFieldRef,
  ):
    | TransactionConfirmationField
    | ConfirmationPageEvmFields
    | undefined => {
    switch (fieldRef.type) {
      case 'dialog-other':
        return fields?.otherFields?.[fieldRef.index];
      case 'duplicate':
        return duplicatedTransactionField;
      case 'pending':
        return pendingTransactionWarningField;
      case 'eip7702':
        return eip7702WarningField;
      case 'confirmation':
        return confirmationPageFields?.[fieldRef.index];
      default:
        return undefined;
    }
  };

  const buildWhitelistLabelsForFields = (
    popupFields: (
      | TransactionConfirmationField
      | ConfirmationPageEvmFields
    )[],
  ): Record<string, string> => {
    const labels: Record<string, string> = {};
    popupFields.forEach((field) => {
      field.warnings?.forEach((warning, warningIndex) => {
        if (
          warning.type === EvmTransactionWarningType.WHITELIST_ADDRESS &&
          !warning.ignored
        ) {
          labels[
            EvmRiskWarningUtils.getWhitelistLabelKey(field.name, warningIndex)
          ] = EvmRiskWarningUtils.getWhitelistDefaultLabel(warning);
        }
      });
    });
    return labels;
  };

  const openWarningsPopup = (fieldRef?: WarningsPopupFieldRef) => {
    setWarningsPopupFieldRef(fieldRef ?? null);
    const popupFields = fieldRef
      ? (() => {
          const field = resolveFieldByRef(fieldRef);
          if (
            field?.warnings?.some((warning) => !warning.ignored)
          ) {
            return [field];
          }
          return [];
        })()
      : getAllFieldsWithNotIgnoredWarnings();
    setWhitelistLabels(buildWhitelistLabelsForFields(popupFields));
    setBypassWarning(false);
    setWarningsPopupOpened(true);
  };

  const setWhitelistLabelForWarning = (
    fieldName: string,
    warningIndex: number,
    value: string,
  ) => {
    setWhitelistLabels((previous) => ({
      ...previous,
      [EvmRiskWarningUtils.getWhitelistLabelKey(fieldName, warningIndex)]: value,
    }));
  };

  const getWhitelistLabelForWarning = (
    fieldName: string,
    warningIndex: number,
    warning: EvmTransactionWarning,
  ): string =>
    whitelistLabels[
      EvmRiskWarningUtils.getWhitelistLabelKey(fieldName, warningIndex)
    ] ??
    EvmRiskWarningUtils.getWhitelistDefaultLabel(warning);

  const getFieldsForWarningsPopup = () => {
    if (warningsPopupFieldRef) {
      const field = resolveFieldByRef(warningsPopupFieldRef);
      if (field?.warnings?.some((warning) => !warning.ignored)) {
        return [field];
      }
      return [];
    }
    return getAllFieldsWithNotIgnoredWarnings();
  };

  const getPopupNotIgnoredWarnings = (): EvmTransactionWarning[] =>
    EvmRiskWarningUtils.getActiveWarnings(
      EvmRiskWarningUtils.collectWarningsFromConfirmationFields(
        getFieldsForWarningsPopup(),
      ),
    );

  const markAllWarningsIgnoredOnFieldRef = (
    fieldRef: WarningsPopupFieldRef,
  ) => {
    const field = resolveFieldByRef(fieldRef);
    if (!field?.warnings) {
      return;
    }

    switch (fieldRef.type) {
      case 'duplicate': {
        if (duplicatedTransactionField) {
          const newDuplicated = { ...duplicatedTransactionField };
          newDuplicated.warnings = newDuplicated.warnings?.map((warning) => ({
            ...warning,
            ignored: true,
          }));
          setDuplicatedTransactionWarning(newDuplicated);
        }
        break;
      }
      case 'pending': {
        if (pendingTransactionWarningField) {
          const newPending = { ...pendingTransactionWarningField };
          newPending.warnings = newPending.warnings?.map((warning) => ({
            ...warning,
            ignored: true,
          }));
          setPendingTransactionWarningField(newPending);
        }
        break;
      }
      case 'eip7702': {
        if (eip7702WarningField) {
          const newEip7702 = { ...eip7702WarningField };
          newEip7702.warnings = newEip7702.warnings?.map((warning) => ({
            ...warning,
            ignored: true,
          }));
          setEip7702WarningField(newEip7702);
        }
        break;
      }
      case 'dialog-other': {
        if (fields?.otherFields) {
          const newFields: TransactionConfirmationFields = { ...fields };
          newFields.otherFields = [...newFields.otherFields];
          const targetField = {
            ...newFields.otherFields[fieldRef.index],
          };
          targetField.warnings = targetField.warnings?.map((warning) => ({
            ...warning,
            ignored: true,
          }));
          newFields.otherFields[fieldRef.index] = targetField;
          setFields(newFields);
        }
        break;
      }
      case 'confirmation': {
        if (confirmationPageFields) {
          const newFields = [...confirmationPageFields];
          const targetField = { ...newFields[fieldRef.index] };
          targetField.warnings = targetField.warnings?.map((warning) => ({
            ...warning,
            ignored: true,
          }));
          newFields[fieldRef.index] = targetField;
          setConfirmationPageFields(newFields);
        }
        break;
      }
      default:
        break;
    }
  };

  const ignorePopupWarnings = async () => {
    if (!warningsPopupFieldRef) {
      await ignoreAllWarnings();
      return;
    }

    const popupFields = getFieldsForWarningsPopup();
    for (const field of popupFields) {
      if (!field.warnings) {
        continue;
      }
      for (
        let warningIndex = 0;
        warningIndex < field.warnings.length;
        warningIndex++
      ) {
        const warning = field.warnings[warningIndex];
        if (!warning.ignored) {
          await confirmWarningResolution(
            warning,
            getWhitelistLabelForWarning(field.name, warningIndex, warning),
          );
        }
      }
      markAllWarningsIgnoredOnFieldRef(warningsPopupFieldRef);
    }
    closePopup();
  };

  const setErrorMessage = (error: EtherRPCCustomError | undefined) => {
    if (error) {
      setHasBlockingError(error.isBlocking ?? false);
    }
    if (error?.message) {
      setMessage({
        key: error.message,
        type: MessageType.ERROR,
        params: error.params ?? [],
      });
    } else {
      setMessage(undefined);
    }
  };

  const confirmWarningResolution = async (
    warning: EvmTransactionWarning,
    label?: string,
  ) => {
    if (!warning.onConfirm) return;

    switch (warning.type) {
      case EvmTransactionWarningType.WHITELIST_ADDRESS:
      case EvmTransactionWarningType.WHITELIST_ADDRESS_NO_LABEL: {
        await warning.onConfirm(label ?? warning.extraData?.defaultLabel ?? '');
        break;
      }
      default: {
        await warning.onConfirm();
      }
    }
  };

  const confirmAllWarningResolutions = async (
    warnings?: EvmTransactionWarning[],
    fieldName?: string,
  ) => {
    if (!warnings?.length) {
      return;
    }
    for (let warningIndex = 0; warningIndex < warnings.length; warningIndex++) {
      const warning = warnings[warningIndex];
      if (warning.ignored) {
        continue;
      }
      const labelKey = fieldName
        ? EvmRiskWarningUtils.getWhitelistLabelKey(fieldName, warningIndex)
        : undefined;
      const labelFromPopup =
        labelKey !== undefined ? whitelistLabels[labelKey] : undefined;
      const label =
        labelFromPopup !== undefined
          ? labelFromPopup
          : warning.type === EvmTransactionWarningType.WHITELIST_ADDRESS
            ? EvmRiskWarningUtils.getWhitelistDefaultLabel(warning) ||
              warning.extraData?.resolveAllLabel
            : warning.extraData?.resolveAllLabel ??
              warning.extraData?.defaultLabel;
      await confirmWarningResolution(warning, label);
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

  const ignoreAllWarnings = async () => {
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
    if (fields) {
      const newFields: TransactionConfirmationFields = { ...fields! };
      for (const otherField of newFields.otherFields) {
        if (otherField.warnings) {
          await confirmAllWarningResolutions(
            otherField.warnings,
            otherField.name,
          );
          otherField.warnings.forEach((warning) => {
            warning.ignored = true;
          });
        }
      }
      setFields(newFields);
    } else if (confirmationPageFields) {
      const newFields: ConfirmationPageEvmFields[] = [
        ...confirmationPageFields,
      ];

      for (const confirmationField of newFields) {
        if (confirmationField.warnings) {
          await confirmAllWarningResolutions(
            confirmationField.warnings,
            confirmationField.name,
          );
          confirmationField.warnings.forEach((warning) => {
            warning.ignored = true;
          });
        }
      }
      setConfirmationPageFields(newFields);
    }
    closePopup();
  };

  const getStandaloneWarningFields = (): TransactionConfirmationField[] => {
    const standaloneFields: TransactionConfirmationField[] = [];

    if (
      duplicatedTransactionField?.warnings?.some(
        (warning) => !warning.ignored,
      )
    ) {
      standaloneFields.push(duplicatedTransactionField);
    }

    if (
      pendingTransactionWarningField?.warnings?.some(
        (warning) => !warning.ignored,
      )
    ) {
      standaloneFields.push(pendingTransactionWarningField);
    }

    if (
      eip7702WarningField?.warnings?.some((warning) => !warning.ignored)
    ) {
      standaloneFields.push(eip7702WarningField);
    }

    return standaloneFields;
  };

  const getAllFieldsWithNotIgnoredWarnings = () => {
    const localFields = [
      ...getFields(),
      ...getStandaloneWarningFields(),
    ];

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

  const getAllNotIgnoredWarnings = (): EvmTransactionWarning[] => {
    const warnings: EvmTransactionWarning[] = [];
    getAllFieldsWithNotIgnoredWarnings().forEach((field) =>
      warnings.push(
        ...(field.warnings?.filter((warning) => !warning.ignored) ?? []),
      ),
    );
    return warnings;
  };

  const initPendingTransactionWarning = async (
    fromAddress: string,
    chain: EvmChain,
  ) => {
    const pendingTransactionsInfo =
      await EvmTransactionsUtils.hasPendingTransaction(fromAddress, chain);
    if (pendingTransactionsInfo?.hasPending) {
      setPendingTransactionWarningField({
        name: '',
        type: EvmInputDisplayType.WARNING_ONLY,
        value: chrome.i18n.getMessage('evm_pending_transaction_warning'),
        warnings: [
          {
            ignored: false,
            level: EvmTransactionWarningLevel.MEDIUM,
            message: 'evm_pending_transaction_warning',
            type: EvmTransactionWarningType.BASE,
            warningKey: 'pendingTransaction',
          },
        ],
      });
    } else {
    }
  };

  const handleOnConfirmClick = () => {
    if (hasWarning()) {
      openWarningsPopup();
    } else {
      setLoading(true);

      if (fields) {
        CommunicationUtils.runtimeSendMessage({
          command: BackgroundCommand.ACCEPT_EVM_TRANSACTION,
          value: {
            request: request,
            tab: data.tab,
            domain: data.dappInfo.domain,
            origin: data.dappInfo.origin,
            extraData: {
              gasFee: selectedFee,
            },
          },
        });
      } else if (confirmationPageFields) {
        //TODO see what to do here
      }
    }
  };

  const getFields = () => {
    if (fields) {
      return fields.otherFields;
    }
    if (confirmationPageFields) {
      return confirmationPageFields;
    }
    return [];
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
      data.dappInfo.origin,
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
    localAccounts: EvmAccountOrPublic[],
    name: string = '',
    skipWarnings: boolean = false,
  ) => {
    return {
      name: name,
      type: EvmInputDisplayType.WALLET_ADDRESS,
      address,
      value: (
        <EvmAddressComponent
          address={address}
          chainId={chainId}
          canCopy={true}
          localAccounts={localAccounts}
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
        type: EvmInputDisplayType.WARNING_ONLY,
        value: chrome.i18n.getMessage(
          'evm_warning_possible_duplicated_transaction',
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
    bypassWarning,
    setBypassWarning,
    warningsPopupOpened,
    openWarningsPopup,
    whitelistLabels,
    setWhitelistLabelForWarning,
    getFieldsForWarningsPopup,
    getPopupNotIgnoredWarnings,
    ignorePopupWarnings,
    loading,
    setLoading,
    securityCheckPending,
    setSecurityCheckPending,
    closePopup,
    ignoreAllWarnings,
    getAllFieldsWithNotIgnoredWarnings,
    handleOnConfirmClick,
    hasWarning,
    ignoreWarning,
    buildInitialDomainField,
    hydrateDomainFieldWarnings,
    getWalletAddressInput,
    getAllNotIgnoredWarnings,
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
