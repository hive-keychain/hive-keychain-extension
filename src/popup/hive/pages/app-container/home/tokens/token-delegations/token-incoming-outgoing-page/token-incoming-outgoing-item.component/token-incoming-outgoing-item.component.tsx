import React, { useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import {
  addToLoadingList,
  removeFromLoadingList,
} from 'src/popup/hive/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from 'src/popup/hive/actions/message.actions';
import {
  goBack,
  navigateTo,
  navigateToWithParams,
} from 'src/popup/hive/actions/navigation.actions';
import { DelegationType } from 'src/popup/hive/pages/app-container/home/delegations/delegation-type.enum';
import { RootState } from 'src/popup/hive/store';
import { FavoriteUserUtils } from 'src/popup/hive/utils/favorite-user.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import TokensUtils from 'src/popup/hive/utils/tokens.utils';
import { Screen } from 'src/reference-data/screen.enum';
import './token-incoming-outgoing-item.component.scss';

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

  const cancelDelegation = () => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_cancel_delegation_message',
      ),
      title: 'popup_html_cancel_delegation',
      fields: [{ label: 'popup_html_transfer_to', value: `@${username}` }],
      afterConfirmAction: async () => {
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
    });
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

    const valueString = `${value} ${symbol}`;
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_delegate_tokens_confirm_text',
      ),
      title: 'popup_html_delegation',
      fields: [
        { label: 'popup_html_transfer_to', value: `@${username}` },
        { label: 'popup_html_value', value: valueString },
      ],
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_delegation_operation');

        try {
          let tokenOperationResult = await TokensUtils.delegateToken(
            username,
            symbol,
            value.toString(),
            activeAccount.keys.active!,
            activeAccount.name!,
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
    });
  };

  return (
    <div className="delegation-row" key={username}>
      <div className="to-from">@{username}</div>
      <div className="right-panel">
        {!editModeActivated && (
          <div
            className="value"
            onDoubleClick={() => {
              if (delegationType === DelegationType.OUTGOING) enterEditMode();
            }}>
            {amount} {symbol}
          </div>
        )}
        {editModeActivated && (
          <InputComponent
            min={0}
            value={value}
            type={InputType.NUMBER}
            onChange={setValue}
            placeholder=""></InputComponent>
        )}
        {delegationType === DelegationType.OUTGOING && !editModeActivated && (
          <img
            className="icon edit-delegation"
            src="/assets/images/edit.png"
            onClick={enterEditMode}
          />
        )}
        {delegationType === DelegationType.OUTGOING && !editModeActivated && (
          <img
            className="icon erase-delegation"
            src="/assets/images/clear.png"
            onClick={cancelDelegation}
          />
        )}
        {delegationType === DelegationType.OUTGOING && editModeActivated && (
          <img
            className={'icon always-displayed submit'}
            src="/assets/images/submit.png"
            onClick={saveChanges}
          />
        )}
        {delegationType === DelegationType.OUTGOING && editModeActivated && (
          <img
            className="icon always-displayed cancel"
            src="/assets/images/delete.png"
            onClick={cancelEdit}
          />
        )}
      </div>
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
  goBack,
});
type PropsType = ConnectedProps<typeof connector> & TokenIncomingOutgoingProps;

export const TokenIncomingOutgoingItemComponent = connector(
  TokenIncomingOutgoing,
);
