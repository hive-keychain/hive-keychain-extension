import { TransactionOptions } from '@interfaces/keys.interface';
import { SavingsWithdrawal } from '@interfaces/savings.interface';
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
import { RootState } from '@popup/multichain/store';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import moment from 'moment';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import AmountWithLogo from 'src/common-ui/amount-with-logo/amount-with-logo';
import { ConfirmationPageFieldTag } from 'src/common-ui/confirmation-page/confirmation-field.interface';
import { ConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.component';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { SavingsUtils } from 'src/popup/hive/utils/savings.utils';
import { Screen } from 'src/reference-data/screen.enum';

interface PendingSavingsWithdrawalProps {
  item: SavingsWithdrawal;
  currency: string;
}

const PendingSavingsWithdrawalItem = ({
  item,
  currency,
  navigateToWithParams,
  navigateTo,
  setErrorMessage,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
  activeAccount,
}: PropsType) => {
  const cancelCurrentWithdrawSavingItem = () => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: KeychainKeyTypes.active,
      message: chrome.i18n.getMessage(
        'popup_html_confirm_cancel_withdraw_savings_message',
        [currency],
      ),
      title: 'popup_html_cancel_withdraw_savings',
      fields: [
        {
          label: 'popup_html_cancel_withdraw',
          value: `${item.amount} ${moment(item.complete).format('L')}`,
          tag: ConfirmationPageFieldTag.AMOUNT,
          tokenSymbol: currency,
          iconPosition: 'right',
        },
      ],
      afterConfirmAction: async (options?: TransactionOptions) => {
        addToLoadingList('html_popup_cancel_withdraw_savings_operation');

        try {
          let success = await SavingsUtils.cancelCurrentWithdrawSaving(
            activeAccount.name!,
            item.request_id,
            activeAccount.keys.active!,
            options,
          );
          navigateTo(Screen.HOME_PAGE, true);
          if (success) {
            if (success.isUsingMultisig) {
              setSuccessMessage('multisig_transaction_sent_to_signers');
            } else {
              setSuccessMessage(
                'popup_html_cancel_withdraw_savings_successful',
                [item.amount, currency],
              );
            }
          } else {
            setErrorMessage('popup_html_cancel_withdraw_savings_fail', [
              currency,
            ]);
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList('html_popup_cancel_withdraw_savings_operation');
        }
      },
    } as ConfirmationPageParams);
  };

  return (
    <div className="pending-savings-withdraw-row">
      <>
        <CustomTooltip
          additionalClassName="left-panel"
          skipTranslation
          message={moment(item.complete).format('YYYY/MM/DD hh:mm:ss')}>
          <div>{moment(item.complete).format('L')}</div>
        </CustomTooltip>
        <div className="right-panel">
          <AmountWithLogo
            amount={item.amount}
            symbol={currency}
            icon={
              currency === 'HP'
                ? SVGIcons.WALLET_HP_LOGO
                : currency === 'HBD'
                ? SVGIcons.WALLET_HBD_LOGO
                : undefined
            }
            iconPosition="right"
          />
          {/* <span>
            {FormatUtils.formatCurrencyValue(
              parseFloat(item.amount.toString()),
            )}
          </span> */}
          <SVGIcon
            className="delete-icon"
            icon={SVGIcons.GLOBAL_DELETE}
            onClick={cancelCurrentWithdrawSavingItem}
          />
        </div>
      </>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  navigateTo,
  setErrorMessage,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
});
type PropsType = ConnectedProps<typeof connector> &
  PendingSavingsWithdrawalProps;

export const PendingSavingsWithdrawalItemComponent = connector(
  PendingSavingsWithdrawalItem,
);
