import { EvmSettings } from '@popup/evm/interfaces/evm-settings.interface';
import { EvmSettingsUtils } from '@popup/evm/utils/evm-settings.utils';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { EvmScreen } from 'src/popup/evm/reference-data/evm-screen.enum';
import { ArrayUtils } from 'src/utils/array.utils';

const EvmProviderSettings = ({ setTitleContainerProperties }: PropsType) => {
  const [evmSettings, setEvmSettings] = useState<EvmSettings>();
  const [displaySaveButton, setDisplaySaveButton] = useState(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'evm_menu_provider_compatibility',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
    init();
  }, []);

  const init = async () => {
    const settings = await EvmSettingsUtils.getSettings();
    setEvmSettings({ ...settings });
  };

  const updateField = (key: string, value: any) => {
    if (!evmSettings) return;
    const newSettings: EvmSettings = ArrayUtils.getSetDescendantProp(
      { ...evmSettings },
      key,
      value,
    );

    setEvmSettings(newSettings);
    setDisplaySaveButton(true);
  };

  const save = async () => {
    if (!evmSettings) return;
    await EvmSettingsUtils.saveSettings(evmSettings);
    setDisplaySaveButton(false);
  };

  return (
    <div
      className="evm-provider-settings-page"
      data-testid={`${EvmScreen.EVM_PROVIDER_SETTINGS}-page`}>
      <div className="fields">
        {evmSettings && (
          <div className="settings-section advanced-settings-section">
            <div className="provider-note warning-note">
              {chrome.i18n.getMessage('evm_provider_compatibility_warning')}
            </div>
            <div className="provider-note reload-note">
              {chrome.i18n.getMessage('evm_provider_compatibility_reload_note')}
            </div>
            <div className="section-fields">
              <CheckboxPanelComponent
                title="evm_provider_compatibility_prefer_title"
                hint="evm_provider_compatibility_prefer_hint"
                checked={evmSettings.providerCompatibility.preferOnLegacyDapps}
                onChange={(value) =>
                  updateField(
                    'providerCompatibility.preferOnLegacyDapps',
                    value,
                  )
                }></CheckboxPanelComponent>
            </div>
          </div>
        )}
      </div>
      {displaySaveButton && (
        <ButtonComponent
          dataTestId="button-save"
          label="popup_html_save"
          onClick={() => save()}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.evm.accounts,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});

type PropsType = ConnectedProps<typeof connector>;

export const EvmProviderSettingsComponent = connector(EvmProviderSettings);
export default EvmProviderSettingsComponent;
