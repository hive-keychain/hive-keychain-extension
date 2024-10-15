import { OperationName, VirtualOperationName } from '@hiveio/dhive';
import moment from 'moment';

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
  operation: NotificationOperationName;
  conditions: NotificationConfigFormCondition[];
}

export interface NotificationConfigFormCondition {
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

export enum NotificationType {
  PEAKD = 'PEAKD',
}

export interface Notification {
  type: NotificationType;
  isTypeLast: boolean;
  id: string;
  message: string;
  messageParams: string[];
  txUrl?: string;
  createdAt: moment.Moment;
  read: boolean;
  externalUrl?: string;
}
