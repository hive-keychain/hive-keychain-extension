import { SavingsWithdrawal } from '@interfaces/savings.interface';
import moment from 'moment';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import {
  addToLoadingList,
  removeFromLoadingList,
} from 'src/popup/hive/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from 'src/popup/hive/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from 'src/popup/hive/actions/navigation.actions';
import { RootState } from 'src/popup/hive/store';
import { SavingsUtils } from 'src/popup/hive/utils/savings.utils';
import { Screen } from 'src/reference-data/screen.enum';
import './pending-savings-withdrawal-item.component.scss';

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
      message: chrome.i18n.getMessage(
        'popup_html_confirm_cancel_withdraw_savings_message',
        [currency],
      ),
      title: 'popup_html_cancel_withdraw_savings',
      fields: [
        {
          label: 'popup_html_cancel_withdraw',
          value: `${item.amount} ${moment(item.complete).format('L')}`,
        },
      ],
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_cancel_withdraw_savings_operation');

        try {
          let success = await SavingsUtils.cancelCurrentWithdrawSaving(
            activeAccount.name!,
            item.request_id,
            activeAccount.keys.active!,
          );
          navigateTo(Screen.HOME_PAGE, true);
          if (success) {
            setSuccessMessage('popup_html_cancel_withdraw_savings_successful', [
              item.amount,
              currency,
            ]);
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
    });
  };

  return (
    <div className="pending-savings-withdraw-row">
      <>
        <div className="left-panel">{item.amount}</div>
        <div className="right-panel">
          {moment(item.complete).format('L')}
          <img
            className="icon erase-delegation"
            src="/assets/images/clear.png"
            onClick={cancelCurrentWithdrawSavingItem}
          />
        </div>
      </>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
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
