import {
  NotificationConfigForm,
  NotificationConfigFormCondition,
  NotificationConfigFormItem,
} from '@interfaces/peakd-notifications.interface';
import { NotificationConfigItemConditionComponent } from '@popup/hive/pages/app-container/settings/user-preferences/notifications/notification-config-item/notification-config-item-condition.component';
import React, { BaseSyntheticEvent, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface Props {
  updateConfig: Function;
  configForm: NotificationConfigForm;
  configFormItem: NotificationConfigFormItem;
}

export const NotificationConfigItemComponent = ({
  configForm,
  configFormItem,
  updateConfig,
}: Props) => {
  const [isOpen, setOpen] = useState<boolean>(false);

  const addNewCondition = (event: BaseSyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const newId = Math.max(
      ...configForm[configFormItem.id].conditions.map((c) => c.id),
    );
    updateConfig(configFormItem.id, null, {
      id: newId + 1,
      field: '',
      operand: '',
      value: '',
    });
    if (!isOpen) setOpen(true);
  };

  const deleteCondition = (condition: NotificationConfigFormCondition) => {
    updateConfig(configFormItem.id, condition.id, null);
  };

  return (
    <div className="criteria">
      <div className="operation-panel">
        <div>{configFormItem.operation}</div>
        <SVGIcon
          icon={SVGIcons.GLOBAL_EXPAND_COLLAPSE}
          className={`expand-detail-icon ${isOpen ? 'open' : 'closed'}`}
          onClick={() => setOpen(!isOpen)}
        />
      </div>

      {configFormItem && isOpen && (
        <div className="conditions" key={configFormItem.operation}>
          {configFormItem.conditions &&
            configFormItem.conditions.map((configFormItemCondition) => (
              <div
                className="condition-row"
                key={`item-condition-${configFormItemCondition.field}-${configFormItemCondition.id}`}>
                <NotificationConfigItemConditionComponent
                  configForm={configForm}
                  configFormItem={configFormItem}
                  configFormItemCondition={configFormItemCondition}
                  updateConfig={updateConfig}
                />
                {
                  <SVGIcon
                    icon={SVGIcons.GLOBAL_DELETE}
                    onClick={() => deleteCondition(configFormItemCondition)}
                  />
                }
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
