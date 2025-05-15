import { VscHistoryItemComponent } from '@popup/hive/pages/app-container/home/vsc/vsc-history/vsc-history-item/vsc-history-item.component';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import FlatList from 'flatlist-react';
import { VscHistoryItem, VscUtils } from 'hive-keychain-commons';
import React, { useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { BackToTopButton } from 'src/common-ui/back-to-top-button/back-to-top-button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import Config from 'src/config';

const VscHistory = ({
  activeAccountName,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [transactions, setTransactions] = useState<VscHistoryItem[]>();

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

  const renderListItem = (transaction: VscHistoryItem) => {
    return (
      <VscHistoryItemComponent
        key={transaction.txId}
        username={`hive:${activeAccountName!}`}
        transaction={transaction}
      />
    );
  };

  const handleScroll = (event: any) => {
    setDisplayedScrollToTop(event.target.scrollTop !== 0);
  };

  return (
    <div
      className="vsc-history-page"
      data-testid={`${Screen.VSC_HISTORY_PAGE}-page`}>
      <div
        data-testid="vsc-item-list"
        ref={vscItemList}
        className="vsc-item-list"
        onScroll={handleScroll}>
        <p className="vsc-history-intro">
          {chrome.i18n.getMessage('popup_html_vsc_full_history')}
          <a
            href={`${Config.vsc.BLOCK_EXPLORER}/@${activeAccountName}`}
            target="_blank">
            {' '}
            {chrome.i18n.getMessage(
              'popup_html_vsc_full_history_block_explorer',
            )}
          </a>
        </p>
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
