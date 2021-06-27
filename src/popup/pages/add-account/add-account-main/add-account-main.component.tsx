import {navigateTo} from '@popup/actions/navigation.actions';
import {RootState} from '@popup/store';
import React from 'react';
import {connect, ConnectedProps} from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import {PageTitleComponent} from 'src/common-ui/page-title/page-title.component';
import {Screen} from 'src/reference-data/screen.enum';
import './add-account-main.component.css';

const AddAccountMain = ({navigateTo, accounts}: PropsFromRedux) => {
  const handleAddByKeys = (): void => {
    navigateTo(Screen.ACCOUNT_PAGE_ADD_BY_KEYS);
  };
  const handleAddByAuth = (): void => {
    navigateTo(Screen.ACCOUNT_PAGE_ADD_BY_AUTH);
  };
  const handleImportKeys = (): void => {
    //navigateTo(Screen.ACCOUNT_PAGE_IMPORT_KEYS);
    chrome.windows.getCurrent((w) => {
      const win: chrome.windows.CreateData = {
        url: chrome.runtime.getURL('import.html'),
        type: 'popup',
        height: 566,
        width: 350,
        left: w.width! - 350 + w.left!,
        top: w.top,
      };
      // Except on Firefox
      //@ts-ignore
      if (typeof InstallTrigger === undefined) win.focused = true;
      chrome.windows.create(win);
    });
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
  return {accounts: state.accounts};
};

const connector = connect(mapStateToProps, {navigateTo});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AddAccountMainComponent = connector(AddAccountMain);
