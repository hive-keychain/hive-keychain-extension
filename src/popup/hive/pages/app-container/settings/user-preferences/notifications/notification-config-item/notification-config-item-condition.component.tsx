import {
  NotificationConfigForm,
  NotificationConfigFormCondition,
  NotificationConfigFormItem,
} from '@interfaces/peakd-notifications.interface';
import { NotificationsUtils } from '@popup/hive/utils/notifications.utils';
import React, { useEffect, useState } from 'react';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';

interface Props {
  configForm: NotificationConfigForm;
  configFormItem: NotificationConfigFormItem;
  configFormItemCondition: NotificationConfigFormCondition;
  updateConfig: Function;
}

export const NotificationConfigItemConditionComponent = ({
  updateConfig,
  configForm,
  configFormItem,
  configFormItemCondition,
}: Props) => {
  const [conditionSelectOptions, setConditionSelectOptions] = useState<
    OptionItem[]
  >([]);
  const [operandSelectOptions, setOperandSelectOptions] = useState<
    OptionItem[]
  >([]);

  useEffect(() => {
    initSelectOptions();
    initOperandSelectOptions();
  }, []);

  const initSelectOptions = () => {
    const options = [];
    const fields = NotificationsUtils.operationFieldList.find(
      (operationField) => operationField.name === configFormItem.operation,
    );
    if (fields) {
      for (const field of fields?.fields) {
        options.push({
          label: field,
          value: field,
          canDelete: false,
        });
      }
      setConditionSelectOptions(options);
    }
  };

  const initOperandSelectOptions = () => {
    const options = [];
    const fields = NotificationsUtils.operationFieldList.find(
      (operationField) => operationField.name === configFormItem.operation,
    );
    if (fields) {
      for (const field of NotificationsUtils.operandList) {
        options.push({
          label: field,
          value: field,
          canDelete: false,
        });
      }
      setOperandSelectOptions(options);
    }
  };

  return (
    <div className="condition-configuration">
      <ComplexeCustomSelect
        options={conditionSelectOptions}
        selectedItem={
          {
            label: configFormItemCondition.field,
            value: configFormItemCondition.field,
            canDelete: false,
          } as OptionItem
        }
        setSelectedItem={(item) =>
          updateConfig(configFormItem.id, configFormItemCondition.id, {
            field: item.value,
          })
        }
      />
      {
        <>
          <ComplexeCustomSelect
            options={operandSelectOptions}
            selectedItem={
              {
                value: configFormItemCondition.operand,
                label: configFormItemCondition.operand,
                canDelete: false,
              } as OptionItem
            }
            setSelectedItem={(item) =>
              updateConfig(configFormItem.id, configFormItemCondition.id, {
                operand: item.value,
              })
            }
          />

          <InputComponent
            type={InputType.TEXT}
            value={configFormItemCondition.value}
            onChange={(value) =>
              updateConfig(configFormItem.id, configFormItemCondition.id, {
                value: value,
              })
            }
          />
        </>
      }
    </div>
  );
};
