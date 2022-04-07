import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import {
  goBack,
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { DelegationType } from '@popup/pages/app-container/home/delegations/delegation-type.enum';
import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { Screen } from 'src/reference-data/screen.enum';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import BlockchainTransactionUtils from 'src/utils/tokens.utils';
import TransferUtils from 'src/utils/transfer.utils';
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
        addToLoadingList('html_popup_cancel_delegation_operation');
        let tokenOperationResult = await HiveEngineUtils.cancelDelegationToken(
          activeAccount.keys.active as string,
          username,
          symbol,
          amount.toString(),
          activeAccount.name!,
        );

        if (tokenOperationResult.id) {
          addToLoadingList('html_popup_confirm_transaction_operation');
          removeFromLoadingList(`html_popup_cancel_delegation_operation`);
          let confirmationResult: any =
            await BlockchainTransactionUtils.tryConfirmTransaction(
              tokenOperationResult.id,
            );
          removeFromLoadingList('html_popup_confirm_transaction_operation');
          if (confirmationResult.confirmed) {
            if (confirmationResult.error) {
              setErrorMessage('popup_html_hive_engine_error', [
                confirmationResult.error,
              ]);
              goBack();
            } else {
              await TransferUtils.saveTransferRecipient(
                username,
                activeAccount,
              );
              setSuccessMessage(`popup_html_cancel_delegation_tokens_success`);
              navigateTo(Screen.HOME_PAGE, true);
            }
          } else {
            setErrorMessage('popup_token_timeout');
          }
        } else {
          setErrorMessage(`popup_html_cancel_delegation_tokens_failed`);
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
        let tokenOperationResult = await HiveEngineUtils.delegateToken(
          activeAccount.keys.active as string,
          username,
          symbol,
          value.toString(),
          activeAccount.name!,
        );

        if (tokenOperationResult.id) {
          addToLoadingList('html_popup_confirm_transaction_operation');
          removeFromLoadingList(`html_popup_delegation_operation`);
          let confirmationResult: any =
            await BlockchainTransactionUtils.tryConfirmTransaction(
              tokenOperationResult.id,
            );
          removeFromLoadingList('html_popup_confirm_transaction_operation');
          if (confirmationResult.confirmed) {
            if (confirmationResult.error) {
              setErrorMessage('popup_html_hive_engine_error', [
                confirmationResult.error,
              ]);
              goBack();
            } else {
              await TransferUtils.saveTransferRecipient(
                username,
                activeAccount,
              );
              setSuccessMessage(`popup_html_delegate_tokens_success`);
              navigateTo(Screen.HOME_PAGE, true);
            }
          } else {
            setErrorMessage('popup_token_timeout');
          }
        } else {
          setErrorMessage(`popup_html_delegate_tokens_failed`);
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
