import { PeakDNotificationsApi } from '@api/peakd-notifications';
import {
  NotificationConfig,
  NotificationConfigForm,
  NotificationConfigFormItem,
} from '@interfaces/peakd-notifications.interface';

const operationFieldList = [
  {
    name: 'account_create',
    fields: [
      'fee',
      'creator',
      'new_account_name',
      'owner',
      'active',
      'posting',
      'memo_key',
      'json_metadata',
    ],
  },
  {
    name: 'account_create_with_delegation',
    fields: [
      'fee',
      'delegation',
      'creator',
      'new_account_name',
      'owner',
      'active',
      'posting',
      'memo_key',
      'json_metadata',
      'extensions',
    ],
  },
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
  {
    name: 'cancel_transfer_from_savings',
    fields: ['from', 'request_id'],
  },
  {
    name: 'change_recovery_account',
    fields: ['account_to_recover', 'new_recovery_account', 'extensions'],
  },
  {
    name: 'claim_reward_balance',
    fields: ['account', 'reward_hive', 'reward_hbd', 'reward_vests'],
  },
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
  {
    name: 'comment_options',
    fields: [
      'author',
      'permlink',
      'max_accepted_payout',
      'percent_hbd',
      'allow_votes',
      'allow_curation_rewards',
      'extensions',
    ],
  },
  { name: 'convert', fields: ['owner', 'requestid', 'amount'] },
  {
    name: 'create_claimed_account',
    fields: [
      'creator',
      'new_account_name',
      'owner',
      'active',
      'posting',
      'memo_key',
      'json_metadata',
      'extensions',
    ],
  },
  { name: 'custom', fields: ['required_auths', 'id', 'data'] },
  {
    name: 'custom_binary',
    fields: [
      'required_owner_auths',
      'required_active_auths',
      'required_posting_auths',
      'required_auths',
      'id',
      'data',
    ],
  },
  {
    name: 'custom_json',
    fields: ['required_auths', 'required_posting_auths', 'id', 'json'],
  },
  { name: 'decline_voting_rights', fields: ['account', 'decline'] },
  {
    name: 'delegate_vesting_shares',
    fields: ['delegator', 'delegatee', 'vesting_shares'],
  },
  { name: 'delete_comment', fields: ['author', 'permlink'] },
  {
    name: 'escrow_approve',
    fields: ['from', 'to', 'agent', 'who', 'escrow_id', 'approve'],
  },
  {
    name: 'escrow_dispute',
    fields: ['from', 'to', 'agent', 'who', 'escrow_id'],
  },
  {
    name: 'escrow_release',
    fields: [
      'from',
      'to',
      'agent',
      'who',
      'receiver',
      'escrow_id',
      'hbd_amount',
      'hive_amount',
    ],
  },
  {
    name: 'escrow_transfer',
    fields: [
      'from',
      'to',
      'agent',
      'escrow_id',
      'hbd_amount',
      'hive_amount',
      'fee',
      'ratification_deadline',
      'escrow_expiration',
      'json_meta',
    ],
  },
  { name: 'feed_publish', fields: ['publisher', 'exchange_rate'] },
  { name: 'limit_order_cancel', fields: ['owner', 'orderid'] },
  {
    name: 'limit_order_create',
    fields: [
      'owner',
      'orderid',
      'amount_to_sell',
      'min_to_receive',
      'fill_or_kill',
      'expiration',
    ],
  },
  {
    name: 'limit_order_create2',
    fields: [
      'owner',
      'orderid',
      'amount_to_sell',
      'exchange_rate',
      'fill_or_kill',
      'expiration',
    ],
  },
  {
    name: 'pow',
    fields: ['worker_account', 'block_id', 'nonce', 'work', 'props'],
  },
  { name: 'pow2', fields: ['work', 'new_owner_key', 'props'] },
  {
    name: 'recover_account',
    fields: [
      'account_to_recover',
      'new_owner_authority',
      'recent_owner_authority',
      'extensions',
    ],
  },
  {
    name: 'report_over_production',
    fields: ['reporter', 'first_block', 'second_block'],
  },
  {
    name: 'request_account_recovery',
    fields: [
      'recovery_account',
      'account_to_recover',
      'new_owner_authority',
      'extensions',
    ],
  },
  {
    name: 'reset_account',
    fields: ['reset_account', 'account_to_reset', 'new_owner_authority'],
  },
  {
    name: 'set_reset_account',
    fields: ['account', 'current_reset_account', 'reset_account'],
  },
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
  {
    name: 'witness_update',
    fields: ['owner', 'url', 'block_signing_key', 'props', 'fee'],
  },
  {
    name: 'witness_set_properties',
    fields: ['owner', 'props', 'extensions'],
  },
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
  {
    name: 'create_proposal',
    fields: [
      'creator',
      'receiver',
      'start_date',
      'end_date',
      'daily_pay',
      'subject',
      'permlink',
      'extensions',
    ],
  },
  {
    name: 'update_proposal_votes',
    fields: ['voter', 'proposal_ids', 'approve', 'extensions'],
  },
  {
    name: 'remove_proposal',
    fields: ['proposal_owner', 'proposal_ids', 'extensions'],
  },
  {
    name: 'update_proposal',
    fields: [
      'proposal_id',
      'creator',
      'daily_pay',
      'subject',
      'permlink',
      'extensions',
    ],
  },
  {
    name: 'collateralized_convert',
    fields: ['owner', 'requestid', 'amount'],
  },
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

const prefixMap = {
  core: '',
  splinterlands: 'sm_',
};

const getAccountConfig = async (username: string) => {
  return PeakDNotificationsApi.get(`users/${username}`);
};

const initializeForm = (config: NotificationConfig): NotificationConfigForm => {
  const configForm: NotificationConfigForm = [];

  config.forEach((configItem, indexConfigItem) => {
    const configFormItem: NotificationConfigFormItem = {
      id: indexConfigItem,
      operation: configItem.operation,
      conditions: [],
    };
    if (configItem.conditions) {
      Object.keys(configItem.conditions).forEach((field, indexCondition) => {
        configFormItem.conditions?.push({
          id: indexCondition,
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

export const NotificationsUtils = {
  defaultActiveSubs,
  conditionNames,
  prefixMap,
  operandList,
  getAccountConfig,
  operationFieldList,
  initializeForm,
};
