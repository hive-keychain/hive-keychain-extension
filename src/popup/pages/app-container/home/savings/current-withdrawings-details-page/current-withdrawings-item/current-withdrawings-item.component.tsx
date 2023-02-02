import { CurrentWithdrawingListItem } from '@interfaces/list-item.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import moment from 'moment';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Screen } from 'src/reference-data/screen.enum';
import './current-withdrawings-item.component.scss';

interface CurrentWithdrawItemProps {
  item: CurrentWithdrawingListItem;
}

//TODO help code
// to cancel we emit a:
//
//END help code

const CurrentWithdrawItem = ({
  item,
  navigateToWithParams,
  navigateTo,
  setErrorMessage,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
}: PropsType) => {
  const cancelCurrentWithdrawSavingItem = () => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_cancel_withdraw_savings_message',
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

        // try {
        // //   let success = await DelegationUtils.delegateVestingShares(
        // //     activeAccount.name!,
        // //     username!,
        // //     '0.000000 VESTS',
        // //     activeAccount.keys.active!,
        // //   );
        // //TODO

        // // let success = await SavingsUtils.cancelCurrentWithdrawSaving(requestId: number);
        //   navigateTo(Screen.HOME_PAGE, true);
        //   if (success) {
        //     setSuccessMessage('popup_html_cancel_withdraw_savings_successful');
        //   } else {
        //     //TODO add popup_html_cancel_withdraw_savings_successful as "Savings withdraw of {{amount}} HBD could not be processed".
        //     setErrorMessage('popup_html_cancel_delegation_fail');
        //   }
        // } catch (err: any) {
        //   setErrorMessage(err.message);
        // } finally {
        //     //TODO to loadinglist html_popup_cancel_delegation_operation
        //   removeFromLoadingList('html_popup_cancel_delegation_operation');
        // }
      },
    });
  };

  return (
    <div className="delegation-row">
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
    //   activeAccount: state.activeAccount,
    //   globalProperties: state.globalProperties.globals,
    //   currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
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
type PropsType = ConnectedProps<typeof connector> & CurrentWithdrawItemProps;

export const CurrentWithdrawItemComponent = connector(CurrentWithdrawItem);
