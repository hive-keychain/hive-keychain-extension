import type { OperationName, VirtualOperationName } from '@hiveio/dhive';
import moment from 'moment';

export type NotificationOperationName = OperationName | VirtualOperationName;

export type NotificationConfig = NotificationConfigItem[];

export const NOTIFICATION_PUSH_EXTENSION_NAME = 'pushNotification';

export interface NotificationConfigExtension {
  name: string;
  value: boolean;
}

export interface NotificationConfigItem {
  operation: OperationName | VirtualOperationName;
  conditions?: NotificationConfigConditions;
  extensions?: NotificationConfigExtension[];
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
  pushNotification: boolean;
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
  /** PeakD operation name (e.g. transfer, vote). */
  operation?: string;
  message: string;
  messageParams: string[];
  linkLabel?: string;
  linkUrl?: string;
  txUrl?: string;
  createdAt: moment.Moment;
  read: boolean;
  externalUrl?: string;
}
