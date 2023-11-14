import { RcDelegation } from '@interfaces/rc-delegation.interface';
import { RcDelegationsUtils } from '@popup/hive/utils/rc-delegations.utils';
import moment from 'moment';
import React, { useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { NewIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
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
import { DelegationType } from 'src/popup/hive/pages/app-container/home/delegations/delegation-type.enum';
import { RootState } from 'src/popup/hive/store';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';
import { Screen } from 'src/reference-data/screen.enum';

interface RcIncomingOutgoingProps {
  delegationType: DelegationType;
  username?: string;
  amount: string;
  expirationDate?: string;
  maxAvailable?: string;
  rcDelegation: RcDelegation;
}

const RcIncomingOutgoingDelegationItem = ({
  activeAccount,
  delegationType,
  username,
  amount,
  globalProperties,
  currencyLabels,
  expirationDate,
  maxAvailable,
  rcDelegation,
  navigateToWithParams,
  navigateTo,
  setErrorMessage,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
}: PropsType) => {
  const [editModeActivated, setEditModeActivated] = useState(false);
  const [value, setValue] = useState('');
  const [amountHP, setAmountHP] = useState(
    RcDelegationsUtils.gigaRcToHp(amount, globalProperties),
  );
  const [amountRC, setAmountRC] = useState(amount);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpandablePanel = () => {
    if (!editModeActivated) setIsExpanded(!isExpanded);
  };

  const cancelDelegation = async (rcDelegation: RcDelegation) => {
    const fields = [
      {
        label: 'popup_html_rc_delegation_to',
        value: `@${rcDelegation.delegatee}`,
      },
      {
        label: 'popup_html_rc_delegation_value',
        value: `${RcDelegationsUtils.rcToGigaRc(
          Number(rcDelegation.value),
        )} G RC (≈ ${RcDelegationsUtils.rcToHp(
          rcDelegation.value,
          globalProperties,
        )} ${currencyLabels.hp})`,
      },
    ];
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_cancel_rc_delegation_confirm_text',
      ),
      fields: fields,
      title: 'popup_html_cancel_rc_delegation_title',
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_cancel_delegate_rc_operation');
        let success;

        success = await RcDelegationsUtils.cancelDelegation(
          rcDelegation.delegatee,
          activeAccount.name!,
          activeAccount.keys.posting!,
        );

        removeFromLoadingList('html_popup_cancel_delegate_rc_operation');

        if (success) {
          navigateTo(Screen.HOME_PAGE, true);

          setSuccessMessage('popup_html_cancel_rc_delegation_successful', [
            `@${rcDelegation.delegatee}`,
          ]);
        } else {
          setErrorMessage('popup_html_cancel_rc_delegation_failed');
        }
      },
    });
  };

  // const enterEditMode = () => {
  //   setEditModeActivated(true);
  //   setValue(amountHP);
  // };

  // const cancelEdit = () => {
  //   setEditModeActivated(false);
  //   setValue(amountHP);
  // };

  // const saveChanges = () => {
  //   setEditModeActivated(false);
  //   setAmountHP(value);

  //   if (Number(value) <= 0) {
  //     cancelDelegation(rcDelegation);
  //   }

  //   const valueS = `${parseFloat(value.toString()).toFixed(3)} ${
  //     currencyLabels.hp
  //   }`;

  //   navigateToWithParams(Screen.CONFIRMATION_PAGE, {
  //     message: chrome.i18n.getMessage('popup_html_confirm_delegation', [
  //       value,
  //       `@${username}`,
  //     ]),
  //     title: 'popup_html_delegation',
  //     fields: [
  //       { label: 'popup_html_transfer_to', value: `@${username}` },
  //       { label: 'popup_html_value', value: valueS },
  //     ],
  //     afterConfirmAction: async () => {
  //       addToLoadingList('html_popup_delegation_operation');

  //       try {
  //         let success = await DelegationUtils.delegateVestingShares(
  //           activeAccount.name!,
  //           username!,
  //           FormatUtils.fromHP(value.toString(), globalProperties).toFixed(6) +
  //             ' VESTS',
  //           activeAccount.keys.active!,
  //         );
  //         navigateTo(Screen.HOME_PAGE, true);
  //         if (success) {
  //           setSuccessMessage('popup_html_delegation_successful');
  //         } else {
  //           setErrorMessage('popup_html_delegation_fail');
  //         }
  //       } catch (err: any) {
  //         setErrorMessage(err.message);
  //       } finally {
  //         removeFromLoadingList('html_popup_delegation_operation');
  //       }
  //     },
  //   });
  // };

  const goToEdit = (rcDelegation: RcDelegation) => {
    navigateToWithParams(Screen.RC_DELEGATIONS_PAGE, {
      formParams: rcDelegation,
    });
  };

  return (
    <div className="delegation-row" key={username}>
      {username && (
        <>
          <div className="item">
            <div className="username">{`@${username}`}</div>
            <div className="item-details">
              <div className="rc-hp-value">
                <span className="rc-value">
                  {RcDelegationsUtils.rcToGigaRc(Number(rcDelegation.value))} G
                  RC
                </span>
                <span className="hp-value">
                  ≈{' '}
                  {RcDelegationsUtils.rcToHp(
                    rcDelegation.value,
                    globalProperties,
                  )}{' '}
                  {currencyLabels.hp}
                </span>
              </div>
              {delegationType !== DelegationType.INCOMING && (
                <SVGIcon
                  icon={NewIcons.WALLET_HISTORY_EXPAND_COLLAPSE}
                  className={`expand-collapse-icon ${
                    isExpanded ? 'open' : 'closed'
                  }`}
                  onClick={toggleExpandablePanel}
                />
              )}
            </div>
          </div>
          {isExpanded && (
            <div className="expanded-panel">
              {!editModeActivated && (
                <>
                  <Separator type="horizontal" />
                  <div className="expandable-panel-content">
                    <div
                      className="delegation-item-button edit"
                      onClick={() => goToEdit(rcDelegation)}>
                      <SVGIcon icon={NewIcons.FAVORITE_ACCOUNTS_EDIT} />
                      <span className="label">
                        {chrome.i18n.getMessage('html_popup_button_edit_label')}
                      </span>
                    </div>
                    <div
                      className="delegation-item-button delete"
                      onClick={() => cancelDelegation(rcDelegation)}>
                      <SVGIcon icon={NewIcons.FAVORITE_ACCOUNTS_DELETE} />
                      <span className="label">
                        {chrome.i18n.getMessage('delete_label')}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
      {expirationDate && (
        <div className="pending-undelegation">
          <div className="expiration-date">
            {moment(expirationDate).format('L')}
          </div>
          <div className="amount">
            {amountHP} {currencyLabels.hp}
          </div>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    globalProperties: state.globalProperties,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
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
type PropsType = ConnectedProps<typeof connector> & RcIncomingOutgoingProps;

export const RcIncomingOutgoingItemComponent = connector(
  RcIncomingOutgoingDelegationItem,
);
