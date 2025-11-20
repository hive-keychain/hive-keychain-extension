import { ActiveAccount } from '@interfaces/active-account.interface';
import { Message } from '@interfaces/message.interface';
import { PendingRecurrentTransfer } from '@interfaces/transaction.interface';
import { fetchRecurrentTransfers } from '@popup/hive/actions/recurrent-transfer.actions';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import { FormatUtils } from 'hive-keychain-commons';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import TransferUtils from 'src/popup/hive/utils/transfer.utils';

const PendingRecurrentTransfersPage = ({
  recurrentTransfers,
  setTitleContainerProperties,
  activeAccount,
  setErrorMessage,
  setSuccessMessage,
  navigateTo,
  fetchRecurrentTransfers,
  addToLoadingList,
  removeFromLoadingList,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_recurrent_transfers',
      isBackButtonEnabled: true,
    });
  }, []);

  return (
    <div
      className="pending-recurrent-transfers-page"
      data-testid={`${Screen.RECURRENT_TRANSFERS_PAGE}-page`}>
      <div className="list-panel">
        <div className="list">
          {recurrentTransfers.map(
            (recurrentTransfer: PendingRecurrentTransfer) => (
              <RecurrentTransferItemComponent
                recurrentTransfer={recurrentTransfer}
                activeAccount={activeAccount}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
                navigateTo={navigateTo}
                fetchRecurrentTransfers={fetchRecurrentTransfers}
                addToLoadingList={addToLoadingList}
                removeFromLoadingList={removeFromLoadingList}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
};

const RecurrentTransferItemComponent = ({
  recurrentTransfer: {
    from,
    to,
    amount,
    remaining_executions,
    recurrence,
    trigger_date,
    pair_id,
  },
  activeAccount,
  setErrorMessage,
  setSuccessMessage,
  navigateTo,
  fetchRecurrentTransfers,
  addToLoadingList,
  removeFromLoadingList,
}: {
  recurrentTransfer: PendingRecurrentTransfer;
  activeAccount: ActiveAccount;
  setErrorMessage: (key: string, params?: string[]) => ActionPayload<Message>;
  setSuccessMessage: (key: string, params?: string[]) => ActionPayload<Message>;
  navigateTo: (screen: Screen, resetStack?: boolean) => void;
  fetchRecurrentTransfers: (name: string) => void;
  addToLoadingList: (key: string) => void;
  removeFromLoadingList: (key: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpandablePanel = () => {
    setIsExpanded(!isExpanded);
  };
  const cancelRecurrentTransfer = async () => {
    addToLoadingList('html_popup_stop_recc_transfer_fund_operation');
    const success = await TransferUtils.sendTransfer(
      from,
      to,
      '0.000 HIVE',
      '',
      true,
      2,
      24,
      activeAccount.keys.active!,
      undefined,
      pair_id,
    );
    if (success) {
      fetchRecurrentTransfers(activeAccount.name!);
      setSuccessMessage('popup_html_cancel_transfer_recurrent_successful', [
        `@${to}`,
      ]);
    } else {
      setErrorMessage('popup_html_transfer_failed');
    }
    removeFromLoadingList('html_popup_stop_recc_transfer_fund_operation');
  };
  return (
    <div className="recurrent-transfer-row" key={`${to}-${pair_id}`}>
      {to && (
        <>
          <div className="item" onClick={toggleExpandablePanel}>
            <div className="username">{`@${to}`}</div>
            <div className="item-details">
              <div className="value">
                {FormatUtils.withCommas(FormatUtils.fromNaiAndSymbol(amount))}
              </div>

              <SVGIcon
                icon={SVGIcons.WALLET_HISTORY_EXPAND_COLLAPSE}
                className={`expand-collapse-icon ${
                  isExpanded ? 'open' : 'closed'
                }`}
                onClick={toggleExpandablePanel}
              />
            </div>
          </div>
          {isExpanded && (
            <div className="expanded-panel">
              <div className="recurrent-transfer-details">
                <div className="executions">
                  {chrome.i18n.getMessage(
                    'popup_html_pending_remaining_executions',
                    [remaining_executions.toString()],
                  )}
                </div>
                <div className="recurrence">
                  {chrome.i18n.getMessage('popup_html_pending_recurrence', [
                    recurrence.toString(),
                  ])}
                </div>
              </div>
              <Separator type="horizontal" />
              <div className="expandable-panel-content">
                <div
                  className="delegation-item-button delete"
                  onClick={() => cancelRecurrentTransfer()}>
                  <SVGIcon icon={SVGIcons.FAVORITE_ACCOUNTS_DELETE} />
                  <span className="label">
                    {chrome.i18n.getMessage('popup_html_button_label_cancel')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    recurrentTransfers: state.hive.recurrentTransfers,
    activeAccount: state.hive.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setErrorMessage,
  setSuccessMessage,
  navigateTo,
  fetchRecurrentTransfers,
  addToLoadingList,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const PendingRecurrentTransfersPageComponent = connector(
  PendingRecurrentTransfersPage,
);
