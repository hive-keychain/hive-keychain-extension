import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { Icons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import {
  setErrorMessage,
  setSuccessMessage,
} from 'src/popup/hive/actions/message.actions';
import { setMk } from 'src/popup/hive/actions/mk.actions';
import { navigateTo } from 'src/popup/hive/actions/navigation.actions';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { RootState } from 'src/popup/hive/store';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import MkUtils from 'src/popup/hive/utils/mk.utils';
import { Screen } from 'src/reference-data/screen.enum';

const ChangePassword = ({
  setErrorMessage,
  setMk,
  navigateTo,
  accounts,
  mk,
  setTitleContainerProperties,
  setSuccessMessage,
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
        setSuccessMessage('popup_master_changed');
      } else {
        setErrorMessage('popup_password_regex');
      }
    } else {
      setErrorMessage('popup_password_mismatch');
    }
  };

  return (
    <div
      data-testid={`${Screen.SETTINGS_CHANGE_PASSWORD}-page`}
      className="change-password-page">
      <div className="caption">
        {chrome.i18n.getMessage('popup_html_change_password_text')}
      </div>

      <InputComponent
        dataTestId="input-old-password"
        value={oldPassword}
        onChange={setOldPassword}
        logo={Icons.PASSWORD}
        placeholder="popup_html_old_password"
        label="popup_html_old_password"
        type={InputType.PASSWORD}
        onEnterPress={submitMk}
      />
      <InputComponent
        dataTestId="input-new-password"
        value={newPassword}
        onChange={setNewPassword}
        logo={Icons.PASSWORD}
        placeholder="popup_html_new_password"
        label="popup_html_new_password"
        type={InputType.PASSWORD}
        onEnterPress={submitMk}
      />
      <InputComponent
        dataTestId="input-new-password-confirmation"
        value={newPasswordConfirm}
        onChange={setNewPasswordConfirm}
        logo={Icons.PASSWORD}
        placeholder="popup_html_confirm"
        label="popup_html_confirm"
        type={InputType.PASSWORD}
        onEnterPress={submitMk}
      />

      <ButtonComponent
        dataTestId="submit-button"
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
  setSuccessMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ChangePasswordComponent = connector(ChangePassword);
