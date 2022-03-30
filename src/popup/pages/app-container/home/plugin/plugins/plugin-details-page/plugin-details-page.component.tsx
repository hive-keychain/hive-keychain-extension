import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { PluginMessage } from '@popup/pages/app-container/home/plugin/plugin-message.enum';
import {
  CheckboxSetting,
  DropdownSetting,
  InputSetting,
  Plugin,
  PluginSetting,
  PluginSettingType,
} from '@popup/pages/app-container/home/plugin/plugin.interface';
import { Extension } from '@popup/pages/app-container/home/plugin/plugins.whitelist';
import { SelectAccountSectionComponent } from '@popup/pages/app-container/home/select-account-section/select-account-section.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import Select from 'react-dropdown-select';
import { connect, ConnectedProps } from 'react-redux';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import ButtonComponent from 'src/common-ui/button/button.component';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox.component';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PluginsUtils } from 'src/utils/plugins.utils';
import './plugin-details-page.component.scss';

const PluginDetailsPage = ({
  plugin,
  activeAccount,
  setTitleContainerProperties,
  setErrorMessage,
  setSuccessMessage,
}: PropsFromRedux) => {
  const [pluginInfo, setPluginInfo] = useState<Plugin>();

  const [form, setForm] = useState<any>();
  const [generalSectionHasError, setGeneralSectionHasError] = useState(false);
  const [userSectionHasError, setUserSectionHasError] = useState(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: plugin.name,
      skipTitleTranslation: true,
      isBackButtonEnabled: true,
    });
    initPluginInfo();
  }, []);

  useEffect(() => {
    if (!pluginInfo) return;
    let fields: any = {};
    fields = setUserSettings();
    if (pluginInfo.definition?.generalSettings) {
      for (const field of pluginInfo.definition?.generalSettings) {
        const savedData = pluginInfo.data.generalSettings
          ? pluginInfo.data.generalSettings[field.key]
          : null;
        fields = {
          ...fields,
          [field.key]: {
            value: savedData ? savedData : getDefaultValue(field),
            hasError: false,
          },
        };
      }
    }
    setForm(fields);
  }, [pluginInfo]);

  useEffect(() => {
    if (!pluginInfo || !activeAccount) return;
    const newForm = setUserSettings();
    setForm(newForm);
  }, [activeAccount]);

  const setUserSettings = () => {
    let fields: any = form;
    if (pluginInfo?.definition.userSettings) {
      const userPluginInfo = pluginInfo.data.userSettings
        ? pluginInfo.data.userSettings[activeAccount.name!]
        : null;
      for (const field of pluginInfo.definition?.userSettings) {
        const savedData = userPluginInfo ? userPluginInfo[field.key] : null;
        fields = {
          ...fields,
          [field.key]: {
            value: savedData ? savedData : getDefaultValue(field),
            hasError: false,
          },
        };
      }
    }
    return fields;
  };

  const getDefaultValue = (field: PluginSetting) => {
    if (field.defaultValue) return field.defaultValue;
    else {
      if (field.type === PluginSettingType.CHECKBOX) return false;
      else return '';
    }
  };

  const updateFormValue = (key: string, value: any, field: PluginSetting) => {
    const hasError = field.required && (!value || value === '');
    const newForm = {
      ...form,
      [key]: {
        value: value,
        hasError: hasError,
      },
    };
    setForm(newForm);
  };

  const initPluginInfo = async () => {
    const p = await PluginsUtils.getPluginInfo(plugin);
    setPluginInfo({
      ...p,
      data: p.data ?? { userSettings: {}, generalSettings: {} },
    });
  };

  const getInput = (setting: PluginSetting, index: number) => {
    if (!form) return;
    switch (setting.type) {
      case PluginSettingType.INPUT:
        const inputSetting = setting as InputSetting;
        return (
          <InputComponent
            key={`${inputSetting.type}-${index}`}
            type={inputSetting.inputType as InputType}
            label={inputSetting.label}
            placeholder={inputSetting.placeholder}
            hint={inputSetting.hint}
            skipLabelTranslation={true}
            skipHintTranslation={true}
            skipPlaceholderTranslation={true}
            value={form[setting.key].value}
            onChange={(newValue) =>
              updateFormValue(setting.key, newValue, inputSetting)
            }
            required={inputSetting.required}
            hasError={form[setting.key].hasError}
            min={inputSetting.min}
            max={inputSetting.max}
            step={inputSetting.step}
          />
        );
      case PluginSettingType.CHECKBOX:
        const checkboxSetting = setting as CheckboxSetting;
        return (
          <CheckboxComponent
            key={`${checkboxSetting.type}-${index}`}
            checked={form[setting.key].value}
            onChange={(newValue) =>
              updateFormValue(setting.key, newValue, checkboxSetting)
            }
            title={checkboxSetting.label}
            skipTranslation={true}
            hint={checkboxSetting.hint}
            skipHintTranslation={true}
          />
        );
      case PluginSettingType.DROPDOWN:
        const dropdownSetting = setting as DropdownSetting;
        return (
          <div
            className={`select-container ${
              form[setting.key].hasError ? 'has-error' : ''
            }`}
            key={`${dropdownSetting.type}-${index}`}>
            <div className="title">
              {dropdownSetting.label} {dropdownSetting.required ? '*' : ''}
            </div>
            <Select
              values={[form[setting.key].value]}
              options={dropdownSetting.data}
              onChange={(newValue) =>
                updateFormValue(setting.key, newValue[0], dropdownSetting)
              }
              className="select-dropdown"
            />
          </div>
        );
    }
  };

  const save = async () => {
    let hasError = false;
    setGeneralSectionHasError(false);
    setUserSectionHasError(false);
    let newForm = { ...form };
    for (const formKey of Object.keys(form)) {
      let isFieldSectionGeneral = true;
      let s = pluginInfo?.definition.generalSettings.find(
        (s) => s.key === formKey,
      );
      if (!s) {
        isFieldSectionGeneral = false;
        s = pluginInfo?.definition.userSettings.find((s) => s.key === formKey);
      }
      if (
        s?.required &&
        (newForm[formKey].value === null ||
          newForm[formKey].value === null ||
          newForm[formKey].value === '')
      ) {
        newForm = {
          ...newForm,
          [formKey]: {
            value: newForm[formKey].value,
            hasError: true,
          },
        };
        if (isFieldSectionGeneral) {
          setGeneralSectionHasError(true);
        } else {
          setUserSectionHasError(true);
        }
        hasError = true;
        continue;
      }
    }

    if (hasError) {
      setForm(newForm);
      setErrorMessage('popup_accounts_fill');
      return;
    } else {
      sendFormToPlugin(newForm);
    }
  };

  const sendFormToPlugin = (form: any) => {
    const finalForm = { userSettings: {}, generalSettings: {} };
    const generalSettings: any = {};
    if (pluginInfo?.definition?.generalSettings) {
      for (const setting of pluginInfo?.definition?.generalSettings) {
        generalSettings[setting.key] = form[setting.key].value;
      }
    }
    finalForm.generalSettings = generalSettings;
    let userSettings: any = pluginInfo?.data.userSettings;
    if (pluginInfo?.definition?.userSettings) {
      for (const setting of pluginInfo?.definition?.userSettings) {
        if (!userSettings) {
          userSettings = {};
        }
        if (!userSettings[activeAccount.name!]) {
          userSettings[activeAccount.name!] = {};
        }
        userSettings[activeAccount.name!][setting.key] =
          form[setting.key].value;
      }
    }
    finalForm.userSettings = userSettings;

    chrome.runtime.sendMessage(
      plugin.extensionId,
      { command: PluginMessage.SAVE_PLUGIN_DATA, value: finalForm },
      (response) => {
        if (response === PluginMessage.ACK_PLUGIN_DATA_SAVED) {
          setSuccessMessage('popup_html_plugin_data_saved_success');
        } else {
          setErrorMessage('popup_html_plugin_data_saved_fail');
        }
      },
    );
  };

  return (
    <div className="plugin-details-page">
      {pluginInfo && pluginInfo.definition && (
        <div className="description">{pluginInfo.definition.description}</div>
      )}
      {form && (
        <>
          <div className="form">
            <Tabs>
              <TabList>
                <Tab>
                  <span>
                    {chrome.i18n.getMessage(
                      'popup_html_plugin_general_settings',
                    )}
                  </span>
                  {generalSectionHasError && (
                    <Icon type={IconType.OUTLINED} name={Icons.ERROR} />
                  )}
                </Tab>
                <Tab>
                  <span>
                    {chrome.i18n.getMessage('popup_html_plugin_user_settings')}
                  </span>
                  {userSectionHasError && (
                    <Icon type={IconType.OUTLINED} name={Icons.ERROR} />
                  )}
                </Tab>
              </TabList>
              <TabPanel>
                <div className="general-settings">
                  <div className="form-container">
                    {pluginInfo?.definition.generalSettings.map(
                      (setting, index) => getInput(setting, index),
                    )}
                  </div>
                </div>
              </TabPanel>
              <TabPanel>
                <div className="user-settings">
                  <SelectAccountSectionComponent></SelectAccountSectionComponent>
                  <div className="form-container">
                    {pluginInfo?.definition.userSettings.map((setting, index) =>
                      getInput(setting, index),
                    )}
                  </div>
                </div>
              </TabPanel>
            </Tabs>
          </div>
          <ButtonComponent
            label="popup_html_save"
            fixToBottom
            onClick={() => save()}
          />
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    plugin: state.navigation.params?.plugin as Extension,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setErrorMessage,
  setSuccessMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;
export const PluginDetailsPageComponent = connector(PluginDetailsPage);
