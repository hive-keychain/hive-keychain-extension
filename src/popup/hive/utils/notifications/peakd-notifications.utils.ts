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
  NotificationOperationName,
  NotificationType,
} from '@interfaces/notifications.interface';
import { CustomJsonUtils } from '@popup/hive/utils/custom-json.utils';
import { Asset } from 'hive-keychain-commons';
import moment from 'moment';
import FormatUtils from 'src/utils/format.utils';

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

const initializeForm = (config: NotificationConfig): NotificationConfigForm => {
  const configForm: NotificationConfigForm = [];

  config.forEach((configItem, indexConfigItem) => {
    const configFormItem: NotificationConfigFormItem = {
      // id: indexConfigItem,
      operation: configItem.operation,
      conditions: [],
    };
    if (configItem.conditions) {
      Object.keys(configItem.conditions).forEach((field, indexCondition) => {
        configFormItem.conditions?.push({
          // id: indexCondition,
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
    const criteria = {
      operation: item.operation,
      conditions: {} as NotificationConfigConditions,
    };
    for (const condition of item.conditions) {
      if (condition.field.length > 0 && condition.operand.length > 0)
        criteria.conditions[condition.field] = {
          [condition.operand]: condition.value,
        };
    }
    config.push(criteria);
  }
  return config;
};

const getSuggestedConfig = (username: string) => {
  const configForm: NotificationConfigForm = [];
  configForm.push({
    operation: 'transfer',
    conditions: [{ field: 'to', operand: '==', value: username }],
  });
  configForm.push({
    operation: 'comment',
    conditions: [{ field: 'body', operand: 'regex', value: `@${username}` }],
  });
  configForm.push({
    operation: 'comment',
    conditions: [
      { field: 'parent_author', operand: '==', value: `${username}` },
    ],
  });
  configForm.push({
    operation: 'recurrent_transfer',
    conditions: [{ field: 'to', operand: '==', value: username }],
  });
  configForm.push({
    operation: 'delegate_vesting_shares',
    conditions: [{ field: 'delegatee', operand: '==', value: username }],
  });
  configForm.push({
    operation: 'custom_json',
    conditions: [{ field: 'id', operand: '==', value: 'follow' }],
  });
  configForm.push({
    operation: 'custom_json',
    conditions: [{ field: 'id', operand: '==', value: 'reblog' }],
  });
  for (const sub of suggestedConfig) {
    configForm.push({
      operation: sub as NotificationOperationName,
      conditions: [{ field: '', operand: '', value: '' }],
    });
  }

  return configForm;
};

const saveConfiguration = async (
  form: NotificationConfigForm,
  account: LocalAccount,
) => {
  const config = formatConfigForm(form);
  return await CustomJsonUtils.send(
    ['update_account', { config }],
    account.name,
    account.keys.posting!,
    KeyType.POSTING,
    'notify',
  );
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
    const payload = JSON.parse(notif.payload);
    let messageParams: string[] = [];
    let message: string = `notification_${notif.operation}`;
    let externalUrl;
    switch (notif.operation_type) {
      case 'custom_json.follow': {
        const json = payload.json[1];
        message =
          json.what && json.what.length > 0
            ? 'notification_follow'
            : 'notification_unfollow';
        messageParams = [json.follower, json.following];
        break;
      }
      case 'custom_json.reblog':
        const json = payload.json[1];
        message = json.delete ? 'notification_unreblog' : 'notification_reblog';
        messageParams = [json.account, json.author, json.permlink];
        break;
      case 'transfer': {
        if (typeof payload.amount !== 'string')
          payload.amount = FormatUtils.fromNaiAndSymbol(payload.amount);

        const amount = FormatUtils.withCommas(payload.amount, 3);
        if (payload.to === username) {
          messageParams = [amount, payload.from];
          message = 'popup_html_wallet_info_transfer_in';
        } else {
          messageParams = [amount, payload.to];
          message = 'popup_html_wallet_info_transfer_out';
        }
        break;
      }
      case 'fill_recurrent_transfer': {
        const amount = FormatUtils.withCommas(payload.amount, 3);
        if (payload.to === username) {
          messageParams = [amount, payload.from, payload.remaining_executions];
          message = 'popup_html_wallet_info_fill_recurrent_transfer_in';
        } else {
          messageParams = [amount, payload.to, payload.remaining_executions];
          message = 'popup_html_wallet_info_fill_recurrent_transfer_out';
        }

        break;
      }
      case 'account_update':
      case 'account_update2': {
        message = 'notification_account_update';
        messageParams = [payload.account];
        break;
      }
      case 'account_witness_proxy': {
        message = 'notification_account_witness_proxy';
        messageParams = [payload.account, payload.proxy];
        break;
      }
      case 'account_witness_vote': {
        if (payload.approve) {
          message = 'notification_account_witness_vote';
          messageParams = [payload.account, payload.witness];
        } else {
          message = 'notification_account_witness_unvote';
          messageParams = [payload.account, payload.witness];
        }
        break;
      }
      case 'change_recovery_account': {
        message = 'notification_change_recovery_account';
        messageParams = [
          payload.account_to_recover,
          payload.new_recovery_account,
        ];
        break;
      }
      case 'claim_account': {
        message = 'popup_html_wallet_info_claim_account';
        break;
      }
      case 'comment': {
        const replyTrigger = `"parent_author":{"==":"${username}"}`;
        if (notif.trigger.includes(replyTrigger)) {
          // case response
          message = 'notification_answer';
          messageParams = [
            notif.sender,
            payload.author,
            payload.parent_permlink,
          ];
        } else {
          // case mention
          message = 'notification_mention';
          messageParams = [
            notif.sender,
            notif.account,
            payload.author,
            payload.permlink,
          ];
        }
        externalUrl = `https://peakd.com/@${payload.author}/${payload.permlink}`;
        break;
      }
      case 'delegate_vesting_shares': {
        if (Asset.fromString(payload.vesting_shares).amount > 0) {
          message = 'notification_delegation';
          messageParams = [
            payload.delegator,
            FormatUtils.toFormattedHP(
              payload.vesting_shares.toString().replace('VESTS', ''),
              globalProperties,
            ),
            payload.delegatee,
          ];
        } else {
          message = 'notification_cancel_delegation';
          messageParams = [payload.delegator, payload.delegatee];
        }
        break;
      }
      case 'feed_publish': {
        // TODO check payload
        break;
      }
      case 'recover_account': {
        message = 'notification_requested_account_recovery';
        messageParams = [payload.account_to_recover, payload.recovery_account];
        break;
      }
      case 'request_account_recovery': {
        message = 'notification_recovered_account';
        messageParams = [payload.account_to_recover];
        break;
      }
      case 'set_withdraw_vesting_route': {
        message = 'notification_set_power_down_route';
        messageParams = [payload.from_account, payload.to_account];
        break;
      }
      case 'transfer_from_savings': {
        message = 'popup_html_wallet_info_withdraw_savings';
        const amount = FormatUtils.withCommas(payload.amount, 3);
        messageParams = [amount];
        break;
      }
      case 'transfer_to_savings': {
        message = 'popup_html_wallet_info_deposit_savings';
        const amount = FormatUtils.withCommas(payload.amount, 3);
        messageParams = [amount];
        break;
      }
      case 'transfer_to_vesting': {
        const amount = FormatUtils.withCommas(payload.amount, 3);
        if (payload.to === username) {
          message = 'popup_html_wallet_info_power_up';
          messageParams = [amount];
        } else {
          message = 'popup_html_wallet_info_power_up_other_account';
          messageParams = [payload.from, amount, payload.to];
        }
        break;
      }
      case 'vote': {
        message = 'notification_vote';
        messageParams = [payload.voter, payload.author, payload.permlink];
        externalUrl = `https://peakd.com/@${payload.author}/${payload.permlink}`;
        break;
      }
      case 'withdraw_vesting': {
        message = 'bgd_ops_pd';
        messageParams = [
          FormatUtils.toFormattedHP(
            payload.vesting_shares.toString().replace('VESTS', ''),
            globalProperties,
          ),
          payload.account,
        ];
        break;
      }
      case 'recurrent_transfer': {
        const amount = FormatUtils.withCommas(payload.amount, 3);

        message = 'notification_recurrent_transfer';
        messageParams = [
          payload.from,
          amount,
          payload.to,
          payload.executions,
          payload.recurrence,
        ];
        break;
      }
      case 'fill_convert_request': {
        const amountIn = FormatUtils.withCommas(payload.amount_in, 3);
        const amountOut = FormatUtils.withCommas(payload.amount_out, 3);

        message = 'notification_fill_convert';
        messageParams = [payload.owner, amountIn, amountOut];
        break;
      }
      case 'author_reward': {
        message = 'notification_author_reward';
        messageParams = [
          payload.author,
          FormatUtils.withCommas(payload.hbd_payout, 3),
          FormatUtils.withCommas(payload.hive_payout, 3),
          FormatUtils.toFormattedHP(
            payload.vesting_payout.toString().replace('VESTS', ''),
            globalProperties,
          ),
          payload.permlink,
        ];
        externalUrl = `https://peakd.com/@${payload.author}/${payload.permlink}`;

        break;
      }
      case 'curation_reward': {
        message = 'notification_curation_reward';
        messageParams = [
          payload.curator,
          FormatUtils.toFormattedHP(
            payload.reward.toString().replace('VESTS', ''),
            globalProperties,
          ),
          payload.comment_author,
          payload.comment_permlink,
        ];
        externalUrl = `https://peakd.com/@${payload.comment_author}/${payload.comment_permlink}`;
        break;
      }
      case 'comment_reward': {
        message = 'notification_comment_reward';
        messageParams = [
          payload.author,
          FormatUtils.withCommas(payload.payout, 3),
          payload.permlink,
        ];
        externalUrl = `https://peakd.com/@${payload.author}/${payload.permlink}`;
        break;
      }
      case 'interest': {
        message = 'notification_hbd_interest';
        messageParams = [
          payload.owner,
          FormatUtils.withCommas(payload.interest, 3),
        ];
        break;
      }
      case 'fill_vesting_withdraw': {
        if (username === payload.from_account) {
          message = 'notification_fill_power_down';
          messageParams = [
            payload.to_account,
            FormatUtils.toFormattedHP(
              payload.withdrawn.toString().replace('VESTS', ''),
              globalProperties,
            ),
          ];
        } else {
          message = 'notification_fill_power_down_other_account';
          messageParams = [
            payload.to_account,
            FormatUtils.toFormattedHP(
              payload.withdrawn.toString().replace('VESTS', ''),
              globalProperties,
            ),
            payload.from_account,
          ];
        }
        break;
      }
      case 'fill_order': {
        message = 'notification_fill_order';
        messageParams = [
          payload.current_owner,
          payload.open_owner,
          FormatUtils.withCommas(payload.current_pays, 3),
          FormatUtils.withCommas(payload.open_pays, 3),
        ];
        break;
      }
      case 'fill_transfer_from_savings': {
        const amount = FormatUtils.withCommas(payload.amount, 3);
        if (payload.from === payload.to) {
          message = 'notification_fill_transfer_from_savings';
          messageParams = [payload.from, amount];
        } else {
          message =
            'notification_fill_transfer_from_savings_from_other_account';
          messageParams = [payload.from, amount, payload.to];
        }
        break;
      }
      case 'return_vesting_delegation': {
        message = 'notification_returned_vesting_delegation';
        messageParams = [
          payload.account,
          FormatUtils.toFormattedHP(
            payload.vesting_shares.toString().replace('VESTS', ''),
            globalProperties,
          ),
        ];
        break;
      }
      case 'comment_benefactor_reward': {
        message = 'notification_comment_benefactor_reward';
        messageParams = [
          payload.benefactor,
          FormatUtils.withCommas(payload.hbd_payout, 3),
          FormatUtils.withCommas(payload.hive_payout, 3),
          FormatUtils.toFormattedHP(
            payload.vesting_payout.toString().replace('VESTS', ''),
            globalProperties,
          ),
          payload.author,
          payload.permlink,
        ];
        externalUrl = `https://peakd.com/@${payload.author}/${payload.permlink}`;
        break;
      }
      case 'producer_reward': {
        message = 'notification_producer_reward';
        messageParams = [
          payload.producer,
          FormatUtils.toFormattedHP(
            payload.vesting_shares.toString().replace('VESTS', ''),
            globalProperties,
          ),
        ];
        break;
      }
      case 'changed_recovery_account': {
        message = 'notification_changed_recovery_account';
        messageParams = [
          payload.account,
          payload.old_recovery_account,
          payload.new_recovery_account,
        ];
        break;
      }
      case 'fill_collateralized_convert_request': {
        message = 'notification_fill_collateralized_convert_request';
        messageParams = [
          payload.owner,
          FormatUtils.withCommas(payload.amount_in, 3),
          FormatUtils.withCommas(payload.amount_out, 3),
        ];
        break;
      }
      case 'failed_recurrent_transfer': {
        message = 'notification_failed_recurrent_transfer';
        messageParams = [
          FormatUtils.withCommas(payload.amount, 3),
          payload.from,
          payload.to,
        ];
        break;
      }
    }
    notifications.push({
      type: NotificationType.PEAKD,
      isTypeLast:
        rawNotifications.length !== limit &&
        rawNotifications.length - 1 === index,
      id: notif.id,
      createdAt: moment(notif.created),
      txUrl:
        notif.trx_id && !notif.trx_id.startsWith('v')
          ? `https://hivehub.dev/tx/${notif.trx_id}`
          : undefined,
      externalUrl: externalUrl,
      message: message,
      messageParams: messageParams,
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
  return await CustomJsonUtils.send(
    ['delete_account', {}],
    activeAccount.name!,
    activeAccount.keys.posting!,
    KeyType.POSTING,
    'notify',
  );
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
};
