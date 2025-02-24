import type { OperationName, VirtualOperationName } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Message } from '@interfaces/message.interface';
import {
  ConfigFormUpdateAction,
  NotificationConfig,
  NotificationConfigForm,
  NotificationConfigFormCondition,
  NotificationConfigItem,
} from '@interfaces/notifications.interface';
import { NotificationConfigItemComponent } from '@popup/hive/pages/app-container/settings/user-preferences/notifications/notification-config-item/notification-config-item.component';
import AccountUtils from '@popup/hive/utils/account.utils';
import MkUtils from '@popup/hive/utils/mk.utils';
import { PeakDNotificationsUtils } from '@popup/hive/utils/notifications/peakd-notifications.utils';
import { Theme } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { MessageType } from '@reference-data/message-type.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useRef, useState } from 'react';
import { BackToTopButton } from 'src/common-ui/back-to-top-button/back-to-top-button.component';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
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
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { MessageContainerComponent } from 'src/common-ui/message-container/message-container.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const NotificationsAdvancedConfigPage = () => {
  const [isActive, setActive] = useState(false);
  const [config, setConfig] = useState<NotificationConfig>();

  const [configForm, setConfigForm] = useState<NotificationConfigForm>();

  const [newCriteria, setNewCriteria] = useState('');

  const [theme, setTheme] = useState<Theme>();

  const [accountSelectOption, setAccountSelectOption] =
    useState<OptionItem[]>();
  const [selectedAccount, setSelectedAccount] = useState<LocalAccount>();

  const [ready, setReady] = useState(false);

  const [message, setMessage] = useState<Message>();

  const bottomFormFields = useRef<HTMLDivElement>(null);
  const topFormFields = useRef<HTMLDivElement>(null);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (selectedAccount && selectedAccount.name)
      initConfig(selectedAccount?.name);
  }, [selectedAccount]);

  const init = async () => {
    const { ACTIVE_THEME, active_account_name } =
      await LocalStorageUtils.getMultipleValueFromLocalStorage([
        LocalStorageKeyEnum.ACTIVE_THEME,
        LocalStorageKeyEnum.ACTIVE_ACCOUNT_NAME,
      ]);

    setTheme(ACTIVE_THEME ?? Theme.LIGHT);

    await initSelectOptions(active_account_name);
  };

  const initConfig = async (active_account_name: string) => {
    const userConfig = await PeakDNotificationsUtils.getAccountConfig(
      active_account_name,
    );

    let conf: NotificationConfig = [];
    if (userConfig) {
      conf = userConfig.config.filter(
        (item: NotificationConfigItem) => item.operation,
      );
    }

    setConfig(conf);
    const form = PeakDNotificationsUtils.initializeForm(conf);
    setConfigForm([...form]);

    setActive(!!userConfig);
  };

  const initSelectOptions = async (activeUsername: string) => {
    const mk = await MkUtils.getMkFromLocalStorage();
    if (!mk) {
    } else {
      const accounts = await AccountUtils.getAccountsFromLocalStorage(mk);
      const options = [];
      for (const account of accounts) {
        options.push({
          label: account.name,
          value: account,
          canDelete: false,
          img: `https://images.hive.blog/u/${account.name}/avatar`,
        } as OptionItem);
      }
      setAccountSelectOption(options);
      setSelectedAccount(accounts.find((a) => a.name === activeUsername));
      setReady(true);
    }
  };

  const resetForm = () => {
    init();
  };

  const updateConfigForm = (
    itemIndex: number,
    conditionIndex: number,
    data: Partial<NotificationConfigFormCondition>,
    action: ConfigFormUpdateAction,
  ) => {
    if (configForm) {
      let newForm: NotificationConfigForm = [...configForm];
      switch (action) {
        case ConfigFormUpdateAction.ADD_NEW_CONDITION:
          newForm[itemIndex].conditions.push(
            data as NotificationConfigFormCondition,
          );
          break;
        case ConfigFormUpdateAction.DELETE_CONDITION: {
          newForm[itemIndex].conditions.splice(conditionIndex, 1);
          break;
        }
        case ConfigFormUpdateAction.DELETE_CRITERIA: {
          newForm.splice(itemIndex, 1);
          break;
        }
        case ConfigFormUpdateAction.UPDATE_DATA: {
          newForm[itemIndex].conditions[conditionIndex] = {
            ...newForm[itemIndex].conditions[conditionIndex],
            ...data,
          };
          break;
        }
      }
      setConfigForm(newForm);
    }
  };

  const addNewCriteria = () => {
    if (newCriteria.length > 0 && configForm) {
      const newConfig: NotificationConfigForm = [...configForm];
      newConfig.push({
        conditions: [{ field: '', operand: '', value: '' }],
        operation: newCriteria as OperationName | VirtualOperationName,
      });
      setConfigForm(newConfig);
      setNewCriteria('');
      bottomFormFields.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const saveConfig = async () => {
    if (window.confirm(chrome.i18n.getMessage('notification_confirm_save')))
      if (selectedAccount?.keys.posting) {
        setReady(false);
        const response = await PeakDNotificationsUtils.saveConfiguration(
          configForm!,
          selectedAccount!,
        );
        if (response?.tx_id) {
          setMessage({
            key: 'notification_account_update',
            params: [selectedAccount.name],
            type: MessageType.SUCCESS,
          } as Message);
        } else {
          setMessage({
            key: 'bgd_ops_error_broadcasting',
            type: MessageType.ERROR,
          } as Message);
        }
        setReady(true);
      } else {
        setMessage({
          key: 'popup_missing_key',
          params: [chrome.i18n.getMessage('posting')],
          type: MessageType.ERROR,
        } as Message);
      }
  };

  const clearConfig = async () => {
    setConfigForm([]);
  };

  const setDefaultConfig = () => {
    setConfigForm(
      PeakDNotificationsUtils.getSuggestedConfig(selectedAccount!.name),
    );
  };
  const setAll = () => {
    if (configForm) {
      const newConfig: NotificationConfigForm = [...configForm];
      for (const criteria of PeakDNotificationsUtils.operationFieldList.map(
        (field) => field.name,
      )) {
        newConfig.push({
          conditions: [{ field: '', operand: '', value: '' }],
          operation: criteria as OperationName | VirtualOperationName,
        });
      }
      setConfigForm(newConfig);
    }
  };

  return (
    <div className={`theme ${theme} notifications-config-page-main-container`}>
      {ready && (
        <div
          data-testid={`${Screen.SETTINGS_NOTIFICATIONS_CONFIGURATION}-page`}
          className={`notifications-config-page`}>
          <div className="title-panel">
            <SVGIcon icon={SVGIcons.KEYCHAIN_LOGO_ROUND_SMALL} />
            <div className="title">
              {chrome.i18n.getMessage('html_popup_settings_notifications')}
            </div>
          </div>
          <div className="caption">
            {chrome.i18n.getMessage(
              'html_popup_settings_notifications_caption',
            )}
          </div>

          {accountSelectOption && (
            <ComplexeCustomSelect
              options={accountSelectOption}
              selectedItem={
                {
                  label: `@${selectedAccount?.name}`,
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
              title="html_popup_settings_notifications_activated"
            />
          </div>
          {isActive && (
            <div className="config-buttons-panel">
              <ButtonComponent
                additionalClass="default-config-button"
                label="notification_settings_select_all"
                onClick={setAll}
                type={ButtonType.ALTERNATIVE}
                height="small"
              />
              <ButtonComponent
                additionalClass="clear-config-button"
                label="notification_clear_config"
                onClick={clearConfig}
                type={ButtonType.ALTERNATIVE}
                height="small"
              />
              <ButtonComponent
                additionalClass="default-config-button"
                label="html_popup_notification_default_config"
                onClick={setDefaultConfig}
                type={ButtonType.ALTERNATIVE}
                height="small"
              />
            </div>
          )}

          {isActive && (
            <FormContainer onSubmit={saveConfig}>
              <div className="add-panel">
                <InputComponent
                  onChange={setNewCriteria}
                  value={newCriteria}
                  type={InputType.TEXT}
                  autocompleteValues={PeakDNotificationsUtils.operationFieldList.map(
                    (field) => field.name,
                  )}
                />
                <div className="add-button" onClick={addNewCriteria}>
                  <SVGIcon icon={SVGIcons.NOTIFICATIONS_ADD} />
                </div>
              </div>
              <div className="form-fields" ref={topFormFields}>
                {configForm?.map((configFormItem, configFormItemIndex) => {
                  return (
                    <React.Fragment key={`config-item-${configFormItemIndex}`}>
                      <NotificationConfigItemComponent
                        configForm={configForm}
                        configFormItem={configFormItem}
                        updateConfig={updateConfigForm}
                        configFormItemIndex={configFormItemIndex}
                      />
                      {configFormItemIndex !== configForm.length - 1 && (
                        <Separator type={'horizontal'} fullSize />
                      )}
                    </React.Fragment>
                  );
                })}
                <div ref={bottomFormFields}></div>
                <BackToTopButton element={topFormFields} />
              </div>
            </FormContainer>
          )}
          {!isActive && <div className="fill-space"></div>}
          <div className="buttons-panel">
            <ButtonComponent
              label="html_popup_reset_form"
              onClick={resetForm}
              height="small"
              type={ButtonType.ALTERNATIVE}
            />
            <ButtonComponent
              label="popup_html_save"
              onClick={saveConfig}
              height="small"
            />
          </div>
        </div>
      )}
      {!ready && <LoadingComponent />}
      {message && (
        <MessageContainerComponent
          message={message}
          onResetMessage={() => setMessage(undefined)}
        />
      )}
    </div>
  );
};

export const NotificationsAdvancedConfig = NotificationsAdvancedConfigPage;
