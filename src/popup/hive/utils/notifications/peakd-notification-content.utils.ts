import type { DynamicGlobalProperties } from '@hiveio/dhive';
import { Asset } from 'hive-keychain-commons';
import FormatUtils from 'src/utils/format.utils';

export type PeakDRawNotification = {
  id: string;
  created: string;
  trx_id?: string;
  account: string;
  operation?: string;
  operation_type: string;
  payload: string;
  read_at?: string | null;
  sender?: string;
  trigger?: string;
};

export type PeakDNotificationContent = {
  message: string;
  messageParams: string[];
  externalUrl?: string;
  linkLabel?: string;
  linkUrl?: string;
  txUrl?: string;
};

const buildNotificationPostUrl = (author: string, permlink: string) =>
  `https://peakd.com/@${encodeURIComponent(author)}/${encodeURIComponent(
    permlink,
  )}`;

const buildNotificationPostLabel = (
  author: string,
  permlink: string,
  withAtPrefix = false,
) => `${withAtPrefix ? '@' : ''}${author}/${permlink}`;

const buildNotificationTxUrl = (transactionId: string) =>
  `https://hivehub.dev/tx/${encodeURIComponent(transactionId)}`;

const getPeakDOperationName = (notif: PeakDRawNotification): string => {
  if (typeof notif.operation === 'string' && notif.operation.length > 0) {
    return notif.operation;
  }
  return notif.operation_type.split('.')[0] ?? notif.operation_type;
};

const formatRawPeakDNotificationContent = (
  notif: PeakDRawNotification,
  username: string,
  globalProperties: DynamicGlobalProperties,
): PeakDNotificationContent => {
  const payload = JSON.parse(notif.payload);
  let messageParams: string[] = [];
  let message: string = `notification_${notif.operation}`;
  let externalUrl;
  let linkLabel;
  let linkUrl;

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
    case 'custom_json.reblog': {
      const json = payload.json[1];
      message = json.delete ? 'notification_unreblog' : 'notification_reblog';
      messageParams = [json.account, json.author, json.permlink];
      linkUrl = buildNotificationPostUrl(json.author, json.permlink);
      linkLabel = buildNotificationPostLabel(json.author, json.permlink);
      break;
    }
    case 'transfer': {
      if (typeof payload.amount !== 'string') {
        payload.amount = FormatUtils.fromNaiAndSymbol(payload.amount);
      }

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
      if (notif.trigger?.includes(replyTrigger)) {
        message = 'notification_answer';
        messageParams = [notif.sender!, payload.author, payload.parent_permlink];
        linkUrl = buildNotificationPostUrl(
          payload.parent_author,
          payload.parent_permlink,
        );
        linkLabel = buildNotificationPostLabel(
          payload.parent_author,
          payload.parent_permlink,
        );
      } else {
        message = 'notification_mention';
        messageParams = [
          notif.sender!,
          notif.account,
          payload.author,
          payload.permlink,
        ];
        linkUrl = buildNotificationPostUrl(payload.author, payload.permlink);
        linkLabel = buildNotificationPostLabel(
          payload.author,
          payload.permlink,
        );
      }
      externalUrl = buildNotificationPostUrl(payload.author, payload.permlink);
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
      externalUrl = buildNotificationPostUrl(payload.author, payload.permlink);
      linkUrl = externalUrl;
      linkLabel = buildNotificationPostLabel(
        payload.author,
        payload.permlink,
        true,
      );
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
      externalUrl = buildNotificationPostUrl(payload.author, payload.permlink);
      linkUrl = externalUrl;
      linkLabel = buildNotificationPostLabel(payload.author, payload.permlink);
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
      externalUrl = buildNotificationPostUrl(
        payload.comment_author,
        payload.comment_permlink,
      );
      linkUrl = externalUrl;
      linkLabel = buildNotificationPostLabel(
        payload.comment_author,
        payload.comment_permlink,
        true,
      );
      break;
    }
    case 'comment_reward': {
      message = 'notification_comment_reward';
      messageParams = [
        payload.author,
        FormatUtils.withCommas(payload.payout, 3),
        payload.permlink,
      ];
      externalUrl = buildNotificationPostUrl(payload.author, payload.permlink);
      linkUrl = externalUrl;
      linkLabel = buildNotificationPostLabel(payload.author, payload.permlink);
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
        message = 'notification_fill_transfer_from_savings_from_other_account';
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
      externalUrl = buildNotificationPostUrl(payload.author, payload.permlink);
      linkUrl = externalUrl;
      linkLabel = buildNotificationPostLabel(
        payload.author,
        payload.permlink,
        true,
      );
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

  return {
    message,
    messageParams,
    externalUrl,
    linkLabel,
    linkUrl,
    txUrl:
      notif.trx_id && !notif.trx_id.startsWith('v')
        ? buildNotificationTxUrl(notif.trx_id)
        : undefined,
  };
};

export const PeakDNotificationContentUtils = {
  formatRawPeakDNotificationContent,
  getPeakDOperationName,
};
