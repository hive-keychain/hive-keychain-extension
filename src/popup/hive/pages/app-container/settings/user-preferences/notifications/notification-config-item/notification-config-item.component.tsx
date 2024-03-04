import {
  ConfigFormUpdateAction,
  NotificationConfigForm,
  NotificationConfigFormItem,
} from '@interfaces/notifications.interface';
import { NotificationConfigItemConditionComponent } from '@popup/hive/pages/app-container/settings/user-preferences/notifications/notification-config-item/notification-config-item-condition.component';
import React, { useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface Props {
  updateConfig: Function;
  configForm: NotificationConfigForm;
  configFormItem: NotificationConfigFormItem;
  configFormItemIndex: number;
}

export const NotificationConfigItemComponent = ({
  configForm,
  configFormItem,
  updateConfig,
  configFormItemIndex,
}: Props) => {
  const [isOpen, setOpen] = useState<boolean>(false);

  const addNewCondition = () => {
    // const newId = Math.max(
    //   ...configForm[configFormItemIndex].conditions.map((c) => c.id),
    // );
    updateConfig(
      configFormItemIndex,
      null,
      {
        // id: newId + 1,
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
      <div className="operation-panel" onClick={() => setOpen(!isOpen)}>
        <div>{configFormItem.operation}</div>
        <SVGIcon
          icon={SVGIcons.GLOBAL_EXPAND_COLLAPSE}
          className={`expand-detail-icon ${isOpen ? 'open' : 'closed'}`}
        />
      </div>

      {configFormItem && isOpen && (
        <div className="conditions" key={configFormItem.operation}>
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
