import { submitHiveAccountCreationPaymentTx } from '@api/hive-account-creation';
import {
  HiveAccountCreationStatus,
  PendingHiveAccountCreationRequest,
} from '@interfaces/hive-account-creation.interface';
import { PrivateKeyType } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Screen } from '@interfaces/screen.interface';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { ProviderTransactionData } from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmSignerUtils } from '@popup/evm/utils/evm-signer.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { loadActiveAccount } from '@popup/hive/actions/active-account.actions';
import {
  PaidAccountCreationActions,
  synchronizePendingHiveAccountCreation,
} from '@popup/hive/actions/paid-account-creation.actions';
import { setActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import { setChain } from '@popup/multichain/actions/chain.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import {
  Chain,
  ChainType,
  EvmChain,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { EVMConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.interface';
import { EvmAddressComponent } from 'src/common-ui/evm/evm-address/evm-address.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { copyTextWithToast } from 'src/common-ui/toast/copy-toast.utils';
import { ExternalWalletPaymentPopup } from 'src/popup/hive/pages/app-container/settings/accounts/create-account/pending-account-creation-payment/external-wallet-payment-popup.component';
import { PaidAccountCreationPaymentUtils } from 'src/popup/hive/utils/paid-account-creation-payment.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
import Logger from 'src/utils/logger.utils';
import { PendingHiveAccountCreationUtils } from 'src/utils/pending-hive-account-creation.utils';

const ACCOUNT_CREATION_POLL_INTERVAL_MS = 10000;

const isPendingAccountCreationInProgress = (
  status: HiveAccountCreationStatus,
) =>
  !PaidAccountCreationActions.isTerminalPaidAccountCreationFailure(status) &&
  status !== 'account_created';

const STATUS_LABELS: Record<HiveAccountCreationStatus, string> = {
  payment_pending: 'Payment pending',
  payment_detected: 'Payment detected',
  payment_confirming: 'Payment confirming',
  creating_account: 'Creating account',
  account_created: 'Account created',
  expired: 'Expired',
  underpaid: 'Underpaid',
  overpaid: 'Overpaid',
  paid_after_expiry: 'Paid after expiry',
  username_unavailable: 'Username unavailable',
  account_creation_failed: 'Account creation failed',
  cancelled: 'Cancelled',
};

const formatDate = (date: string) => moment.utc(date).local().format('L LT');

const PendingAccountCreationPayment = ({
  navParams,
  mk,
  evmAccounts,
  currentChain,
  setTitleContainerProperties,
  setErrorMessage,
  setSuccessMessage,
  setChain,
  setActiveAccountType,
  loadActiveAccount,
  navigateTo,
  navigateToWithParams,
  addToLoadingList,
  removeFromLoadingList,
  loadEvmActiveAccount,
  synchronizePendingHiveAccountCreation,
}: PropsFromRedux) => {
  const requestId = navParams?.requestId as string | undefined;
  const [pendingRequest, setPendingRequest] = useState<
    PendingHiveAccountCreationRequest | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExternalWalletPopupOpen, setIsExternalWalletPopupOpen] =
    useState(false);
  const [isSubmittingExternalTx, setIsSubmittingExternalTx] = useState(false);
  const synchronizationInProgress = useRef(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_create_account',
      isBackButtonEnabled: true,
    });
    loadPendingRequest();
  }, []);

  useEffect(() => {
    if (!isLoading && pendingRequest) {
      void synchronizeRequest();
    }
  }, [isLoading, requestId]);

  useEffect(() => {
    if (
      !pendingRequest ||
      PaidAccountCreationActions.isTerminalPaidAccountCreationFailure(
        pendingRequest.status,
      )
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void synchronizeRequest();
    }, ACCOUNT_CREATION_POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [pendingRequest?.requestId, pendingRequest?.status]);

  const loadPendingRequest = async () => {
    if (!requestId) {
      setIsLoading(false);
      return;
    }

    try {
      const pendingRequests =
        await PendingHiveAccountCreationUtils.getPendingHiveAccountCreationRequests(
          mk,
        );
      setPendingRequest(
        pendingRequests.find((request) => request.requestId === requestId),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load pending payment request.',
        [],
        true,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getHiveChain = async (): Promise<HiveChain | undefined> => {
    const setupHiveChains =
      await ChainUtils.getAllSetupChainsForType<HiveChain>(ChainType.HIVE);
    if (setupHiveChains[0]) {
      return setupHiveChains[0];
    }
    const defaultChains = await ChainUtils.getDefaultChains();
    return defaultChains.find((chain) => chain.type === ChainType.HIVE) as
      | HiveChain
      | undefined;
  };

  const completeAccountImport = async (account: LocalAccount) => {
    const hiveChain = await getHiveChain();
    if (!hiveChain) {
      throw new Error('Unable to find Hive chain.');
    }

    await setChain(hiveChain);
    setActiveAccountType(ChainType.HIVE);
    try {
      await loadActiveAccount(account);
    } catch (error) {
      Logger.error('Unable to activate created Hive account', error);
    }
    setSuccessMessage('html_popup_create_account_successful');
    navigateTo(Screen.HOME_PAGE, true);
  };

  const synchronizeRequest = async (showErrors = false) => {
    if (!requestId || synchronizationInProgress.current) return;

    synchronizationInProgress.current = true;
    if (showErrors) {
      setIsRefreshing(true);
    }
    try {
      const result = await synchronizePendingHiveAccountCreation(requestId);
      if (
        (result.outcome === 'imported' ||
          result.outcome === 'already_imported') &&
        result.account
      ) {
        await completeAccountImport(result.account);
        return;
      }

      if (result.outcome === 'not_found') {
        setPendingRequest(undefined);
      } else if (result.request) {
        setPendingRequest(result.request);
      }
    } catch (error) {
      Logger.error(
        'Unable to synchronize pending Hive account creation',
        error,
      );
      if (showErrors) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to refresh account creation status.',
          [],
          true,
        );
      }
    } finally {
      synchronizationInProgress.current = false;
      if (showErrors) {
        setIsRefreshing(false);
      }
    }
  };

  const getPaymentEvmAccount = () => {
    if (!pendingRequest?.payerEvmAddress) return undefined;
    return (evmAccounts as EvmAccount[]).find(
      (account) =>
        account.wallet.address.toLowerCase() ===
        pendingRequest.payerEvmAddress!.toLowerCase(),
    );
  };

  const getChainLookupKey = (chainId: string | number) => {
    const value = String(chainId).trim().toLowerCase();
    if (/^0x[0-9a-f]+$/i.test(value)) {
      return BigInt(value).toString();
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue)
      ? String(Math.trunc(numericValue))
      : value;
  };

  const getPaymentEvmChain = async () => {
    if (!pendingRequest?.paymentChainId) return undefined;
    const [defaultChains, customChains] = await Promise.all([
      ChainUtils.getDefaultChains(),
      ChainUtils.getCustomChains(),
    ]);
    const paymentChainLookupKey = getChainLookupKey(
      pendingRequest.paymentChainId,
    );
    return [...defaultChains, ...customChains].find(
      (chain) =>
        chain.type === ChainType.EVM &&
        getChainLookupKey(chain.chainId) === paymentChainLookupKey,
    ) as EvmChain | undefined;
  };

  const buildPaymentConfirmationFields = (
    payerAccount: EvmAccount,
    paymentChain: EvmChain,
  ) => [
    {
      label: 'popup_html_transfer_from',
      value: (
        <EvmAddressComponent
          address={payerAccount.wallet.address}
          chainId={paymentChain.chainId}
          localAccounts={evmAccounts}
          canCopy
        />
      ),
    },
    {
      label: 'popup_html_transfer_to',
      value: (
        <EvmAddressComponent
          address={pendingRequest!.paymentAddress}
          chainId={paymentChain.chainId}
          localAccounts={evmAccounts}
          canCopy
        />
      ),
    },
    {
      label: 'popup_html_transfer_amount',
      value: `${pendingRequest!.amount} ${
        pendingRequest!.paymentTokenSymbol ?? pendingRequest!.paymentCurrency
      }`,
    },
  ];

  const updateLocalPaymentTxStatus = async (
    status: HiveAccountCreationStatus,
    txHash: string,
  ) => {
    const updatedRequest =
      await PendingHiveAccountCreationUtils.updatePendingHiveAccountCreationStatus(
        pendingRequest!.requestId,
        status,
        mk,
        txHash,
      );

    const timestamp = new Date().toISOString();
    setPendingRequest(
      updatedRequest ?? {
        ...pendingRequest!,
        status,
        paymentTxHash: txHash,
        updatedAt: timestamp,
        lastCheckedAt: timestamp,
      },
    );
  };

  const submitPaymentTransaction = async (
    transactionData: ProviderTransactionData,
    paymentChain: EvmChain,
    payerAccount: EvmAccount,
    previousChain: Chain,
    gasFee: GasFeeEstimationBase,
  ) => {
    addToLoadingList(
      'html_popup_transfer_fund_operation',
      EvmSignerUtils.isLedgerWallet(payerAccount.wallet)
        ? PrivateKeyType.LEDGER
        : undefined,
    );
    try {
      const transactionResponse = await EvmTransactionsUtils.send(
        payerAccount.wallet,
        {
          value: transactionData.value,
          to: transactionData.to,
          type: Number(transactionData.type),
          data: transactionData.data,
        },
        gasFee,
        paymentChain.chainId,
      );

      const statusResponse = await submitHiveAccountCreationPaymentTx(
        pendingRequest!.requestId,
        {
          txHash: transactionResponse.hash,
          from: payerAccount.wallet.address,
        },
      );
      await updateLocalPaymentTxStatus(
        statusResponse.status,
        transactionResponse.hash,
      );
      await setChain(previousChain, { saveLastUsedChain: false });
      navigateToWithParams(
        Screen.PENDING_ACCOUNT_CREATION_PAYMENT,
        { requestId: pendingRequest!.requestId },
        true,
      );
    } catch (error) {
      Logger.error('Error during account creation EVM payment', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to submit account creation payment.',
        [],
        true,
      );
    } finally {
      removeFromLoadingList('html_popup_transfer_fund_operation');
    }
  };

  const payWithKeychain = async () => {
    if (!pendingRequest) return;

    const payerAccount = getPaymentEvmAccount();
    if (!payerAccount) {
      setErrorMessage('Unable to find EVM payer account.', [], true);
      return;
    }

    const paymentChain = await getPaymentEvmChain();
    if (!paymentChain) {
      setErrorMessage('Unable to find EVM payment chain.', [], true);
      return;
    }

    const tokenInfo = PaidAccountCreationPaymentUtils.buildPaymentTokenInfo(
      pendingRequest,
      paymentChain,
    );
    if (!tokenInfo) {
      setErrorMessage('Unable to build EVM payment token.', [], true);
      return;
    }

    let transactionData: ProviderTransactionData;
    try {
      transactionData =
        PaidAccountCreationPaymentUtils.buildPaymentTransactionData(
          pendingRequest,
          payerAccount.wallet.address,
          tokenInfo,
          paymentChain.defaultTransactionType,
        );
    } catch {
      setErrorMessage('Unable to build EVM payment transaction.', [], true);
      return;
    }

    const previousChain = currentChain as Chain;
    try {
      await setChain(paymentChain, { saveLastUsedChain: false });
      await loadEvmActiveAccount(paymentChain, payerAccount.wallet);
    } catch (error) {
      await setChain(previousChain, { saveLastUsedChain: false });
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to prepare EVM payment.',
        [],
        true,
      );
      return;
    }

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: 'Confirm account creation payment.',
      fields: buildPaymentConfirmationFields(payerAccount, paymentChain),
      title: 'popup_html_create_account',
      hasGasFee: true,
      tokenInfo,
      receiverAddress: pendingRequest.paymentAddress,
      amount: pendingRequest.amount,
      wallet: payerAccount.wallet,
      transactionData,
      afterCancelAction: async () => {
        await setChain(previousChain, { saveLastUsedChain: false });
      },
      afterConfirmAction: async (gasFee: GasFeeEstimationBase) => {
        await submitPaymentTransaction(
          transactionData,
          paymentChain,
          payerAccount,
          previousChain,
          gasFee,
        );
      },
    } as EVMConfirmationPageParams);
  };

  const submitExternalPaymentTx = async (txHash: string) => {
    if (!pendingRequest) return;

    setIsSubmittingExternalTx(true);
    try {
      const statusResponse = await submitHiveAccountCreationPaymentTx(
        pendingRequest.requestId,
        {
          txHash,
          from: pendingRequest.payerEvmAddress ?? undefined,
        },
      );
      await updateLocalPaymentTxStatus(statusResponse.status, txHash);
      setIsExternalWalletPopupOpen(false);
    } catch (error) {
      Logger.error('Error submitting external account creation payment', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to submit account creation payment.',
        [],
        true,
      );
    } finally {
      setIsSubmittingExternalTx(false);
    }
  };

  const renderCopyButton = (value: string, label: string) => (
    <button
      type="button"
      className="copy-field-button"
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
      onClick={() => copyTextWithToast(value)}>
      <SVGIcon icon={SVGIcons.SELECT_COPY} />
    </button>
  );

  const renderField = ({
    label,
    value,
    copyable = false,
  }: {
    label: string;
    value: string;
    copyable?: boolean;
  }) => (
    <div className="payment-field">
      <div className="field-content">
        <div className="field-label">{label}</div>
        <div className="field-value">{value}</div>
      </div>
      {copyable ? renderCopyButton(value, label.toLowerCase()) : <div />}
    </div>
  );

  if (isLoading) {
    return (
      <div
        className="pending-account-creation-payment"
        data-testid={`${Screen.PENDING_ACCOUNT_CREATION_PAYMENT}-page`}>
        <div className="empty-state">Loading payment request...</div>
      </div>
    );
  }

  if (!requestId || !pendingRequest) {
    return (
      <div
        className="pending-account-creation-payment"
        data-testid={`${Screen.PENDING_ACCOUNT_CREATION_PAYMENT}-page`}>
        <div className="error-state">Pending payment request not found.</div>
      </div>
    );
  }

  const showKeepOpenDisclaimer = isPendingAccountCreationInProgress(
    pendingRequest.status,
  );

  return (
    <div
      className="pending-account-creation-payment"
      data-testid={`${Screen.PENDING_ACCOUNT_CREATION_PAYMENT}-page`}>
      {showKeepOpenDisclaimer && (
        <div
          className="pending-disclaimer"
          data-testid="pending-account-creation-keep-open-disclaimer">
          {I18nUtils.getMessage('html_popup_create_account_pending_keep_open')}
        </div>
      )}
      <div className="payment-panel">
        <div className="payment-summary">
          <div className="username">@{pendingRequest.username}</div>
          <div className="request-id">{pendingRequest.requestId}</div>
        </div>

        <div className="status-line">
          <div>Current status</div>
          <div className="status-badge">
            {STATUS_LABELS[pendingRequest.status]}
          </div>
        </div>

        {renderField({
          label: 'Amount',
          value: pendingRequest.amount,
          copyable: true,
        })}
        {renderField({
          label: 'Currency',
          value: pendingRequest.paymentCurrency,
        })}
        {renderField({
          label: 'Address',
          value: pendingRequest.paymentAddress,
          copyable: true,
        })}
        {pendingRequest.memo &&
          renderField({
            label: 'Memo',
            value: pendingRequest.memo,
            copyable: true,
          })}
        {pendingRequest.paymentTxHash &&
          renderField({
            label: 'Payment transaction',
            value: pendingRequest.paymentTxHash,
            copyable: true,
          })}
        {renderField({
          label: 'Expiry',
          value: formatDate(pendingRequest.expiresAt),
        })}
      </div>

      {/* {pendingRequest.status === 'payment_pending' &&
        PaidAccountCreationPaymentUtils.isEvmPaymentRequest(pendingRequest) && (
          <ButtonComponent
            label="popup_html_create_account_pay_keychain"
            skipLabelTranslation
            onClick={payWithKeychain}
          />
        )} */}

      {pendingRequest.status === 'payment_pending' && (
        <ButtonComponent
          label="html_popup_create_account_pay_external_wallet"
          onClick={() => setIsExternalWalletPopupOpen(true)}
        />
      )}

      {isExternalWalletPopupOpen && (
        <ExternalWalletPaymentPopup
          pendingRequest={pendingRequest}
          isSubmitting={isSubmittingExternalTx}
          onClose={() => {
            if (!isSubmittingExternalTx) {
              setIsExternalWalletPopupOpen(false);
            }
          }}
          onSubmitTxHash={submitExternalPaymentTx}
        />
      )}

      <ButtonComponent
        label={isRefreshing ? 'Refreshing...' : 'Refresh status'}
        skipLabelTranslation
        disabled={isRefreshing}
        type={ButtonType.ALTERNATIVE}
        onClick={() => void synchronizeRequest(true)}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  navParams: state.navigation.stack[0]?.params ?? state.navigation.params,
  mk: state.mk,
  evmAccounts: state.evm.accounts,
  currentChain: state.chain,
});

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setErrorMessage,
  setSuccessMessage,
  setChain,
  setActiveAccountType,
  loadActiveAccount,
  navigateTo,
  navigateToWithParams,
  addToLoadingList,
  removeFromLoadingList,
  loadEvmActiveAccount,
  synchronizePendingHiveAccountCreation,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const PendingAccountCreationPaymentComponent = connector(
  PendingAccountCreationPayment,
);
