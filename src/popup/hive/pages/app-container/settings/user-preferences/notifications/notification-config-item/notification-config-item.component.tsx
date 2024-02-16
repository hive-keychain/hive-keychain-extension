import {
  NotificationConfigForm,
  NotificationConfigFormItem,
} from '@interfaces/peakd-notifications.interface';
import { NotificationConfigItemConditionComponent } from '@popup/hive/pages/app-container/settings/user-preferences/notifications/notification-config-item/notification-config-item-condition.component';
import React, { useState } from 'react';
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
        <div className="field-row" key={configFormItem.operation}>
          {configFormItem.conditions &&
            configFormItem.conditions.map((configFormItemCondition) => (
              <NotificationConfigItemConditionComponent
                key={`item-condition-${configFormItemCondition.field}-${configFormItemCondition.id}`}
                configForm={configForm}
                configFormItem={configFormItem}
                configFormItemCondition={configFormItemCondition}
                updateConfig={updateConfig}
              />
            ))}
        </div>
      )}
    </div>
  );
};
