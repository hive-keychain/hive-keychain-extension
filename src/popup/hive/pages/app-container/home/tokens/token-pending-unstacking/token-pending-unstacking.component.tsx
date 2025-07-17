import { TransactionOptions } from '@interfaces/keys.interface';
import { PendingUnstaking, Token } from '@interfaces/tokens.interface';
import { loadPendingUnstaking } from '@popup/hive/actions/token.actions';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import {
  goBack,
  navigateToWithParams,
} from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import Decimal from 'decimal.js';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  ConfirmationPageFields,
  ConfirmationPageFieldTag,
} from 'src/common-ui/confirmation-page/confirmation-field.interface';
import { ConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import FormatUtils from 'src/utils/format.utils';

interface Props {}

const TokenPendingUnstake = ({
  tokenInfo,
  pendingUnstaking,
  activeAccount,
  setTitleContainerProperties,
  loadPendingUnstaking,
  navigateToWithParams,
  goBack,
  setErrorMessage,
  setSuccessMessage,
  removeFromLoadingList,
  addToLoadingList,
}: Props & PropsFromRedux) => {
  const [totalUnstaking, setTotalUnstaking] = useState<number>(0);
  const [tokenUnstaking, setTokenUnstaking] = useState<PendingUnstaking[]>();
  useEffect(() => {
    setTitleContainerProperties({
      title: 'html_popup_pending_unstake',
      titleParams: [tokenInfo.symbol],
      isBackButtonEnabled: true,
    });

    const tokenUnstaking = pendingUnstaking!.filter(
      (e) => e.symbol === tokenInfo.symbol,
    );
    const sumUnstaking = tokenUnstaking.reduce(
      (a, b) => Decimal.add(parseFloat(b.quantityLeft), a).toNumber(),
      0,
    );

    setTotalUnstaking(sumUnstaking);
    setTokenUnstaking(tokenUnstaking);
  }, []);

  const cancelUnstake = (pendingUnstake: PendingUnstaking) => {
    const fields: ConfirmationPageFields[] = [
      {
        label: 'popup_html_amount',
        value: `${FormatUtils.formatCurrencyValue(
          pendingUnstake.quantityLeft,
        )} ${pendingUnstake.symbol}`,
        tag: ConfirmationPageFieldTag.AMOUNT,
        tokenSymbol: pendingUnstake.symbol,
        iconPosition: 'right',
      },
    ];

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: KeychainKeyTypes.active,
      message: chrome.i18n.getMessage('html_popup_cancel_unstaking_message'),
      title: 'html_popup_pending_unstake',
      titleParams: [tokenInfo.symbol],
      fields: fields,
      afterConfirmAction: async (options?: TransactionOptions) => {
        let success;
        try {
          addToLoadingList('html_popup_canceling_unstake_token');
          success = await TokensUtils.cancelUnstakeToken(
            pendingUnstake.txID,
            activeAccount,
            options,
          );
          if (success) {
            setTimeout(() => {
              loadPendingUnstaking(activeAccount.name!);
              goBack();
            }, 3000);
            setSuccessMessage('html_popup_cancel_unstake_token_success');
          } else {
            setErrorMessage('html_popup_cancel_unstake_token_fail');
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList('html_popup_canceling_unstake_token');
        }
      },
    } as ConfirmationPageParams);
  };

  return (
    <div className="pending-unstake-token-page">
      {tokenUnstaking?.length && totalUnstaking && totalUnstaking > 0 && (
        <div className="panel">
          <div className="total">
            <div className="label">
              {chrome.i18n.getMessage('html_popup_total_pending_unstake')}
            </div>
            <div className="value">
              {FormatUtils.formatCurrencyValue(
                totalUnstaking,
                tokenInfo.precision,
              )}{' '}
              {tokenInfo.symbol}
            </div>
          </div>
          <div className="list">
            {tokenUnstaking.map((unstaking, index) => (
              <div className="unstaking-row" key={`unstaking-${index}`}>
                <div className="left">
                  <div className="top">
                    {chrome.i18n.getMessage(
                      'html_popup_remaining_transaction',
                      [unstaking.numberTransactionsLeft.toString()],
                    )}
                  </div>
                  <div className="middle">
                    <SVGIcon
                      icon={SVGIcons.WALLET_TOKEN_PENDING_UNSTAKE_NEXT_TX}
                      tooltipMessage={'html_popup_next_unstake_transaction'}
                    />
                    <span>
                      {moment(unstaking.nextTransactionTimestamp).format(
                        'YYYY-MM-DD hh:mm:ss',
                      )}
                    </span>
                  </div>
                  <div className="bottom">
                    <SVGIcon
                      className="next-tx-amount"
                      icon={
                        SVGIcons.WALLET_TOKEN_PENDING_UNSTAKE_NEXT_TX_AMOUNT
                      }
                      tooltipMessage={'html_popup_next_unstake_transaction'}
                    />

                    <span>
                      {chrome.i18n.getMessage(
                        'html_popup_unstake_per_transaction',
                        [
                          FormatUtils.formatCurrencyValue(
                            Decimal.div(
                              unstaking.quantity,
                              tokenInfo.numberTransactions,
                            ).toNumber(),
                          ),
                          unstaking.symbol,
                        ],
                      )}
                    </span>
                  </div>
                </div>
                <span className="right">
                  {`${FormatUtils.nFormatter(
                    Number(unstaking.quantityLeft),
                    3,
                  )}`}{' '}
                  /{' '}
                  {`${FormatUtils.nFormatter(Number(unstaking.quantity), 3)} ${
                    unstaking.symbol
                  }`}
                </span>
                <SVGIcon
                  className="cancel-unstake"
                  icon={SVGIcons.GLOBAL_DELETE}
                  onClick={() => {
                    cancelUnstake(unstaking);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
const mapStateToProps = (state: RootState) => {
  return {
    pendingUnstaking: state.hive.tokensPendingUnstaking,
    tokenInfo: state.navigation.stack[0].params.tokenInfo as Token,
    activeAccount: state.hive.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  navigateToWithParams,
  goBack,
  loadPendingUnstaking,
  removeFromLoadingList,
  addToLoadingList,
  setErrorMessage,
  setSuccessMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokenPendingUnstakePage = connector(TokenPendingUnstake);
