import { submitHiveAccountCreationPaymentTx } from '@api/hive-account-creation';
import {
  HiveAccountCreationStatus,
  PendingHiveAccountCreationRequest,
} from '@interfaces/hive-account-creation.interface';
import { PrivateKeyType } from '@interfaces/keys.interface';
import { Screen } from '@interfaces/screen.interface';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { ProviderTransactionData } from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmTokenLogo } from '@popup/evm/pages/home/evm-token-logo/evm-token-logo.component';
import { EvmSignerUtils } from '@popup/evm/utils/evm-signer.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import {
  PaidAccountCreationActions,
  completePaidHiveAccountCreation,
  synchronizePendingHiveAccountCreation,
} from '@popup/hive/actions/paid-account-creation.actions';
import { setChain } from '@popup/multichain/actions/chain.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import {
  setErrorMessage,
} from '@popup/multichain/actions/message.actions';
import {
  goBackToThenNavigate,
  navigateTo,
  navigateToWithParams,
} from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import {
  Chain,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
import { PaidAccountCreationRouteUtils } from '@popup/multichain/utils/paid-account-creation-route.utils';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { ChainLogo } from 'src/common-ui/chain-logo/chain-logo.component';
import { EVMConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.interface';
import { EvmAddressComponent } from 'src/common-ui/evm/evm-address/evm-address.component';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import { copyTextWithToast } from 'src/common-ui/toast/copy-toast.utils';
import { ExternalWalletPaymentPopup } from 'src/popup/hive/pages/app-container/settings/accounts/create-account/pending-account-creation-payment/external-wallet-payment-popup.component';
import { PaidAccountCreationPaymentUtils } from 'src/popup/hive/utils/paid-account-creation-payment.utils';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
import Logger from 'src/utils/logger.utils';
import { PendingHiveAccountCreationUtils } from 'src/utils/pending-hive-account-creation.utils';

const ACCOUNT_CREATION_POLL_INTERVAL_MS = 10000;
const PENDING_REQUEST_LOAD_MAX_ATTEMPTS = 8;
const PENDING_REQUEST_LOAD_RETRY_DELAY_MS = 300;
const PENDING_REQUEST_PERSIST_MAX_ATTEMPTS = 10;
const PENDING_REQUEST_PERSIST_RETRY_DELAY_MS = 200;
const PREPARING_ACCOUNT_CREATION_LOADING =
  'html_popup_preparing_account_creation';

const isPendingAccountCreationInProgress = (
  status: HiveAccountCreationStatus,
) =>
  !PaidAccountCreationActions.isTerminalPaidAccountCreationFailure(status) &&
  status !== 'account_created';

const STATUS_LABELS: Record<HiveAccountCreationStatus, string> = {
  payment_pending: 'Payment pending',
  payment_detected: 'Payment detected',
  payment_confirming: 'Confirming payment',
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
const HIVE_ACCOUNT_FALLBACK_AVATAR = '/assets/images/accounts.png';

const PendingAccountDisplay = ({ username }: { username: string }) => {
  const formattedUsername = username?.trim() ? `@${username.trim()}` : '@';

  return (
    <div className="value pending-account-value">
      <span className="username">{formattedUsername}</span>
      <PreloadedImage
        className="user-avatar"
        src={HIVE_ACCOUNT_FALLBACK_AVATAR}
        alt={HIVE_ACCOUNT_FALLBACK_AVATAR}
        addBackground
      />
    </div>
  );
};

const PendingAccountCreationPayment = ({
  navParams,
  mk,
  evmAccounts,
  currentChain,
  setTitleContainerProperties,
  setErrorMessage,
  setChain,
  navigateTo,
  navigateToWithParams,
  goBackToThenNavigate,
  addToLoadingList,
  removeFromLoadingList,
  loadEvmActiveAccount,
  completePaidHiveAccountCreation,
  synchronizePendingHiveAccountCreation,
  navigationStack,
}: PropsFromRedux) => {
  const requestId = navParams?.requestId as string | undefined;
  const autoPayWithKeychain = navParams?.autoPayWithKeychain === true;
  const [pendingRequest, setPendingRequest] = useState<
    PendingHiveAccountCreationRequest | undefined
  >();
  const [paymentChain, setPaymentChain] = useState<EvmChain | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAutoOpeningPayment, setIsAutoOpeningPayment] = useState(false);
  const [isExternalWalletPopupOpen, setIsExternalWalletPopupOpen] =
    useState(false);
  const [isSubmittingExternalTx, setIsSubmittingExternalTx] = useState(false);
  const synchronizationInProgress = useRef(false);
  const autoPaymentStarted = useRef(false);

  useEffect(() => {
    if (!requestId) {
      setPendingRequest(undefined);
      setIsLoading(false);
      return;
    }

    if (!mk) {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);
    void loadPendingRequest();
  }, [requestId, mk]);

  useEffect(() => {
    const shouldNavigateHomeOnBack =
      !!pendingRequest &&
      (!!pendingRequest.paymentTxHash ||
        pendingRequest.status !== 'payment_pending');

    setTitleContainerProperties({
      title: 'popup_html_create_account',
      isBackButtonEnabled: true,
      onBackAdditional: () => {
        removeFromLoadingList(PREPARING_ACCOUNT_CREATION_LOADING);
        if (shouldNavigateHomeOnBack) {
          navigateTo(Screen.HOME_PAGE, true);
          return true;
        }
      },
    });
  }, [
    pendingRequest?.requestId,
    pendingRequest?.status,
    pendingRequest?.paymentTxHash,
  ]);

  useEffect(() => {
    if (
      !isLoading &&
      pendingRequest &&
      !shouldAutoOpenKeychainPayment(pendingRequest)
    ) {
      void synchronizeRequest();
    }
  }, [isLoading, requestId, pendingRequest?.requestId]);

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

  const resolvePaymentEvmChain = async (
    request: PendingHiveAccountCreationRequest,
  ) => {
    if (!request.paymentChainId) return undefined;
    const [defaultChains, customChains] = await Promise.all([
      ChainUtils.getDefaultChains(),
      ChainUtils.getCustomChains(),
    ]);
    const paymentChainLookupKey = getChainLookupKey(request.paymentChainId);
    return [...defaultChains, ...customChains].find(
      (chain) =>
        chain.type === ChainType.EVM &&
        getChainLookupKey(chain.chainId) === paymentChainLookupKey,
    ) as EvmChain | undefined;
  };

  const loadPendingRequest = async () => {
    if (!requestId) {
      setIsLoading(false);
      return;
    }

    try {
      const request =
        await PendingHiveAccountCreationUtils.findPendingHiveAccountCreationRequestWithRetry(
          requestId,
          mk,
          {
            maxAttempts: PENDING_REQUEST_LOAD_MAX_ATTEMPTS,
            retryDelayMs: PENDING_REQUEST_LOAD_RETRY_DELAY_MS,
          },
        );
      setPendingRequest(request);
      if (
        request &&
        PaidAccountCreationPaymentUtils.isEvmPaymentRequest(request)
      ) {
        void resolvePaymentEvmChain(request)
          .then((chain) => {
            setPaymentChain(chain);
          })
          .catch((error) => {
            Logger.error('Unable to resolve EVM payment chain', error);
            setPaymentChain(undefined);
          });
      } else {
        setPaymentChain(undefined);
      }
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
        await completePaidHiveAccountCreation(result.account, {
          activateCreatedAccount: true,
          navigateToHomeAfterActivation: true,
          showSuccessMessage: true,
        });
        return;
      }

      if (result.outcome === 'not_found') {
        const username = pendingRequest?.username;
        const accounts = await AccountUtils.getAccountsFromLocalStorage(mk);
        const completedAccount = username
          ? accounts?.find((account) => account.name === username)
          : undefined;

        if (completedAccount) {
          await PendingHiveAccountCreationUtils.removePendingHiveAccountCreationRequest(
            requestId,
            mk,
          );
          await completePaidHiveAccountCreation(completedAccount, {
            activateCreatedAccount: true,
            navigateToHomeAfterActivation: true,
            showSuccessMessage: false,
          });
          return;
        }

        const storedRequest =
          await PendingHiveAccountCreationUtils.findPendingHiveAccountCreationRequestWithRetry(
            requestId,
            mk,
            {
              maxAttempts: PENDING_REQUEST_LOAD_MAX_ATTEMPTS,
              retryDelayMs: PENDING_REQUEST_LOAD_RETRY_DELAY_MS,
            },
          );
        if (storedRequest) {
          setPendingRequest(storedRequest);
        } else {
          setPendingRequest(undefined);
        }
        return;
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
    if (!pendingRequest) return undefined;
    if (paymentChain) {
      return paymentChain;
    }

    const resolvedChain = await resolvePaymentEvmChain(pendingRequest);
    if (resolvedChain) {
      setPaymentChain(resolvedChain);
    }
    return resolvedChain;
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

  const persistLocalPaymentTxStatus = async (
    status: HiveAccountCreationStatus,
    txHash: string,
  ) => {
    const updatedRequest =
      await PendingHiveAccountCreationUtils.upsertPendingHiveAccountCreationPaymentStatus(
        pendingRequest!,
        status,
        mk,
        txHash,
      );

    const persistedRequest =
      await PendingHiveAccountCreationUtils.findPendingHiveAccountCreationRequestWithRetry(
        pendingRequest!.requestId,
        mk,
        {
          maxAttempts: PENDING_REQUEST_PERSIST_MAX_ATTEMPTS,
          retryDelayMs: PENDING_REQUEST_PERSIST_RETRY_DELAY_MS,
        },
      );

    if (!persistedRequest) {
      throw new Error('Unable to persist account creation payment status.');
    }

    setPendingRequest(persistedRequest);
    return persistedRequest;
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
      await persistLocalPaymentTxStatus(
        statusResponse.status,
        transactionResponse.hash,
      );
      await setChain(previousChain, { saveLastUsedChain: false });
      if (ExtensionSurfaceUtils.isSidePanelPage()) {
        navigateToWithParams(
          Screen.PENDING_ACCOUNT_CREATION_PAYMENT,
          { requestId: pendingRequest!.requestId },
          true,
        );
      } else {
        await PaidAccountCreationRouteUtils.openPaymentStatusInSidePanel(
          pendingRequest!.requestId,
        );
        navigateTo(Screen.HOME_PAGE, true);
      }
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

  const shouldAutoOpenKeychainPayment = (
    request: PendingHiveAccountCreationRequest,
  ) =>
    autoPayWithKeychain &&
    request.status === 'payment_pending' &&
    !request.paymentTxHash &&
    PaidAccountCreationPaymentUtils.isEvmPaymentRequest(request);

  const payWithKeychain = async (): Promise<boolean> => {
    if (!pendingRequest) return false;

    const payerAccount = getPaymentEvmAccount();
    if (!payerAccount) {
      setErrorMessage('Unable to find EVM payer account.', [], true);
      return false;
    }

    const paymentChain = await getPaymentEvmChain();
    if (!paymentChain) {
      setErrorMessage('Unable to find EVM payment chain.', [], true);
      return false;
    }

    const tokenInfo = PaidAccountCreationPaymentUtils.buildPaymentTokenInfo(
      pendingRequest,
      paymentChain,
    );
    if (!tokenInfo) {
      setErrorMessage('Unable to build EVM payment token.', [], true);
      return false;
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
      return false;
    }

    const previousChain = currentChain as Chain;
    const stepTwoNavigationEntry = navigationStack.find(
      (entry) => entry.currentPage === Screen.CREATE_ACCOUNT_PAGE_STEP_TWO,
    );
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
      return false;
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
        removeFromLoadingList(PREPARING_ACCOUNT_CREATION_LOADING);
        if (stepTwoNavigationEntry) {
          await goBackToThenNavigate(
            Screen.CREATE_ACCOUNT_PAGE_STEP_TWO,
            Screen.CREATE_ACCOUNT_PAGE_STEP_TWO,
          );
          return true;
        }
        await goBackToThenNavigate(
          Screen.PENDING_ACCOUNT_CREATION_PAYMENT,
          Screen.PENDING_ACCOUNT_CREATION_PAYMENT,
        );
        return true;
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
    removeFromLoadingList(PREPARING_ACCOUNT_CREATION_LOADING);
    setIsAutoOpeningPayment(false);
    return true;
  };

  useEffect(() => {
    if (
      isLoading ||
      !pendingRequest ||
      autoPaymentStarted.current ||
      !shouldAutoOpenKeychainPayment(pendingRequest)
    ) {
      return;
    }

    autoPaymentStarted.current = true;
    setIsAutoOpeningPayment(true);
    addToLoadingList(PREPARING_ACCOUNT_CREATION_LOADING);
    void payWithKeychain().then((didOpenPayment) => {
      if (!didOpenPayment) {
        removeFromLoadingList(PREPARING_ACCOUNT_CREATION_LOADING);
        setIsAutoOpeningPayment(false);
      }
    });
  }, [
    autoPayWithKeychain,
    isLoading,
    pendingRequest?.requestId,
    pendingRequest?.status,
    pendingRequest?.paymentTxHash,
  ]);

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
      await persistLocalPaymentTxStatus(statusResponse.status, txHash);
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

  const renderCopyableValue = (value: string, copyLabel: string) => (
    <div
      className="value copyable-value"
      role="button"
      tabIndex={0}
      aria-label={`Copy ${copyLabel}`}
      onClick={() => void copyTextWithToast(value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          void copyTextWithToast(value);
        }
      }}>
      {value}
    </div>
  );

  const renderLabeledValueWithLogo = (
    label: string,
    logo: React.ReactNode,
  ) => (
    <div className="value value-with-logo">
      {logo}
      <span className="value-label">{label}</span>
    </div>
  );

  const renderHiveLogo = () => (
    <PreloadedImage
      className="field-logo"
      src={`/assets/images/icons/${SVGIcons.WALLET_HIVE_LOGO}.svg`}
      symbol="HIVE"
      addBackground
      useDefaultSVG={SVGIcons.WALLET_HIVE_LOGO}
    />
  );

  type PaymentDisplayField = {
    key: string;
    label: string;
    value: React.ReactNode;
  };

  const buildPaymentDisplayFields = (
    request: PendingHiveAccountCreationRequest,
  ): PaymentDisplayField[] => {
    const isEvmPayment =
      PaidAccountCreationPaymentUtils.isEvmPaymentRequest(request);
    const chainLabel = PaidAccountCreationPaymentUtils.getPaymentChainLabel(
      request,
      paymentChain,
    );
    const tokenLabel = PaidAccountCreationPaymentUtils.getPaymentTokenLabel(
      request,
      paymentChain,
    );
    const tokenInfo =
      isEvmPayment && paymentChain
        ? PaidAccountCreationPaymentUtils.buildPaymentTokenInfo(
            request,
            paymentChain,
          )
        : undefined;
    const fields: PaymentDisplayField[] = [
      {
        key: 'account',
        label: I18nUtils.getMessage('html_popup_create_account_payment_account'),
        value: <PendingAccountDisplay username={request.username} />,
      },
      {
        key: 'amount',
        label: I18nUtils.getMessage('popup_html_transfer_amount'),
        value: renderCopyableValue(request.amount, 'amount'),
      },
      {
        key: 'chain',
        label: I18nUtils.getMessage('html_popup_create_account_payment_chain'),
        value: isEvmPayment
          ? renderLabeledValueWithLogo(
              chainLabel,
              <ChainLogo
                chainName={chainLabel}
                logoUri={paymentChain?.logo}
                className="field-logo"
              />,
            )
          : renderLabeledValueWithLogo(chainLabel, renderHiveLogo()),
      },
      {
        key: 'token',
        label: I18nUtils.getMessage('html_popup_create_account_payment_token'),
        value:
          isEvmPayment && tokenInfo
            ? renderLabeledValueWithLogo(
                tokenLabel,
                <EvmTokenLogo tokenInfo={tokenInfo} />,
              )
            : renderLabeledValueWithLogo(tokenLabel, renderHiveLogo()),
      },
      {
        key: 'address',
        label: I18nUtils.getMessage(
          'html_popup_create_account_payment_address',
        ),
        value: isEvmPayment ? (
          <div className="value">
            <EvmAddressComponent
              address={request.paymentAddress}
              chainId={request.paymentChainId!}
              localAccounts={evmAccounts}
              canCopy
            />
          </div>
        ) : (
          renderCopyableValue(request.paymentAddress, 'address')
        ),
      },
    ];

    if (request.memo) {
      fields.push({
        key: 'memo',
        label: I18nUtils.getMessage('popup_html_transfer_memo'),
        value: renderCopyableValue(request.memo, 'memo'),
      });
    }

    if (request.paymentTxHash) {
      fields.push({
        key: 'payment-transaction',
        label: I18nUtils.getMessage('html_popup_create_account_payment_tx_hash'),
        value: renderCopyableValue(request.paymentTxHash, 'payment transaction'),
      });
    }

    fields.push({
      key: 'expiry',
      label: I18nUtils.getMessage('html_popup_create_account_payment_expiry'),
      value: (
        <div className="value">{formatDate(request.expiresAt)}</div>
      ),
    });

    return fields;
  };

  const renderPaymentFields = (request: PendingHiveAccountCreationRequest) => {
    const fields = buildPaymentDisplayFields(request);
    const showStatusTag =
      !!request.paymentTxHash || request.status !== 'payment_pending';

    return (
      <div className="fields">
        <div className="fields-card-header">
          {showStatusTag && (
            <div
              className="status-badge"
              data-testid="pending-account-creation-status">
              {STATUS_LABELS[request.status]}
            </div>
          )}
          {renderRefreshButton()}
        </div>
        {fields.map((field, index) => (
          <React.Fragment key={field.key}>
            <div className="field">
              <div className="label">{field.label}</div>
              {field.value}
            </div>
            {index !== fields.length - 1 && (
              <Separator
                key={`separator-${field.key}`}
                type="horizontal"
                fullSize
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderRefreshButton = () => (
    <button
      type="button"
      className="refresh-status-button"
      aria-label="Refresh status"
      title="Refresh status"
      disabled={isRefreshing}
      onClick={() => void synchronizeRequest(true)}>
      <SVGIcon icon={SVGIcons.SWAPS_HISTORY_REFRESH} />
    </button>
  );

  if (isLoading || isAutoOpeningPayment) {
    return (
      <div
        className="pending-account-creation-payment"
        data-testid={`${Screen.PENDING_ACCOUNT_CREATION_PAYMENT}-page`}></div>
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

  const hasBroadcastPayment =
    !!pendingRequest.paymentTxHash ||
    pendingRequest.status !== 'payment_pending';
  const showKeepOpenDisclaimer =
    hasBroadcastPayment &&
    isPendingAccountCreationInProgress(pendingRequest.status);
  const canPayWithKeychain =
    pendingRequest.status === 'payment_pending' &&
    PaidAccountCreationPaymentUtils.isEvmPaymentRequest(pendingRequest);

  return (
    <div
      className="pending-account-creation-payment confirmation-page"
      data-testid={`${Screen.PENDING_ACCOUNT_CREATION_PAYMENT}-page`}>
      {showKeepOpenDisclaimer && (
        <div
          className="pending-disclaimer"
          data-testid="pending-account-creation-keep-open-disclaimer">
          {I18nUtils.getMessage('html_popup_create_account_pending_keep_open')}
        </div>
      )}
      <div className="confirmation-top">
        {renderPaymentFields(pendingRequest)}
      </div>

      {canPayWithKeychain && (
        <div className="evm-bottom-panel">
          <ButtonComponent
            label="Pay with Keychain"
            skipLabelTranslation
            onClick={() => void payWithKeychain()}
          />
        </div>
      )}

      {/* {pendingRequest.status === 'payment_pending' && (
        <ButtonComponent
          label="html_popup_create_account_pay_external_wallet"
          onClick={() => setIsExternalWalletPopupOpen(true)}
        />
      )} */}

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
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  navParams: state.navigation.stack[0]?.params ?? state.navigation.params,
  navigationStack: state.navigation.stack,
  mk: state.mk,
  evmAccounts: state.evm.accounts,
  currentChain: state.chain,
});

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setErrorMessage,
  setChain,
  navigateTo,
  navigateToWithParams,
  goBackToThenNavigate,
  addToLoadingList,
  removeFromLoadingList,
  loadEvmActiveAccount,
  completePaidHiveAccountCreation,
  synchronizePendingHiveAccountCreation,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const PendingAccountCreationPaymentComponent = connector(
  PendingAccountCreationPayment,
);
