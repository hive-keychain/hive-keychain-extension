import { TransactionOptions } from '@interfaces/keys.interface';
import { RcDelegation } from '@interfaces/rc-delegation.interface';
import { RcDelegationsUtils } from '@popup/hive/utils/rc-delegations.utils';
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
import React, { useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { ConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { DelegationType } from 'src/popup/hive/pages/app-container/home/delegations/delegation-type.enum';
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

export interface EditRcDelegationParams {
  formParams: any;
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
      method: KeychainKeyTypes.posting,
      message: chrome.i18n.getMessage(
        'popup_html_cancel_rc_delegation_confirm_text',
      ),
      fields: fields,
      title: 'popup_html_cancel_rc_delegation_title',
      afterConfirmAction: async (options?: TransactionOptions) => {
        addToLoadingList('html_popup_cancel_delegate_rc_operation');
        let success;

        success = await RcDelegationsUtils.cancelDelegation(
          rcDelegation.delegatee,
          activeAccount.name!,
          activeAccount.keys.posting!,
          options,
        );

        removeFromLoadingList('html_popup_cancel_delegate_rc_operation');

        if (success) {
          navigateTo(Screen.HOME_PAGE, true);
          if (success.isUsingMultisig) {
            setSuccessMessage('multisig_transaction_sent_to_signers');
          } else {
            setSuccessMessage('popup_html_cancel_rc_delegation_successful', [
              `@${rcDelegation.delegatee}`,
            ]);
          }
        } else {
          setErrorMessage('popup_html_cancel_rc_delegation_failed');
        }
      },
    } as ConfirmationPageParams);
  };

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
                  icon={SVGIcons.WALLET_HISTORY_EXPAND_COLLAPSE}
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
                      <SVGIcon icon={SVGIcons.FAVORITE_ACCOUNTS_EDIT} />
                      <span className="label">
                        {chrome.i18n.getMessage('html_popup_button_edit_label')}
                      </span>
                    </div>
                    <div
                      className="delegation-item-button delete"
                      onClick={() => cancelDelegation(rcDelegation)}>
                      <SVGIcon icon={SVGIcons.FAVORITE_ACCOUNTS_DELETE} />
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
    activeAccount: state.hive.activeAccount,
    globalProperties: state.hive.globalProperties,
    currencyLabels: CurrencyUtils.getCurrencyLabels(
      state.hive.activeRpc?.testnet!,
    ),
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
