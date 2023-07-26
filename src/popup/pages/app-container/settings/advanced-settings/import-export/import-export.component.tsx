import { BackgroundMessage } from '@background/background-message.interface';
import { setAccounts } from '@popup/actions/account.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import AccountUtils from 'src/utils/account.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './import-export.component.scss';

const ImportExport = ({
  setAccounts,
  localAccounts,
  mk,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'import_backup_html_title',
      isBackButtonEnabled: true,
    });
  }, []);

  const handleImportBackup = () => {
    chrome.windows.getCurrent(async (currentWindow) => {
      const win: chrome.windows.CreateData = {
        url: chrome.runtime.getURL('import-backup.html'),
        type: 'popup',
        height: 566,
        width: 350,
        left: currentWindow.width! - 350 + currentWindow.left!,
        top: currentWindow.top,
      };
      // Except on Firefox
      //@ts-ignore
      if (typeof InstallTrigger === undefined) win.focused = true;
      const window = await chrome.windows.create(win);
      chrome.runtime.onMessage.addListener(
        onImportBackupUploadSuccessfulListener,
      );
    });
  };

  const onImportBackupUploadSuccessfulListener = (
    backgroundMessage: BackgroundMessage,
    sender: chrome.runtime.MessageSender,
    sendResp: (response?: any) => void,
  ) => {
    if (
      backgroundMessage.command === BackgroundCommand.IMPORT_BACKUP_CALLBACK &&
      backgroundMessage.value.accounts &&
      backgroundMessage.value.accounts.length
    ) {
      setAccounts(backgroundMessage.value.accounts);
      chrome.runtime.onMessage.removeListener(
        onImportBackupUploadSuccessfulListener,
      );
    }
  };

  const handleExportBackup = async () => {
    const settings = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.AUTOLOCK,
      LocalStorageKeyEnum.CLAIM_ACCOUNTS,
      LocalStorageKeyEnum.CLAIM_REWARDS,
      LocalStorageKeyEnum.NO_CONFIRM,
      LocalStorageKeyEnum.FAVORITE_USERS,
      LocalStorageKeyEnum.RPC_LIST,
      LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
      LocalStorageKeyEnum.CURRENT_RPC,
      LocalStorageKeyEnum.SWITCH_RPC_AUTO,
    ]);
    const accounts = { list: localAccounts };
    const backupData = {
      settings: settings,
      accounts: await AccountUtils.encryptAccounts(accounts, mk),
    };
    var data = new Blob([JSON.stringify(backupData)], {
      type: 'text/plain',
    });
    var url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keychain-backup.kc';
    a.click();
  };

  return (
    <div aria-label="import-export-page" className="import-export-page">
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_import_export_caption'),
        }}></div>

      <div className="button-container">
        <ButtonComponent
          label={'popup_html_import_permissions'}
          onClick={handleImportBackup}
          logo={Icons.IMPORT}
          additionalClass="button-import-export"
        />
        <ButtonComponent
          label={'popup_html_export_permissions'}
          onClick={handleExportBackup}
          logo={Icons.EXPORT}
          additionalClass="button-import-export"
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    localAccounts: state.accounts,
    mk: state.mk,
  };
};

const connector = connect(mapStateToProps, {
  setAccounts,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ImportExportComponent = connector(ImportExport);
