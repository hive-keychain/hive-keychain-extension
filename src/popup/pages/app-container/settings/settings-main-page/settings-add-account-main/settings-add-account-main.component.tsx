import { setAccounts } from '@popup/actions/account.actions';
import {
  navigateTo,
  navigateToSecondary,
} from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { BackgroundMessage } from 'src/background/background-message.interface';
import ButtonComponent from 'src/common-ui/button/button.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import { Screen } from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';
import './settings-add-account-main.component.css';

const SettingsAddAccountMain = ({
  navigateTo,
  accounts,
  setAccounts,
}: PropsFromRedux) => {
  const [importWindow, setImportWindow] = useState<number>();
  const handleAddByKeys = (): void => {
    navigateToSecondary(Screen.ACCOUNT_PAGE_ADD_BY_KEYS);
  };
  const handleAddByAuth = (): void => {
    navigateToSecondary(Screen.ACCOUNT_PAGE_ADD_BY_AUTH);
  };
  const handleImportKeys = (): void => {
    chrome.windows.getCurrent(async (currentWindow) => {
      const win: chrome.windows.CreateData = {
        url: chrome.runtime.getURL('import.html'),
        type: 'popup',
        height: 650,
        width: 350,
        left: currentWindow.width! - 350 + currentWindow.left!,
        top: currentWindow.top,
      };
      // Except on Firefox
      //@ts-ignore
      if (typeof InstallTrigger === undefined) win.focused = true;
      const window = await chrome.windows.create(win);
      // setImportWindow(window?.id);
      chrome.runtime.onMessage.addListener(onSentBackAccountsListener);
    });
  };

  const onSentBackAccountsListener = (message: BackgroundMessage) => {
    if (message.command === BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS) {
      if (message.value?.length) {
        setAccounts(
          AccountUtils.mergeImportedAccountsToExistingAccounts(
            message.value,
            accounts,
          ),
        );
        // chrome.windows.remove(importWindow!);
        navigateTo(Screen.SETTINGS_ROUTER, Screen.SETTINGS_MAIN_PAGE);
      }
      chrome.runtime.onMessage.removeListener(onSentBackAccountsListener);
    }
  };

  return (
    <div className="add-account-page">
      <PageTitleComponent
        title="popup_html_setup"
        isBackButtonEnabled={false}
      />
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_chose_add_method'),
        }}></div>

      <ButtonComponent
        label={'popup_html_add_by_keys'}
        onClick={handleAddByKeys}
      />
      {accounts.length > 0 && (
        <ButtonComponent
          label={'popup_html_add_by_auth'}
          onClick={handleAddByAuth}
        />
      )}
      <ButtonComponent
        label={'popup_html_import_keys'}
        onClick={handleImportKeys}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { accounts: state.accounts };
};

const connector = connect(mapStateToProps, {
  navigateToSecondary,
  navigateTo,

  setAccounts,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsAddAccountMainComponent = connector(
  SettingsAddAccountMain,
);
