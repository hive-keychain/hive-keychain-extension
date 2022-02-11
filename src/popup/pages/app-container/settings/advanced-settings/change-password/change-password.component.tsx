import { setErrorMessage } from '@popup/actions/message.actions';
import { setMk } from '@popup/actions/mk.actions';
import { navigateTo } from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { Screen } from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';
import MkUtils from 'src/utils/mk.utils';
import './change-password.component.scss';

const ChangePassword = ({
  setErrorMessage,
  setMk,
  navigateTo,
  accounts,
  mk,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_change_password',
      isBackButtonEnabled: true,
    });
  }, []);

  const submitMk = (): any => {
    if (mk !== oldPassword) {
      setErrorMessage('wrong_password');
      return;
    }
    if (newPassword === newPasswordConfirm) {
      if (MkUtils.isPasswordValid(newPassword)) {
        AccountUtils.saveAccounts(accounts, newPassword);
        setMk(newPassword, true);
        navigateTo(Screen.HOME_PAGE, true);
      } else {
        setErrorMessage('popup_password_regex');
      }
    } else {
      setErrorMessage('popup_password_mismatch');
    }
  };

  return (
    <div className="change-password-page">
      <div className="caption">
        {chrome.i18n.getMessage('popup_html_change_password_text')}
      </div>

      <InputComponent
        value={oldPassword}
        onChange={setOldPassword}
        logo={Icons.PASSWORD}
        placeholder="popup_html_old_password"
        type={InputType.PASSWORD}
        onEnterPress={submitMk}
      />
      <InputComponent
        value={newPassword}
        onChange={setNewPassword}
        logo={Icons.PASSWORD}
        placeholder="popup_html_new_password"
        type={InputType.PASSWORD}
        onEnterPress={submitMk}
      />
      <InputComponent
        value={newPasswordConfirm}
        onChange={setNewPasswordConfirm}
        logo={Icons.PASSWORD}
        placeholder="popup_html_confirm"
        type={InputType.PASSWORD}
        onEnterPress={submitMk}
      />

      <ButtonComponent
        label={'popup_html_submit'}
        onClick={submitMk}
        fixToBottom
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { mk: state.mk, accounts: state.accounts };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  setMk,
  navigateTo,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ChangePasswordComponent = connector(ChangePassword);
