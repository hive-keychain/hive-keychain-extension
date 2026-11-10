import {
  ConfigFormUpdateAction,
  NotificationConfigForm,
  NotificationConfigFormItem,
} from '@interfaces/notifications.interface';
import { NotificationConfigItemConditionComponent } from '@popup/hive/pages/app-container/settings/user-preferences/notifications/notification-config-item/notification-config-item-condition.component';
import { HiveNotificationOperationLabelUtils } from '@popup/hive/utils/notifications/hive-notification-operation-label.utils';
import React, { useEffect, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox/checkbox.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { I18nUtils } from 'src/utils/i18n.utils';

interface Props {
  updateConfig: Function;
  configForm: NotificationConfigForm;
  configFormItem: NotificationConfigFormItem;
  configFormItemIndex: number;
  pushNotification?: boolean;
  onPushNotificationChange?: (value: boolean) => void;
  forceOpen?: boolean;
}

export const NotificationConfigItemComponent = ({
  configForm,
  configFormItem,
  updateConfig,
  configFormItemIndex,
  pushNotification,
  onPushNotificationChange,
  forceOpen = false,
}: Props) => {
  const [isOpen, setOpen] = useState<boolean>(forceOpen);
  const conditionsId = `notification-criteria-${configFormItemIndex}-conditions`;
  const operation = configFormItem.operation;
  const showPushToggle =
    pushNotification !== undefined && !!onPushNotificationChange;

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
    }
  }, [forceOpen]);

  const addNewCondition = () => {
    updateConfig(
      configFormItemIndex,
      null,
      {
        field: '',
        operand: '',
        value: '',
      },
      ConfigFormUpdateAction.ADD_NEW_CONDITION,
    );
    if (!isOpen) setOpen(true);
  };

  const deleteCondition = (conditionIndex: number) => {
    updateConfig(
      configFormItemIndex,
      conditionIndex,
      null,
      ConfigFormUpdateAction.DELETE_CONDITION,
    );
  };

  const deleteCriteria = (index: number) => {
    updateConfig(index, null, null, ConfigFormUpdateAction.DELETE_CRITERIA);
  };

  return (
    <div className="criteria">
      <div
        className="criteria-header"
        data-testid={
          showPushToggle
            ? `notification-channel-pref-${operation}`
            : undefined
        }>
        <button
          type="button"
          className="operation-panel"
          aria-expanded={isOpen}
          aria-controls={conditionsId}
          onClick={() => setOpen(!isOpen)}>
          <div>
            {HiveNotificationOperationLabelUtils.formatNotificationOperationLabel(
              operation,
            )}
          </div>
          <SVGIcon
            icon={SVGIcons.GLOBAL_EXPAND_COLLAPSE}
            className={`expand-detail-icon ${isOpen ? 'open' : 'closed'}`}
          />
        </button>
        {showPushToggle && (
          <div className="channel-toggles">
            <CheckboxComponent
              dataTestId={`notification-channel-browser-${operation}`}
              checked={pushNotification}
              onChange={onPushNotificationChange}
              title="html_popup_settings_notifications_channel_browser"
              ariaLabel={I18nUtils.getMessage(
                'html_popup_settings_notifications_channel_browser',
              )}
              tooltipMessage="html_popup_settings_notifications_channel_browser_tooltip"
            />
          </div>
        )}
      </div>

      {configFormItem && isOpen && (
        <div
          id={conditionsId}
          className="conditions"
          key={operation}>
          {configFormItem.conditions &&
            configFormItem.conditions.map(
              (configFormItemCondition, configFormItemConditionIndex) => (
                <div
                  className="condition-row"
                  key={`item-condition-${configFormItemCondition.field}-${configFormItemConditionIndex}`}>
                  <NotificationConfigItemConditionComponent
                    configForm={configForm}
                    configFormItem={configFormItem}
                    configFormItemCondition={configFormItemCondition}
                    updateConfig={updateConfig}
                    configFormItemIndex={configFormItemIndex}
                    configFormItemConditionIndex={configFormItemConditionIndex}
                  />
                  {
                    <SVGIcon
                      icon={SVGIcons.GLOBAL_DELETE}
                      ariaLabel={`${I18nUtils.getMessage(
                        'html_popup_delete_condition',
                      )} ${configFormItemConditionIndex + 1}`}
                      onClick={() =>
                        deleteCondition(configFormItemConditionIndex)
                      }
                    />
                  }
                </div>
              ),
            )}

          <div className="criteria-button-panel">
            <ButtonComponent
              additionalClass="new-condition-button"
              label="html_popup_add_new_condition"
              onClick={() => addNewCondition()}
              height="small"
              type={ButtonType.ALTERNATIVE}
            />
            <ButtonComponent
              additionalClass="delete-criteria-button"
              label="html_popup_delete_criteria"
              onClick={() => deleteCriteria(configFormItemIndex)}
              height="small"
              type={ButtonType.IMPORTANT}
            />
          </div>
        </div>
      )}
    </div>
  );
};
