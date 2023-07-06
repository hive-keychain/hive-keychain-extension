import {
  AuthorCurationTransaction,
  CommentCurationTransaction,
  CurationRewardTransaction,
  DelegateTokenTransaction,
  MiningLotteryTransaction,
  OperationsHiveEngine,
  StakeTokenTransaction,
  TokenTransaction,
  TransferTokenTransaction,
  UndelegateTokenDoneTransaction,
  UndelegateTokenStartTransaction,
  UnStakeTokenDoneTransaction,
  UnStakeTokenStartTransaction,
} from '@interfaces/tokens.interface';
import moment from 'moment';
import React, { BaseSyntheticEvent, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { Icons } from 'src/common-ui/icons.enum';
import { RootState } from 'src/popup/hive/store';
import './token-history-item.component.scss';

interface TokenHistoryItemProps {
  transaction: TokenTransaction;
  dataTestId?: string;
}

const TokenHistoryItem = ({
  transaction,
  activeAccountName,
  dataTestId,
}: PropsFromRedux) => {
  const [isMemoOpened, setIsMemoOpened] = useState(false);

  const getIcon = () => {
    switch (transaction.operation) {
      case OperationsHiveEngine.COMMENT_AUTHOR_REWARD:
      case OperationsHiveEngine.COMMENT_CURATION_REWARD:
      case OperationsHiveEngine.MINING_LOTTERY:
        return Icons.CLAIM;
      case OperationsHiveEngine.TOKENS_TRANSFER:
        return Icons.SEND;
      case OperationsHiveEngine.TOKEN_UNSTAKE_START:
      case OperationsHiveEngine.TOKEN_UNSTAKE_DONE:
        return Icons.ARROW_DOWNWARDS;
      case OperationsHiveEngine.TOKEN_STAKE:
        return Icons.ARROW_UPWARDS;
      case OperationsHiveEngine.TOKEN_UNDELEGATE_START:
      case OperationsHiveEngine.TOKEN_UNDELEGATE_DONE:
        return Icons.DELEGATIONS;
      default:
        return Icons.LINK;
    }
  };

  const getLabel = () => {
    switch (transaction.operation) {
      case OperationsHiveEngine.COMMENT_AUTHOR_REWARD: {
        const t = transaction as AuthorCurationTransaction;
        return chrome.i18n.getMessage(
          'popup_html_token_wallet_info_author_reward',
          [t.amount],
        );
      }
      case OperationsHiveEngine.COMMENT_CURATION_REWARD: {
        const t = transaction as CommentCurationTransaction;
        return chrome.i18n.getMessage(
          'popup_html_token_wallet_info_comment_curation_reward',
          [t.amount],
        );
      }
      case OperationsHiveEngine.MINING_LOTTERY: {
        const t = transaction as MiningLotteryTransaction;
        return chrome.i18n.getMessage(
          'popup_html_token_wallet_info_mining_lottery',
          [t.amount, t.poolId],
        );
      }
      case OperationsHiveEngine.TOKENS_TRANSFER: {
        const t = transaction as TransferTokenTransaction;
        if (t.from === activeAccountName) {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_transfer_out',
            [t.amount, t.to],
          );
        } else {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_transfer_in',
            [t.amount, t.from],
          );
        }
      }
      case OperationsHiveEngine.TOKENS_DELEGATE: {
        const t = transaction as DelegateTokenTransaction;
        if (t.delegator === activeAccountName) {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_delegation_out',
            [t.amount, t.delegatee],
          );
        } else {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_delegation_in',
            [t.delegator, t.amount],
          );
        }
      }
      case OperationsHiveEngine.TOKEN_UNDELEGATE_START: {
        const t = transaction as UndelegateTokenStartTransaction;
        if (t.delegator === activeAccountName) {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_start_cancel_delegation_out',
            [t.amount, t.delegatee],
          );
        } else {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_start_cancel_delegation_in',
            [t.delegator, t.amount],
          );
        }
      }
      case OperationsHiveEngine.TOKEN_UNDELEGATE_DONE: {
        const t = transaction as UndelegateTokenDoneTransaction;
        if (t.delegator === activeAccountName) {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_cancel_delegation_out',
            [t.amount, t.delegatee],
          );
        } else {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_cancel_delegation_in',
            [t.delegator, t.amount],
          );
        }
      }
      case OperationsHiveEngine.TOKEN_STAKE: {
        const t = transaction as StakeTokenTransaction;
        if (t.from !== activeAccountName) {
          return chrome.i18n.getMessage(
            'popup_html_token_wallet_info_stake_other_user',
            [t.from, t.amount, t.to],
          );
        } else
          return chrome.i18n.getMessage('popup_html_token_wallet_info_stake', [
            t.amount,
          ]);
      }
      case OperationsHiveEngine.TOKEN_UNSTAKE_START: {
        const t = transaction as UnStakeTokenStartTransaction;
        return chrome.i18n.getMessage(
          'popup_html_token_wallet_info_start_unstake',
          [t.amount],
        );
      }
      case OperationsHiveEngine.TOKEN_UNSTAKE_DONE: {
        const t = transaction as UnStakeTokenDoneTransaction;
        return chrome.i18n.getMessage(
          'popup_html_token_wallet_info_unstake_done',
          [t.amount],
        );
      }
      case OperationsHiveEngine.TOKEN_ISSUE:
        return chrome.i18n.getMessage('popup_html_token_wallet_info_issue', [
          transaction.amount,
        ]);
      case OperationsHiveEngine.HIVE_PEGGED_BUY:
        return chrome.i18n.getMessage(
          'popup_html_token_wallet_info_pegged_buy',
          [transaction.amount],
        );
      default:
        return null;
    }
  };

  const getMemo = () => {
    switch (transaction.operation) {
      case OperationsHiveEngine.TOKENS_TRANSFER: {
        const t = transaction as TransferTokenTransaction;
        return t.memo;
      }
      case OperationsHiveEngine.COMMENT_AUTHOR_REWARD:
      case OperationsHiveEngine.COMMENT_CURATION_REWARD: {
        const t = transaction as CurationRewardTransaction;
        return t.authorPerm;
      }
      default:
        return null;
    }
  };

  const openTransactionOnHiveblocks = (event: BaseSyntheticEvent) => {
    event.stopPropagation();
    window.open(`https://he.dtools.dev/tx/${transaction.transactionId}`);
  };

  const label = getLabel();
  return label ? (
    <div
      data-testid={dataTestId}
      id={transaction._id}
      className={`token-history-item`}
      onClick={() => setIsMemoOpened(!isMemoOpened)}>
      <div className="transaction">
        <div className="information-panel">
          <div className="top-row">
            <div className="top-icon-date">
              <Icon
                dataTestId="icon-open-new-window"
                name={getIcon()}
                type={IconType.OUTLINED}
                onClick={openTransactionOnHiveblocks}
                additionalClassName="padding-right"></Icon>
              <CustomTooltip
                message={moment(transaction.timestamp * 1000).format(
                  'YYYY/MM/DD , hh:mm:ss a',
                )}
                skipTranslation>
                <div className="date">
                  {moment(transaction.timestamp * 1000).format('L')}
                </div>
              </CustomTooltip>
            </div>
            {getMemo() && (
              <Icon
                name={Icons.EXPAND_MORE}
                onClick={() => setIsMemoOpened(!isMemoOpened)}
                type={IconType.OUTLINED}
                additionalClassName={isMemoOpened ? 'open' : 'closed'}
              />
            )}
          </div>
          <div className="bottom-row">{label}</div>
        </div>
        <div
          data-testid={`${dataTestId}-memo-panel-${transaction._id}`}
          className={isMemoOpened ? 'memo-panel opened' : 'memo-panel closed'}>
          {getMemo()}
        </div>
      </div>
    </div>
  ) : null;
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccountName: state.activeAccount.name,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector> & TokenHistoryItemProps;

export const TokenHistoryItemComponent = connector(TokenHistoryItem);
