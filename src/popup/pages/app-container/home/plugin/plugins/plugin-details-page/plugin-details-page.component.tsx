import { setErrorMessage } from '@popup/actions/message.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
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
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import Select from 'react-dropdown-select';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PluginsUtils } from 'src/utils/plugins.utils';
import './plugin-details-page.component.scss';

const PluginDetailsPage = ({
  plugin,
  setTitleContainerProperties,
  setErrorMessage,
}: PropsFromRedux) => {
  const [pluginInfo, setPluginInfo] = useState<Plugin>();

  const [form, setForm] = useState<any>();

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
    console.log(pluginInfo);
    if (pluginInfo.definition.userSettings) {
      for (const field of pluginInfo.definition?.userSettings) {
        const savedData = pluginInfo.data[field.key];
        fields = {
          ...fields,
          [field.key]: {
            value: savedData ? savedData : getDefaultValue(field),
            hasError: false,
          },
        };
      }
    }
    if (pluginInfo.definition?.generalSettings) {
      for (const field of pluginInfo.definition?.generalSettings) {
        const savedData = pluginInfo.data[field.key];
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

  const getDefaultValue = (field: PluginSetting) => {
    if (field.defaultValue) return field.defaultValue;
    else {
      if (field.type === PluginSettingType.CHECKBOX) return false;
      else return '';
    }
  };

  const updateFormValue = (key: string, value: any, field: PluginSetting) => {
    const hasError = field.required && (!value || value === '');
    setForm({
      ...form,
      [key]: {
        value: value,
        hasError: hasError,
      },
    });
  };

  const initPluginInfo = async () => {
    setPluginInfo(await PluginsUtils.getPluginInfo(plugin));
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
            placeholder={inputSetting.placeholder}
            hint={inputSetting.hint}
            skipHintTranslation={true}
            skipTranslation={true}
            value={form[setting.key].value}
            onChange={(newValue) =>
              updateFormValue(setting.key, newValue, inputSetting)
            }
            required={inputSetting.required}
            hasError={form[setting.key].hasError}
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
            title={checkboxSetting.title}
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
              {dropdownSetting.title} {dropdownSetting.required ? '*' : ''}
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

  useEffect(() => console.log(form), [form]);

  const save = async () => {
    let hasError = false;
    let newForm = { ...form };
    for (const formKey of Object.keys(form)) {
      let s = pluginInfo?.definition.generalSettings.find(
        (s) => s.key === formKey,
      );
      if (!s) {
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
    const finalForm: any = {};
    for (const key in form) {
      finalForm[key] = form[key].value;
    }
    chrome.runtime.sendMessage(
      plugin.extensionId,
      { command: PluginMessage.SAVE_PLUGIN_DATA, value: finalForm },
      (response) => {
        console.log(response);
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
          <div className="general-settings">
            <div className="title">
              {chrome.i18n.getMessage('popup_html_plugin_general_settings')}
            </div>
            <div className="form-container">
              {pluginInfo?.definition.generalSettings.map((setting, index) =>
                getInput(setting, index),
              )}
            </div>
          </div>
          <div className="user-settings">
            <div className="title">
              {chrome.i18n.getMessage('popup_html_plugin_user_settings')}
            </div>
            <div className="form-container">
              {pluginInfo?.definition.userSettings.map((setting, index) =>
                getInput(setting, index),
              )}
            </div>
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;
export const PluginDetailsPageComponent = connector(PluginDetailsPage);
