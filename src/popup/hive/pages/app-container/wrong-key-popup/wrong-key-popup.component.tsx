import { LocalAccount } from '@interfaces/local-account.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import ButtonComponent from 'src/common-ui/button/button.component';
import { loadActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import { navigateTo } from 'src/popup/hive/actions/navigation.actions';
import { RootState } from 'src/popup/hive/store';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './wrong-key-popup.component.scss';

export interface WrongKeysOnUser {
  [key: string]: string[];
}
interface Props {
  displayWrongKeyPopup: WrongKeysOnUser;
  setDisplayWrongKeyPopup: React.Dispatch<
    React.SetStateAction<WrongKeysOnUser | undefined>
  >;
}

const WrongKeyPopup = ({
  displayWrongKeyPopup,
  setDisplayWrongKeyPopup,
  navigateTo,
  loadActiveAccount,
  accounts,
}: Props & PropsType) => {
  const [accountFound, setaccountFound] = useState(
    Object.keys(displayWrongKeyPopup)[0],
  );
  const [wrongKeysFound, setWrongKeysFound] = useState<string[]>(
    Object.values(displayWrongKeyPopup)[0],
  );

  const skipKeyCheckOnAccount = async () => {
    let prevNoKeyCheck = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.NO_KEY_CHECK,
    );
    if (prevNoKeyCheck) {
      prevNoKeyCheck = { ...displayWrongKeyPopup, ...prevNoKeyCheck };
    }
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.NO_KEY_CHECK,
      prevNoKeyCheck ?? displayWrongKeyPopup,
    );
    setDisplayWrongKeyPopup(undefined);
  };

  const loadAccountGotoManage = async () => {
    let actualNoKeyCheck = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.NO_KEY_CHECK,
    );
    if (actualNoKeyCheck && actualNoKeyCheck[accountFound!]) {
      delete actualNoKeyCheck[accountFound!];
    }
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.NO_KEY_CHECK,
      actualNoKeyCheck,
    );
    loadActiveAccount(
      accounts.find((account: LocalAccount) => account.name === accountFound!)!,
    );
    navigateTo(Screen.SETTINGS_MANAGE_ACCOUNTS);
  };

  return (
    <div className="wrong-key-popup">
      <div className="overlay"></div>
      <div className="wrong-key-popup-container">
        <div className="title">
          {chrome.i18n.getMessage('html_popup_wrong_key_title', [
            wrongKeysFound.length !== 1 ? 's' : '',
          ])}
        </div>
        <div
          className="introduction"
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage(
              'html_popup_wrong_key_introduction',
              [
                accountFound,
                wrongKeysFound.join(', '),
                wrongKeysFound.length !== 1 ? 's' : '',
                wrongKeysFound.length !== 1 ? 's' : '',
              ],
            ),
          }}></div>
        <div className="buttons-container fix-to-bottom">
          <ButtonComponent
            label="popup_html_wrong_key_popup_replace"
            onClick={loadAccountGotoManage}
          />
          <ButtonComponent
            label="popup_html_wrong_key_popup_do_nothing"
            onClick={skipKeyCheckOnAccount}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.accounts,
  };
};

const connector = connect(mapStateToProps, {
  navigateTo,
  loadActiveAccount,
});
type PropsType = ConnectedProps<typeof connector>;

export const WrongKeyPopupComponent = connector(WrongKeyPopup);
