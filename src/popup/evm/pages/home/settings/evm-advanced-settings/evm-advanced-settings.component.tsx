import { EvmSettings } from '@popup/evm/interfaces/evm-settings.interface';
import { EvmSettingsUtils } from '@popup/evm/utils/evm-settings.utils';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { ArrayUtils } from 'src/utils/array.utils';

const EvmAdvancedSettings = ({ setTitleContainerProperties }: PropsType) => {
  const [evmSettings, setEvmSettings] = useState<EvmSettings>();
  const [displaySaveButton, setDisplaySaveButton] = useState<boolean>(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'evm_menu_advanced',
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
    if (evmSettings) {
      await EvmSettingsUtils.saveSettings(evmSettings);
      setDisplaySaveButton(false);
    }
  };

  return (
    <div className="evm-advanced-settings-page">
      <div className="fields">
        {evmSettings && evmSettings.smartContracts && (
          <div className="settings-section advanced-settings-section">
            <div className="section-title">
              {chrome.i18n.getMessage('evm_menu_advanced_smart_contracts')}
            </div>
            <div className="section-fields">
              <CheckboxPanelComponent
                title="evm_menu_advanced_smart_contracts_display_spam_title"
                hint="evm_menu_advanced_smart_contracts_display_spam_hint"
                checked={evmSettings.smartContracts.displayPossibleSpam}
                onChange={(value) =>
                  updateField('smartContracts.displayPossibleSpam', value)
                }></CheckboxPanelComponent>
              <CheckboxPanelComponent
                title="evm_menu_advanced_smart_contracts_display_non_verified_title"
                hint="evm_menu_advanced_smart_contracts_display_non_verified_hint"
                checked={evmSettings.smartContracts.displayNonVerifiedContracts}
                onChange={(value) =>
                  updateField(
                    'smartContracts.displayNonVerifiedContracts',
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
          label={'popup_html_save'}
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

export const EvmAdvancedSettingsComponent = connector(EvmAdvancedSettings);
