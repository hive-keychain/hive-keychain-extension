import { getHiveAccountCreationStatus } from '@api/hive-account-creation';
import {
  HiveAccountCreationStatus,
  PendingHiveAccountCreationRequest,
} from '@interfaces/hive-account-creation.interface';
import { Screen } from '@interfaces/screen.interface';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import moment from 'moment';
import QRCode from 'react-qr-code';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { copyTextWithToast } from 'src/common-ui/toast/copy-toast.utils';
import { PendingHiveAccountCreationUtils } from 'src/utils/pending-hive-account-creation.utils';

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
  setTitleContainerProperties,
  setErrorMessage,
}: PropsFromRedux) => {
  const requestId = navParams?.requestId as string | undefined;
  const [pendingRequest, setPendingRequest] = useState<
    PendingHiveAccountCreationRequest | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_create_account',
      isBackButtonEnabled: true,
    });
    loadPendingRequest();
  }, []);

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

  const refreshStatus = async () => {
    if (!pendingRequest) return;

    setIsRefreshing(true);
    try {
      const statusResponse = await getHiveAccountCreationStatus(
        pendingRequest.requestId,
      );
      const updatedRequest =
        await PendingHiveAccountCreationUtils.updatePendingHiveAccountCreationStatus(
          pendingRequest.requestId,
          statusResponse.status,
          mk,
        );

      const timestamp = new Date().toISOString();
      setPendingRequest(
        updatedRequest ?? {
          ...pendingRequest,
          status: statusResponse.status,
          updatedAt: timestamp,
          lastCheckedAt: timestamp,
        },
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to refresh account creation status.',
        [],
        true,
      );
    } finally {
      setIsRefreshing(false);
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

  return (
    <div
      className="pending-account-creation-payment"
      data-testid={`${Screen.PENDING_ACCOUNT_CREATION_PAYMENT}-page`}>
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
        {renderField({
          label: 'Expiry',
          value: formatDate(pendingRequest.expiresAt),
        })}

        <div className="qr-code-container">
          <QRCode
            data-testid="qrcode"
            className="qrcode"
            value={pendingRequest.paymentAddress}
            bgColor="var(--qrcode-background-color)"
            fgColor="var(--qrcode-foreground-color)"
          />
        </div>
      </div>

      <ButtonComponent
        label={isRefreshing ? 'Refreshing...' : 'Refresh status'}
        skipLabelTranslation
        disabled={isRefreshing}
        type={ButtonType.ALTERNATIVE}
        onClick={refreshStatus}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  navParams: state.navigation.stack[0]?.params ?? state.navigation.params,
  mk: state.mk,
});

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const PendingAccountCreationPaymentComponent = connector(
  PendingAccountCreationPayment,
);
