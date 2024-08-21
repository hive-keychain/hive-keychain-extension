import { Transaction } from '@interfaces/transaction.interface';
import { VscCall, VscTransfer } from '@interfaces/vsc.interface';
import { VscUtils } from '@popup/hive/utils/vsc.utils';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import FlatList from 'flatlist-react';
import React, { useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { BackToTopButton } from 'src/common-ui/back-to-top-button/back-to-top-button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { WalletHistoryItemComponent } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history-item/wallet-history-item.component';

const VscHistory = ({
  activeAccountName,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  let lastOperationFetched = -1;

  const [transactions, setTransactions] = useState<(VscTransfer | VscCall)[]>();

  const [displayScrollToTop, setDisplayedScrollToTop] = useState(false);

  const vscItemList = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setTitleContainerProperties({
      title: 'popup_html_vsc_history',
      isBackButtonEnabled: true,
    });

    setLoading(true);
    const transactions = await VscUtils.getOrganizedHistory(activeAccountName!);
    setTransactions(transactions);
    setLoading(false);
  };

  const renderListItem = (transaction: Transaction) => {
    return (
      <WalletHistoryItemComponent
        ariaLabel="wallet-history-item"
        key={transaction.key}
        transaction={transaction}></WalletHistoryItemComponent>
    );
  };

  const handleScroll = (event: any) => {
    setDisplayedScrollToTop(event.target.scrollTop !== 0);
  };

  return (
    <div
      className="wallet-history-page"
      data-testid={`${Screen.WALLET_HISTORY_PAGE}-page`}>
      <div
        data-testid="wallet-item-list"
        ref={vscItemList}
        className="wallet-item-list"
        onScroll={handleScroll}>
        <FlatList
          list={transactions}
          renderItem={renderListItem}
          renderOnScroll
          renderWhenEmpty={() => {
            if (loading) {
              return <div></div>;
            } else {
              return (
                <div className="empty-history-panel">
                  <SVGIcon icon={SVGIcons.MESSAGE_ERROR} />
                  <div className="text">
                    <div>
                      {chrome.i18n.getMessage(
                        'popup_html_transaction_list_is_empty',
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          }}
        />
        {loading && (
          <div className="rotating-logo-container">
            <RotatingLogoComponent></RotatingLogoComponent>
          </div>
        )}
      </div>
      {displayScrollToTop && <BackToTopButton element={vscItemList} />}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccountName: state.hive.activeAccount.name,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const VscHistoryComponent = connector(VscHistory);
