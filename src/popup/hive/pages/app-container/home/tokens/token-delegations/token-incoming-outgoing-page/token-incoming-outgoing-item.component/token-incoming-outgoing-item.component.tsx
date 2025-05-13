import { TransactionOptions } from '@interfaces/keys.interface';
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
import React, { useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { ConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { DelegationType } from 'src/popup/hive/pages/app-container/home/delegations/delegation-type.enum';
import { FavoriteUserUtils } from 'src/popup/hive/utils/favorite-user.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import TokensUtils from 'src/popup/hive/utils/tokens.utils';
import { Screen } from 'src/reference-data/screen.enum';
import FormatUtils from 'src/utils/format.utils';

interface TokenIncomingOutgoingProps {
  delegationType: DelegationType;
  username: string;
  amount: string;
  symbol: string;
}

const TokenIncomingOutgoing = ({
  activeAccount,
  delegationType,
  username,
  amount,
  symbol,
  navigateToWithParams,
  navigateTo,
  setErrorMessage,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
  goBack,
}: PropsType) => {
  const [editModeActivated, setEditModeActivated] = useState(false);
  const [value, setValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const cancelDelegation = () => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: KeychainKeyTypes.active,
      message: chrome.i18n.getMessage(
        'popup_html_confirm_cancel_delegation_message',
      ),
      title: 'popup_html_cancel_delegation',
      fields: [{ label: 'popup_html_transfer_to', value: `@${username}` }],
      afterConfirmAction: async (options?: TransactionOptions) => {
        addToLoadingList(
          'html_popup_cancel_delegation_operation',
          KeysUtils.getKeyType(
            activeAccount.keys.active!,
            activeAccount.keys.activePubkey!,
          ),
        );

        try {
          let tokenOperationResult = await TokensUtils.cancelDelegationToken(
            username,
            symbol,
            amount.toString(),
            activeAccount.keys.active!,
            activeAccount.name!,
            options,
          );
          if (tokenOperationResult.broadcasted) {
            addToLoadingList('html_popup_confirm_transaction_operation');

            if (tokenOperationResult.confirmed) {
              await FavoriteUserUtils.saveFavoriteUser(username, activeAccount);
              setSuccessMessage(`popup_html_cancel_delegation_tokens_success`);
              navigateTo(Screen.HOME_PAGE, true);
            } else {
              setErrorMessage('popup_token_timeout');
            }
          } else {
            setErrorMessage(`popup_html_cancel_delegation_tokens_failed`);
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList(`html_popup_cancel_delegation_operation`);
          removeFromLoadingList('html_popup_confirm_transaction_operation');
        }
      },
    } as ConfirmationPageParams);
  };

  const enterEditMode = () => {
    setEditModeActivated(true);
    setValue(amount);
  };

  const cancelEdit = () => {
    setEditModeActivated(false);
    setValue(amount);
  };

  const saveChanges = () => {
    setEditModeActivated(false);

    if (Number(value) <= 0) {
      cancelDelegation();
    }

    const formattedAmount = `${value} ${symbol}`;

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: KeychainKeyTypes.active,
      message: chrome.i18n.getMessage(
        'popup_html_delegate_tokens_confirm_text',
      ),
      title: 'popup_html_delegation',
      fields: [
        { label: 'popup_html_transfer_to', value: `@${username}` },
        { label: 'popup_html_value', value: formattedAmount },
      ],
      afterConfirmAction: async (options?: TransactionOptions) => {
        addToLoadingList('html_popup_delegation_operation');

        try {
          let tokenOperationResult = await TokensUtils.delegateToken(
            username,
            symbol,
            value.toString(),
            activeAccount.keys.active!,
            activeAccount.name!,
            options,
          );

          if (tokenOperationResult.broadcasted) {
            addToLoadingList('html_popup_confirm_transaction_operation');
            removeFromLoadingList(`html_popup_delegation_operation`);
            removeFromLoadingList('html_popup_confirm_transaction_operation');
            if (tokenOperationResult.confirmed) {
              await FavoriteUserUtils.saveFavoriteUser(username, activeAccount);
              setSuccessMessage(`popup_html_delegate_tokens_success`);
              navigateTo(Screen.HOME_PAGE, true);
            } else {
              setErrorMessage('popup_token_timeout');
            }
          } else {
            setErrorMessage(`popup_html_delegate_tokens_failed`);
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList(`html_popup_delegation_operation`);
          removeFromLoadingList('html_popup_confirm_transaction_operation');
        }
      },
    } as ConfirmationPageParams);
  };

  const toggleExpandablePanel = () => {
    if (!editModeActivated) setIsExpanded(!isExpanded);
  };

  return (
    <div className="delegation-row" key={username}>
      {username && (
        <>
          <div className="item">
            <div className="username">{`@${username}`}</div>
            <div className="item-details">
              {!editModeActivated && (
                <div
                  className="value"
                  onDoubleClick={() => {
                    if (delegationType === DelegationType.OUTGOING)
                      enterEditMode();
                  }}>
                  {FormatUtils.withCommas(amount)} {symbol}
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
  goBack,
});
type PropsType = ConnectedProps<typeof connector> & TokenIncomingOutgoingProps;

export const TokenIncomingOutgoingItemComponent = connector(
  TokenIncomingOutgoing,
);
