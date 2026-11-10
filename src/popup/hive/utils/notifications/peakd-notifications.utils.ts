import { PeakDNotificationsApi } from '@api/peakd-notifications';
import type { DynamicGlobalProperties } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { KeyType } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import {
  Notification,
  NotificationConfig,
  NotificationConfigConditions,
  NotificationConfigForm,
  NotificationConfigFormItem,
  NotificationConfigItem,
  NotificationOperationName,
  NotificationType,
  NOTIFICATION_PUSH_EXTENSION_NAME,
} from '@interfaces/notifications.interface';
import { CustomJsonUtils } from '@popup/hive/utils/custom-json.utils';
import { PeakDNotificationContentUtils } from '@popup/hive/utils/notifications/peakd-notification-content.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import moment from 'moment';

const operationFieldList = [
  // {
  //   name: 'account_create',
  //   fields: [
  //     'fee',
  //     'creator',
  //     'new_account_name',
  //     'owner',
  //     'active',
  //     'posting',
  //     'memo_key',
  //     'json_metadata',
  //   ],
  // },
  // {
  //   name: 'account_create_with_delegation',
  //   fields: [
  //     'fee',
  //     'delegation',
  //     'creator',
  //     'new_account_name',
  //     'owner',
  //     'active',
  //     'posting',
  //     'memo_key',
  //     'json_metadata',
  //     'extensions',
  //   ],
  // },
  {
    name: 'account_update',
    fields: [
      'account',
      'owner',
      'active',
      'posting',
      'memo_key',
      'json_metadata',
    ],
  },
  { name: 'account_witness_proxy', fields: ['account', 'proxy'] },
  {
    name: 'account_witness_vote',
    fields: ['account', 'witness', 'approve'],
  },
  // {
  //   name: 'cancel_transfer_from_savings',
  //   fields: ['from', 'request_id'],
  // },
  {
    name: 'change_recovery_account',
    fields: ['account_to_recover', 'new_recovery_account', 'extensions'],
  },
  // {
  //   name: 'claim_reward_balance',
  //   fields: ['account', 'reward_hive', 'reward_hbd', 'reward_vests'],
  // },
  { name: 'claim_account', fields: ['creator', 'fee', 'extensions'] },
  {
    name: 'comment',
    fields: [
      'parent_author',
      'parent_permlink',
      'author',
      'permlink',
      'title',
      'body',
      'json_metadata',
    ],
  },
  // {
  //   name: 'comment_options',
  //   fields: [
  //     'author',
  //     'permlink',
  //     'max_accepted_payout',
  //     'percent_hbd',
  //     'allow_votes',
  //     'allow_curation_rewards',
  //     'extensions',
  //   ],
  // },
  // { name: 'convert', fields: ['owner', 'requestid', 'amount'] },
  // {
  //   name: 'create_claimed_account',
  //   fields: [
  //     'creator',
  //     'new_account_name',
  //     'owner',
  //     'active',
  //     'posting',
  //     'memo_key',
  //     'json_metadata',
  //     'extensions',
  //   ],
  // },
  // { name: 'custom', fields: ['required_auths', 'id', 'data'] },
  // {
  //   name: 'custom_binary',
  //   fields: [
  //     'required_owner_auths',
  //     'required_active_auths',
  //     'required_posting_auths',
  //     'required_auths',
  //     'id',
  //     'data',
  //   ],
  // },
  {
    name: 'custom_json',
    fields: ['required_auths', 'required_posting_auths', 'id', 'json'],
  },
  // { name: 'decline_voting_rights', fields: ['account', 'decline'] },
  {
    name: 'delegate_vesting_shares',
    fields: ['delegator', 'delegatee', 'vesting_shares'],
  },
  // { name: 'delete_comment', fields: ['author', 'permlink'] },
  // {
  //   name: 'escrow_approve',
  //   fields: ['from', 'to', 'agent', 'who', 'escrow_id', 'approve'],
  // },
  // {
  //   name: 'escrow_dispute',
  //   fields: ['from', 'to', 'agent', 'who', 'escrow_id'],
  // },
  // {
  //   name: 'escrow_release',
  //   fields: [
  //     'from',
  //     'to',
  //     'agent',
  //     'who',
  //     'receiver',
  //     'escrow_id',
  //     'hbd_amount',
  //     'hive_amount',
  //   ],
  // },
  // {
  //   name: 'escrow_transfer',
  //   fields: [
  //     'from',
  //     'to',
  //     'agent',
  //     'escrow_id',
  //     'hbd_amount',
  //     'hive_amount',
  //     'fee',
  //     'ratification_deadline',
  //     'escrow_expiration',
  //     'json_meta',
  //   ],
  // },
  { name: 'feed_publish', fields: ['publisher', 'exchange_rate'] },
  // { name: 'limit_order_cancel', fields: ['owner', 'orderid'] },
  // {
  //   name: 'limit_order_create',
  //   fields: [
  //     'owner',
  //     'orderid',
  //     'amount_to_sell',
  //     'min_to_receive',
  //     'fill_or_kill',
  //     'expiration',
  //   ],
  // },
  // {
  //   name: 'limit_order_create2',
  //   fields: [
  //     'owner',
  //     'orderid',
  //     'amount_to_sell',
  //     'exchange_rate',
  //     'fill_or_kill',
  //     'expiration',
  //   ],
  // },
  // {
  //   name: 'pow',
  //   fields: ['worker_account', 'block_id', 'nonce', 'work', 'props'],
  // },
  // { name: 'pow2', fields: ['work', 'new_owner_key', 'props'] },
  {
    name: 'recover_account',
    fields: [
      'account_to_recover',
      'new_owner_authority',
      'recent_owner_authority',
      'extensions',
    ],
  },
  // {
  //   name: 'report_over_production',
  //   fields: ['reporter', 'first_block', 'second_block'],
  // },
  {
    name: 'request_account_recovery',
    fields: [
      'recovery_account',
      'account_to_recover',
      'new_owner_authority',
      'extensions',
    ],
  },
  // {
  //   name: 'reset_account',
  //   fields: ['reset_account', 'account_to_reset', 'new_owner_authority'],
  // },
  // {
  //   name: 'set_reset_account',
  //   fields: ['account', 'current_reset_account', 'reset_account'],
  // },
  {
    name: 'set_withdraw_vesting_route',
    fields: ['from_account', 'to_account', 'percent', 'auto_vest'],
  },
  { name: 'transfer', fields: ['from', 'to', 'amount', 'memo'] },
  {
    name: 'transfer_from_savings',
    fields: ['from', 'request_id', 'to', 'amount', 'memo'],
  },
  {
    name: 'transfer_to_savings',
    fields: ['amount', 'from', 'memo', 'request_id', 'to'],
  },
  { name: 'transfer_to_vesting', fields: ['from', 'to', 'amount'] },
  { name: 'vote', fields: ['voter', 'author', 'permlink', 'weight'] },
  { name: 'withdraw_vesting', fields: ['account', 'vesting_shares'] },
  // {
  //   name: 'witness_update',
  //   fields: ['owner', 'url', 'block_signing_key', 'props', 'fee'],
  // },
  // {
  //   name: 'witness_set_properties',
  //   fields: ['owner', 'props', 'extensions'],
  // },
  {
    name: 'account_update2',
    fields: [
      'account',
      'owner',
      'active',
      'posting',
      'memo_key',
      'json_metadata',
      'posting_json_metadata',
      'extensions',
    ],
  },
  // {
  //   name: 'create_proposal',
  //   fields: [
  //     'creator',
  //     'receiver',
  //     'start_date',
  //     'end_date',
  //     'daily_pay',
  //     'subject',
  //     'permlink',
  //     'extensions',
  //   ],
  // },
  // {
  //   name: 'update_proposal_votes',
  //   fields: ['voter', 'proposal_ids', 'approve', 'extensions'],
  // },
  // {
  //   name: 'remove_proposal',
  //   fields: ['proposal_owner', 'proposal_ids', 'extensions'],
  // },
  // {
  //   name: 'update_proposal',
  //   fields: [
  //     'proposal_id',
  //     'creator',
  //     'daily_pay',
  //     'subject',
  //     'permlink',
  //     'extensions',
  //   ],
  // },
  // {
  //   name: 'collateralized_convert',
  //   fields: ['owner', 'requestid', 'amount'],
  // },
  {
    name: 'recurrent_transfer',
    fields: [
      'from',
      'to',
      'amount',
      'memo',
      'recurrence',
      'executions',
      'extensions',
    ],
  },
  {
    name: 'fill_convert_request',
    fields: ['owner', 'amount_in', 'amount_out'],
  },
  {
    name: 'author_reward',
    fields: [
      'author',
      'permlink',
      'hbd_payout',
      'hive_payout',
      'vesting_payout',
      'curators_vesting_payout',
    ],
  },
  {
    name: 'curation_reward',
    fields: ['curator', 'reward', 'comment_author', 'comment_permlink'],
  },
  {
    name: 'comment_reward',
    fields: [
      'author',
      'permlink',
      'payout',
      'author_rewards',
      'total_payout_value',
      'curator_payout_value',
      'beneficiary_payout_value',
    ],
  },
  { name: 'interest', fields: ['owner', 'interest'] },
  {
    name: 'fill_vesting_withdraw',
    fields: ['from_account', 'to_account', 'withdrawn', 'deposited'],
  },
  {
    name: 'fill_order',
    fields: [
      'current_owner',
      'current_orderid',
      'current_pays',
      'open_owner',
      'open_orderid',
      'open_pays',
    ],
  },
  {
    name: 'fill_transfer_from_savings',
    fields: ['from', 'to', 'amount', 'memo'],
  },
  { name: 'return_vesting_delegation', fields: ['account', 'vesting_shares'] },
  {
    name: 'comment_benefactor_reward',
    fields: [
      'benefactor',
      'author',
      'permlink',
      'hbd_payout',
      'hive_payout',
      'vesting_payout',
    ],
  },
  { name: 'producer_reward', fields: ['producer', 'vesting_shares'] },
  {
    name: 'changed_recovery_account',
    fields: ['account', 'old_recovery_account', 'new_recovery_account'],
  },
  {
    name: 'fill_collateralized_convert_request',
    fields: ['amount_in', 'amount_out', 'excess_collateral'],
  },
  {
    name: 'fill_recurrent_transfer',
    fields: ['from', 'to', 'amount', 'memo', 'remaining_executions'],
  },
  {
    name: 'failed_recurrent_transfer',
    fields: [
      'from',
      'to',
      'amount',
      'memo',
      'consecutive_failures',
      'remaining_executions',
      'deleted',
    ],
  },
];

const operandList = [
  '==',
  '!=',
  '>',
  '>=',
  '<',
  '<=',
  'contains',
  '!contains',
  'regex',
];

const conditionNames: { [conditionName: string]: string } = {
  '==': '= (equals)',
  '!=': '(!=) different from',
  '>': '> (greater than)',
  '>=': '>= (greater than or or equal to)',
  '<': '< (less than)',
  '<=': '<= (less than or or equal to)',
  contains: 'List contains',
  '!contains': "List doesn't contain",
  regex: 'regex',
};

const defaultActiveSubs = [
  // Core
  'transfer',
  //'limit_order',
  'fill_order',
  //'convert',
  'fill_convert_request',
  'fill_recurrent_transfer',
  'request_account_recovery',
  'producer_reward',
  'author_reward',
  'curation_reward',
  'comment_payout_update',
  // Splinterlands
  'sm_token_transfer',
  'sm_market_purchase',
  'sm_unlock_assets',
];

const suggestedConfig = [
  'fill_convert_request',
  'interest',
  'fill_order',
  'fill_transfer_from_savings',
  'fill_collateralized_convert_request',
  'fill_recurrent_transfer',
  'failed_recurrent_transfer',
  'fill_vesting_withdraw',
];

const prefixMap = {
  core: '',
  splinterlands: 'sm_',
};

const getAccountConfig = async (username: string) => {
  return PeakDNotificationsApi.get(`users/${username}`);
};

const isPushNotificationEnabled = (item: NotificationConfigItem): boolean => {
  const extension = item.extensions?.find(
    (entry) => entry.name === NOTIFICATION_PUSH_EXTENSION_NAME,
  );
  return extension?.value === true;
};

const isPushNotificationEnabledForOperation = (
  config: NotificationConfig,
  operation: string,
): boolean =>
  config.some(
    (item) =>
      item.operation === operation && isPushNotificationEnabled(item),
  );

const getPushNotificationFromExtensions = (
  item: NotificationConfigItem,
): boolean => isPushNotificationEnabled(item);

const buildPushNotificationExtensions = (pushNotification: boolean) => {
  if (!pushNotification) {
    return undefined;
  }
  return [
    {
      name: NOTIFICATION_PUSH_EXTENSION_NAME,
      value: true as const,
    },
  ];
};

const initializeForm = (config: NotificationConfig): NotificationConfigForm => {
  const configForm: NotificationConfigForm = [];

  config.forEach((configItem) => {
    const configFormItem: NotificationConfigFormItem = {
      operation: configItem.operation,
      conditions: [],
      pushNotification: getPushNotificationFromExtensions(configItem),
    };
    if (configItem.conditions) {
      Object.keys(configItem.conditions).forEach((field) => {
        configFormItem.conditions?.push({
          field: field,
          operand: configItem.conditions
            ? Object.keys(configItem.conditions[field])[0]
            : '',
          value: configItem.conditions
            ? Object.values(configItem.conditions[field])[0]
            : '',
        });
      });
    }
    configForm.push(configFormItem);
  });

  return configForm as NotificationConfigForm;
};

const formatConfigForm = (form: NotificationConfigForm) => {
  const config: NotificationConfig = [];
  for (const item of form) {
    const criteria: NotificationConfigItem = {
      operation: item.operation,
      conditions: {} as NotificationConfigConditions,
    };
    for (const condition of item.conditions) {
      if (condition.field.length > 0 && condition.operand.length > 0)
        criteria.conditions![condition.field] = {
          [condition.operand]: condition.value,
        };
    }
    const extensions = buildPushNotificationExtensions(item.pushNotification);
    if (extensions) {
      criteria.extensions = extensions;
    }
    config.push(criteria);
  }
  return config;
};

const getSuggestedConfig = (username: string) => {
  const configForm: NotificationConfigForm = [];
  configForm.push({
    operation: 'transfer',
    pushNotification: true,
    conditions: [{ field: 'to', operand: '==', value: username }],
  });
  configForm.push({
    operation: 'comment',
    pushNotification: true,
    conditions: [{ field: 'body', operand: 'regex', value: `@${username}` }],
  });
  configForm.push({
    operation: 'comment',
    pushNotification: true,
    conditions: [
      { field: 'parent_author', operand: '==', value: `${username}` },
    ],
  });
  configForm.push({
    operation: 'recurrent_transfer',
    pushNotification: true,
    conditions: [{ field: 'to', operand: '==', value: username }],
  });
  configForm.push({
    operation: 'delegate_vesting_shares',
    pushNotification: true,
    conditions: [{ field: 'delegatee', operand: '==', value: username }],
  });
  configForm.push({
    operation: 'custom_json',
    pushNotification: true,
    conditions: [{ field: 'id', operand: '==', value: 'follow' }],
  });
  configForm.push({
    operation: 'custom_json',
    pushNotification: true,
    conditions: [{ field: 'id', operand: '==', value: 'reblog' }],
  });
  for (const sub of suggestedConfig) {
    configForm.push({
      operation: sub as NotificationOperationName,
      pushNotification: true,
      conditions: [{ field: '', operand: '', value: '' }],
    });
  }

  return configForm;
};

const notifyPushSubscriptionsSync = (payload: {
  username: string;
  config?: NotificationConfig;
  deleted?: boolean;
}) => {
  void chrome.runtime
    .sendMessage({
      command: BackgroundCommand.SYNC_HIVE_PUSH_NOTIFICATIONS,
      value: {
        username: payload.username.trim().toLowerCase(),
        config: payload.config,
        deleted: payload.deleted === true,
      },
    })
    .catch(() => undefined);
};

const saveConfiguration = async (
  form: NotificationConfigForm,
  account: LocalAccount,
) => {
  const config = formatConfigForm(form);
  const response = await CustomJsonUtils.send(
    ['update_account', { config }],
    account.name,
    account.keys.posting!,
    KeyType.POSTING,
    'notify',
  );
  if (response?.tx_id) {
    notifyPushSubscriptionsSync({
      username: account.name,
      config,
    });
  }
  return response;
};

const getNotifications = async (
  username: string,
  globalProperties: DynamicGlobalProperties,
  initialList?: Notification[],
) => {
  const notifications: Notification[] = [];

  let rawNotifications: any[] = [];
  let lastBatch: any[] = [];
  const limit = 100;
  const initialOffset =
    initialList && initialList.length > 0 ? initialList.length : 0;
  let offset = initialOffset;

  do {
    lastBatch = await PeakDNotificationsApi.get(
      `notifications/${username}?limit=${100}&offset=${offset}`,
    );
    rawNotifications = [...rawNotifications, ...lastBatch];
    offset += limit;
  } while (
    lastBatch.length > 0 &&
    lastBatch.every((rawNotif) => rawNotif.read_at === null)
  );

  for (const [index, notif] of rawNotifications.entries()) {
    const content = PeakDNotificationContentUtils.formatRawPeakDNotificationContent(
      notif,
      username,
      globalProperties,
    );
    notifications.push({
      type: NotificationType.PEAKD,
      isTypeLast:
        rawNotifications.length !== limit &&
        rawNotifications.length - 1 === index,
      id: notif.id,
      operation:
        PeakDNotificationContentUtils.getPeakDOperationName(notif),
      createdAt: moment(notif.created),
      txUrl: content.txUrl,
      externalUrl: content.externalUrl,
      linkLabel: content.linkLabel,
      linkUrl: content.linkUrl,
      message: content.message,
      messageParams: content.messageParams,
      read: !!notif.read_at,
    });
  }
  return notifications;
};

const markAllAsRead = async (activeAccount: ActiveAccount) => {
  return await CustomJsonUtils.send(
    [
      'setLastRead',
      {
        date: new Date(),
      },
    ],
    activeAccount.name!,
    activeAccount.keys.posting!,
    KeyType.POSTING,
    'notify',
  );
};

const deleteAccountConfig = async (activeAccount: ActiveAccount) => {
  const response = await CustomJsonUtils.send(
    ['delete_account', {}],
    activeAccount.name!,
    activeAccount.keys.posting!,
    KeyType.POSTING,
    'notify',
  );
  if (response?.tx_id) {
    notifyPushSubscriptionsSync({
      username: activeAccount.name!,
      deleted: true,
    });
  }
  return response;
};

const saveDefaultConfig = async (activeAccount: ActiveAccount) => {
  // const config = getDefaultConfig();
  const config = getSuggestedConfig(activeAccount.name!);
  return saveConfiguration(config, {
    keys: activeAccount.keys,
    name: activeAccount.name!,
  } as LocalAccount);
};

export const PeakDNotificationsUtils = {
  defaultActiveSubs,
  conditionNames,
  prefixMap,
  operandList,
  getAccountConfig,
  operationFieldList,
  initializeForm,
  saveConfiguration,
  getNotifications,
  markAllAsRead,
  deleteAccountConfig,
  saveDefaultConfig,
  getSuggestedConfig,
  isPushNotificationEnabledForOperation,
};
