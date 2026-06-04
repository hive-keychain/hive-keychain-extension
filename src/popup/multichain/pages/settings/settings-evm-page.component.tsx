import { EvmSettings } from '@popup/evm/interfaces/evm-settings.interface';
import { EvmSettingsUtils } from '@popup/evm/utils/evm-settings.utils';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { ArrayUtils } from 'src/utils/array.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
const SettingsEvmPage = ({ setTitleContainerProperties }: PropsFromRedux) => {
  const [evmSettings, setEvmSettings] = useState<EvmSettings>();
  const [displaySaveButton, setDisplaySaveButton] = useState(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'evm_settings',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
    init();
  }, []);

  const init = async () => {
    setEvmSettings({ ...(await EvmSettingsUtils.getSettings()) });
  };

  const updateField = (key: string, value: boolean) => {
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
    <div className="settings-evm-page" data-testid="SETTINGS_EVM-page">
      {evmSettings && (
        <div className="fields">
          <div className="settings-section advanced-settings-section">
            <div className="section-title">
              {I18nUtils.getMessage('evm_menu_provider_compatibility')}
            </div>
            <div className="provider-note warning-note">
              {I18nUtils.getMessage('evm_provider_compatibility_warning')}
            </div>
            <div className="provider-note reload-note">
              {I18nUtils.getMessage('evm_provider_compatibility_reload_note')}
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
                }
              />
            </div>
          </div>
          <div className="settings-section advanced-settings-section">
            <div className="section-title">
              {I18nUtils.getMessage('evm_menu_security')}
            </div>
            <div className="section-fields">
              <CheckboxPanelComponent
                title="evm_menu_advanced_smart_contracts_display_spam_title"
                hint="evm_menu_advanced_smart_contracts_display_spam_hint"
                checked={evmSettings.smartContracts.displayPossibleSpam}
                onChange={(value) =>
                  updateField('smartContracts.displayPossibleSpam', value)
                }
              />
              <CheckboxPanelComponent
                title="evm_menu_advanced_smart_contracts_display_non_verified_title"
                hint="evm_menu_advanced_smart_contracts_display_non_verified_hint"
                checked={evmSettings.smartContracts.displayNonVerifiedContracts}
                onChange={(value) =>
                  updateField(
                    'smartContracts.displayNonVerifiedContracts',
                    value,
                  )
                }
              />
            </div>
          </div>
        </div>
      )}
      {displaySaveButton && (
        <ButtonComponent
          dataTestId="button-save"
          label="popup_html_save"
          onClick={save}
        />
      )}
    </div>
  );
};

const connector = connect(
  (state: RootState) => ({}),
  {
    setTitleContainerProperties,
  },
);

type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsEvmPageComponent = connector(SettingsEvmPage);
