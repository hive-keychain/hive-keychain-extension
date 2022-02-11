import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { RootState } from '@popup/store';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './keychainify.component.scss';

const Keychainify = ({ setTitleContainerProperties }: PropsFromRedux) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_keychainify',
      isBackButtonEnabled: true,
    });
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
      <div className="intro">
        {chrome.i18n.getMessage('popup_html_keychainify_text')}
      </div>

      <CheckboxComponent
        title="popup_html_enable_keychainify_title"
        checked={enabled}
        onChange={setEnabled}
        hint="popup_html_enable_keychainify_info"></CheckboxComponent>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const KeychainifyComponent = connector(Keychainify);
