import {
  NotificationConfig,
  NotificationConfigForm,
  NotificationConfigItem,
} from '@interfaces/peakd-notifications.interface';
import { NotificationConfigItemComponent } from '@popup/hive/pages/app-container/settings/user-preferences/notifications/notification-config-item/notification-config-item.component';
import AccountUtils from '@popup/hive/utils/account.utils';
import MkUtils from '@popup/hive/utils/mk.utils';
import { NotificationsUtils } from '@popup/hive/utils/notifications.utils';
import { Theme } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import {
  BackgroundType,
  CheckboxPanelComponent,
} from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const NotificationConfigPage = () => {
  const [isActive, setActive] = useState(false);
  const [config, setConfig] = useState<NotificationConfig>();

  const [configForm, setConfigForm] = useState<NotificationConfigForm>();

  const [newCriteria, setNewCriteria] = useState('');

  const [theme, setTheme] = useState<Theme>();

  const [accountSelectOption, setAccountSelectOption] =
    useState<OptionItem[]>();
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const res = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.ACTIVE_THEME,
    ]);

    setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);

    await initSelectOptions();
    const defaultAccount = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.ACTIVE_ACCOUNT_NAME,
    );
    setSelectedAccount(defaultAccount);

    const userConfig = await NotificationsUtils.getAccountConfig('muwave');

    const conf: NotificationConfig = userConfig.config.filter(
      (item: NotificationConfigItem) => item.operation,
    );

    setConfig(conf);
    setConfigForm(NotificationsUtils.initializeForm(conf));

    setActive(true);
  };

  const initSelectOptions = async () => {
    const mk = await MkUtils.getMkFromLocalStorage();
    if (!mk) {
    } else {
      const accounts = await AccountUtils.getAccountsFromLocalStorage(mk);
      const options = [];
      for (const account of accounts) {
        options.push({
          label: account.name,
          value: account.name,
          canDelete: false,
          img: `https://images.hive.blog/u/${account.name}/avatar`,
        } as OptionItem);
      }
      setAccountSelectOption(options);
    }
  };

  const updateConfigForm = (
    itemId: number,
    conditionId: number,
    data: {updatedField: string, newValue: string},
  ) => {
    const newForm = {...configForm};
    const item = newForm.find((i) => i.id === itemId);
    const test = newForm[itemId].conditions[conditionId];
    newForm[itemId].conditions?[conditionId][data.updatedField] = newValue;
  };

  const addNewCriteria = () => {};

  const saveConfig = () => {};

  return (
    <div className={`theme ${theme} notifications-config-page-main-container`}>
      <div
        data-testid={`${Screen.SETTINGS_NOTIFICATIONS}-page`}
        className={`notifications-config-page`}>
        <div className="title-panel">
          <SVGIcon icon={SVGIcons.KEYCHAIN_LOGO_ROUND_SMALL} />
          <div className="title">
            {chrome.i18n.getMessage('html_popup_settings_notifications')}
          </div>
        </div>
        <div className="caption">
          {chrome.i18n.getMessage('html_popup_settings_notifications_caption')}
        </div>

        {accountSelectOption && (
          <ComplexeCustomSelect
            options={accountSelectOption}
            selectedItem={
              {
                label: `@${selectedAccount}`,
                value: selectedAccount,
              } as OptionItem
            }
            setSelectedItem={(item) => setSelectedAccount(item.value)}
          />
        )}

        <div className="active-panel">
          <CheckboxPanelComponent
            checked={isActive}
            onChange={setActive}
            backgroundType={BackgroundType.FILLED}
            title="html_popup_settings_notifications_active"
          />
        </div>

        {isActive && (
          <FormContainer onSubmit={saveConfig}>
            <div className="form-fields">
              <div className="add-panel">
                <InputComponent
                  onChange={setNewCriteria}
                  value={newCriteria}
                  type={InputType.TEXT}
                  autocompleteValues={NotificationsUtils.operationFieldList.map(
                    (field) => field.name,
                  )}
                />
                <div className="add-button">
                  <SVGIcon
                    icon={SVGIcons.NOTIFICATIONS_ADD}
                    onClick={addNewCriteria}
                  />
                </div>
              </div>
              {configForm?.map((configFormItem, index) => {
                return (
                  <React.Fragment key={`config-item-${index}`}>
                    <NotificationConfigItemComponent
                      configForm={configForm}
                      configFormItem={configFormItem}
                      updateConfig={updateConfigForm}
                    />
                    {index !==
                      NotificationsUtils.defaultActiveSubs.length - 1 && (
                      <Separator type={'horizontal'} fullSize />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <ButtonComponent
              label="popup_html_save"
              onClick={saveConfig}
              height="small"
            />
          </FormContainer>
        )}
      </div>
    </div>
  );
};

export const NotificationsConfigComponent = NotificationConfigPage;
