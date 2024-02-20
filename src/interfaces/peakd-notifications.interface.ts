import { OperationName, VirtualOperationName } from '@hiveio/dhive';

export type NotificationConfig = NotificationConfigItem[];

export interface NotificationConfigItem {
  operation: OperationName | VirtualOperationName;
  conditions?: NotificationConfigConditions;
}

export interface NotificationConfigConditions {
  [field: string]: {
    [operand: string]: string;
  };
}

export type NotificationConfigForm = NotificationConfigFormItem[];

export interface NotificationConfigFormItem {
  id: number;
  operation: OperationName | VirtualOperationName;
  conditions: NotificationConfigFormCondition[];
}

export interface NotificationConfigFormCondition {
  id: number;
  field: string;
  operand: string;
  value: string;
}
