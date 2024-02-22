import { OperationName, VirtualOperationName } from '@hiveio/dhive';

export type NotificationOperationName = OperationName | VirtualOperationName;

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
  // id: number;
  operation: NotificationOperationName;
  conditions: NotificationConfigFormCondition[];
}

export interface NotificationConfigFormCondition {
  // id: number;
  field: string;
  operand: string;
  value: string;
}

export enum ConfigFormUpdateAction {
  DELETE_CRITERIA = 'DELETE_CRITERIA',
  ADD_NEW_CONDITION = 'ADD_NEW_CONDITION',
  DELETE_CONDITION = 'DELETE_CONDITION',
  UPDATE_DATA = 'UPDATE_DATA',
}
