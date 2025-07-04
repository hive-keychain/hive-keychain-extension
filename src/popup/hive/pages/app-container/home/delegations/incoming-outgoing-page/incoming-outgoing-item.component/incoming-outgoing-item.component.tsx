import { TransactionOptions } from '@interfaces/keys.interface';
import {
  loadDelegatees,
  loadDelegators,
  loadPendingOutgoingUndelegations,
} from '@popup/hive/actions/delegations.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import {
  goBack,
  navigateTo,
  navigateToWithParams,
} from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { ConfirmationPageFieldTag } from 'src/common-ui/confirmation-page/confirmation-field.interface';
import { ConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { DelegationType } from 'src/popup/hive/pages/app-container/home/delegations/delegation-type.enum';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';
import { DelegationUtils } from 'src/popup/hive/utils/delegation.utils';
import { Screen } from 'src/reference-data/screen.enum';
import FormatUtils from 'src/utils/format.utils';

interface IncomingOutgoingProps {
  delegationType: DelegationType;
  username?: string;
  amount: string;
  expirationDate?: string;
  maxAvailable?: string;
}

const IncomingOutgoing = ({
  activeAccount,
  delegationType,
  username,
  amount,
  globalProperties,
  currencyLabels,
  expirationDate,
  navigateToWithParams,
  setErrorMessage,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
  loadDelegatees,
  loadDelegators,
  loadPendingOutgoingUndelegations,
  goBack,
}: PropsType) => {
  const [editModeActivated, setEditModeActivated] = useState(false);
  const [value, setValue] = useState('');
  const [amountHP, setAmountHP] = useState('...');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setAmountHP(
      FormatUtils.toHP(
        amount.toString().replace(' VESTS', ''),
        globalProperties,
      ).toFixed(3),
    );
  }, [amount]);

  const toggleExpandablePanel = () => {
    if (!editModeActivated) setIsExpanded(!isExpanded);
  };

  const cancelDelegation = async () => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: KeychainKeyTypes.active,
      message: chrome.i18n.getMessage(
        'popup_html_confirm_cancel_delegation_message',
      ),
      title: 'popup_html_cancel_delegation',
      fields: [
        {
          label: 'popup_html_transfer_to',
          value: `@${username}`,
          tag: ConfirmationPageFieldTag.USERNAME,
          iconPosition: 'right',
        },
      ],
      afterConfirmAction: async (options?: TransactionOptions) => {
        addToLoadingList('html_popup_cancel_delegation_operation');

        try {
          let success = await DelegationUtils.delegateVestingShares(
            activeAccount.name!,
            username!,
            '0.000000 VESTS',
            activeAccount.keys.active!,
            options,
          );
          if (success) {
            if (success.isUsingMultisig) {
              setSuccessMessage('multisig_transaction_sent_to_signers');
            } else setSuccessMessage('popup_html_cancel_delegation_successful');
            await refreshDelegations();
            goBack();
          } else {
            setErrorMessage('popup_html_cancel_delegation_fail');
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList('html_popup_cancel_delegation_operation');
        }
      },
    } as ConfirmationPageParams);
  };

  const enterEditMode = () => {
    setEditModeActivated(true);
    setValue(amountHP);
  };

  const cancelEdit = () => {
    setEditModeActivated(false);
    setValue(amountHP);
  };

  const saveChanges = async () => {
    setEditModeActivated(false);
    setAmountHP(value);

    if (Number(value) <= 0) {
      cancelDelegation();
    }

    const formattedAmount = `${parseFloat(value.toString()).toFixed(3)} ${
      currencyLabels.hp
    }`;

    const stringifiedAmount = `${FormatUtils.formatCurrencyValue(
      parseFloat(value.toString()),
    )} ${currencyLabels.hp}`;

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: KeychainKeyTypes.active,
      message: chrome.i18n.getMessage('popup_html_confirm_delegation', [
        value,
        `@${username}`,
      ]),
      title: 'popup_html_delegation',
      fields: [
        {
          label: 'popup_html_transfer_to',
          value: `@${username}`,
          tag: ConfirmationPageFieldTag.USERNAME,
          iconPosition: 'right',
        },
        {
          label: 'popup_html_value',
          value: stringifiedAmount,
          tag: ConfirmationPageFieldTag.AMOUNT,
          tokenSymbol: currencyLabels.hp,
          iconPosition: 'right',
        },
      ],
      afterConfirmAction: async (options?: TransactionOptions) => {
        addToLoadingList('html_popup_delegation_operation');

        try {
          let success = await DelegationUtils.delegateVestingShares(
            activeAccount.name!,
            username!,
            FormatUtils.fromHP(value.toString(), globalProperties!).toFixed(6) +
              ' VESTS',
            activeAccount.keys.active!,
            options,
          );
          if (success) {
            if (success.isUsingMultisig) {
              setSuccessMessage('multisig_transaction_sent_to_signers');
            } else setSuccessMessage('popup_html_delegation_successful');
            await refreshDelegations();
            goBack();
          } else {
            setErrorMessage('popup_html_delegation_fail');
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList('html_popup_delegation_operation');
        }
      },
    } as ConfirmationPageParams);
  };

  const refreshDelegations = async () => {
    return await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        loadDelegators(activeAccount.name!);
        loadDelegatees(activeAccount.name!);
        loadPendingOutgoingUndelegations(activeAccount.name!);
        resolve();
      }, 3000);
    });
  };

  return (
    <div className="delegation-row" key={username}>
      {username && (
        <>
          <div className="item" onClick={toggleExpandablePanel}>
            <div className="username">{`@${username}`}</div>
            <div className="item-details">
              {!editModeActivated && (
                <div
                  className="value"
                  onDoubleClick={() => {
                    if (delegationType === DelegationType.OUTGOING)
                      enterEditMode();
                  }}>
                  {FormatUtils.withCommas(amountHP)} {currencyLabels.hp}
                </div>
              )}
              {editModeActivated && (
                <div className="edit-panel">
                  <input
                    className="edit-label"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={chrome.i18n.getMessage(
                      'popup_html_favorite_user_nickname',
                    )}
                  />

                  <SVGIcon
                    onClick={() => saveChanges()}
                    icon={SVGIcons.FAVORITE_ACCOUNTS_SAVE}
                    className="edit-button"
                  />
                  <SVGIcon
                    onClick={() => cancelEdit()}
                    icon={SVGIcons.FAVORITE_ACCOUNTS_CANCEL}
                    className="edit-button"
                  />
                </div>
              )}
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
                      onClick={() => enterEditMode()}>
                      <SVGIcon icon={SVGIcons.FAVORITE_ACCOUNTS_EDIT} />
                      <span className="label">
                        {chrome.i18n.getMessage('html_popup_button_edit_label')}
                      </span>
                    </div>
                    <div
                      className="delegation-item-button delete"
                      onClick={() => cancelDelegation()}>
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
    globalProperties: state.hive.globalProperties.globals,
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
  loadDelegatees,
  loadDelegators,
  loadPendingOutgoingUndelegations,
  goBack,
});
type PropsType = ConnectedProps<typeof connector> & IncomingOutgoingProps;

export const IncomingOutgoingItemComponent = connector(IncomingOutgoing);
