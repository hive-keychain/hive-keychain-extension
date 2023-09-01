import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { RootState } from 'src/popup/hive/store';
import LocalStorageUtils from 'src/utils/localStorage.utils';

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
  }, [enabled]);

  const init = async () => {
    setEnabled(
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
      ),
    );
  };

  return (
    <div
      data-testid={`${Screen.SETTINGS_KEYCHAINIFY}-page`}
      className="keychainify-page">
      <div className="intro">
        {chrome.i18n.getMessage('popup_html_keychainify_text')}
      </div>

      <CheckboxPanelComponent
        dataTestId="checkbox-keychainify"
        title="popup_html_enable_keychainify_title"
        checked={enabled}
        onChange={setEnabled}
        hint="popup_html_enable_keychainify_info"></CheckboxPanelComponent>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const KeychainifyComponent = connector(Keychainify);
