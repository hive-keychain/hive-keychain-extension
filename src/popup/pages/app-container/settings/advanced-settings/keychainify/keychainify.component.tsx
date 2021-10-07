import { RootState } from '@popup/store';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import SwitchComponent from 'src/common-ui/switch/switch.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './keychainify.component.scss';

const Keychainify = ({}: PropsFromRedux) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
      enabled,
    );
    chrome.runtime.sendMessage({
      command: BackgroundCommand.SAVE_ENABLE_KEYCHAINIFY,
      value: enabled,
    });
  }, [enabled]);

  const init = async () => {
    setEnabled(
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
      ),
    );
  };

  return (
    <div className="keychainify-page">
      <PageTitleComponent
        title="popup_html_keychainify"
        isBackButtonEnabled={true}
      />

      <div className="intro">
        {chrome.i18n.getMessage('popup_html_keychainify_text')}
      </div>

      <SwitchComponent
        title="popup_html_enable_keychainify_title"
        checked={enabled}
        onChange={setEnabled}
        hint="popup_html_enable_keychainify_info"></SwitchComponent>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const KeychainifyComponent = connector(Keychainify);
