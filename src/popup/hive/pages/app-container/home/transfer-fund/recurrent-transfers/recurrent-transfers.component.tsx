import { PendingRecurrentTransfer } from '@interfaces/transaction.interface';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import { FormatUtils } from 'hive-keychain-commons';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

const PendingRecurrentTransfersPage = ({
  recurrentTransfers,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_recurrent_transfer',
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
}: {
  recurrentTransfer: PendingRecurrentTransfer;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpandablePanel = () => {
    setIsExpanded(!isExpanded);
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
                  //    onClick={() => cancelDelegation()}
                >
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
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const PendingRecurrentTransfersPageComponent = connector(
  PendingRecurrentTransfersPage,
);
