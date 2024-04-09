import {
  ClaimReward,
  CollateralizedConvert,
  Convert,
  Delegation,
  DepositSavings,
  FillCollateralizedConvert,
  FillConvert,
  PowerDown,
  PowerUp,
  ReceivedInterests,
  Transaction,
  Transactions,
  Transfer,
  WithdrawSavings,
} from '@interfaces/transaction.interface';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import FlatList from 'flatlist-react';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { BackToTopButton } from 'src/common-ui/back-to-top-button/back-to-top-button.component';
import ButtonComponent from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { fetchAccountTransactions } from 'src/popup/hive/actions/transaction.actions';
import { WalletHistoryItemComponent } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history-item/wallet-history-item.component';
import TransactionUtils, {
  HAS_IN_OUT_TRANSACTIONS,
  NB_TRANSACTION_FETCHED,
  TRANSFER_TYPE_TRANSACTIONS,
} from 'src/popup/hive/utils/transaction.utils';
import { WalletHistoryUtils } from 'src/popup/hive/utils/wallet-history.utils';
import ArrayUtils from 'src/utils/array.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

type FilterTransactionTypes = {
  [key: string]: boolean;
};

export const DEFAULT_FILTER: WalletHistoryFilter = {
  filterValue: '',
  inSelected: false,
  outSelected: false,
  selectedTransactionTypes: {
    transfer: false,
    claim_reward_balance: false,
    delegate_vesting_shares: false,
    claim_account: false,
    savings: false,
    power_up_down: false,
    convert: false,
  },
};
const MINIMUM_FETCHED_TRANSACTIONS = 1;

export type WalletHistoryFilter = {
  filterValue: string;
  inSelected: boolean;
  outSelected: boolean;
  selectedTransactionTypes: FilterTransactionTypes;
};

const WalletHistory = ({
  transactions,
  activeAccountName,
  fetchAccountTransactions,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [isFilterOpened, setIsFilterPanelOpened] = useState(false);
  let lastOperationFetched = -1;

  const [filter, setFilter] = useState<WalletHistoryFilter>(DEFAULT_FILTER);
  const [filterReady, setFilterReady] = useState<boolean>(false);

  const [displayedTransactions, setDisplayedTransactions] = useState<
    Transaction[]
  >(transactions.list);

  const [lastTransactionIndex, setLastTransactionIndex] = useState<number>(-1);

  const [displayScrollToTop, setDisplayedScrollToTop] = useState(false);

  const walletItemList = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);

  const [previousTransactionLength, setPreviousTransactionLength] = useState(0);

  const toggleFilter = () => {
    setIsFilterPanelOpened((oldState) => {
      return !oldState;
    });
  };

  const toggleFilterType = (transactionName: string) => {
    const newFilter = {
      ...filter?.selectedTransactionTypes,
      [transactionName]: !filter?.selectedTransactionTypes![transactionName],
    };
    updateFilter({
      ...filter,
      selectedTransactionTypes: newFilter,
    });
  };

  const toggleFilterIn = () => {
    const newFilter = {
      ...filter,
      inSelected: !filter.inSelected,
    };
    updateFilter(newFilter);
  };

  const toggleFilterOut = () => {
    const newFilter = {
      ...filter,
      outSelected: !filter.outSelected,
    };
    updateFilter(newFilter);
  };

  const updateFilterValue = (value: string) => {
    const newFilter = {
      ...filter,
      filterValue: value,
    };
    updateFilter(newFilter);
  };

  const updateFilter = (filter: any) => {
    setFilter(filter);
    setTimeout(() => {
      walletItemList?.current?.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }, 200);
  };

  useEffect(() => {
    init();
  }, []);

  const finalizeDisplayedList = (list: Transaction[]) => {
    setDisplayedTransactions(list);
    setLoading(false);
  };

  const init = async () => {
    setTitleContainerProperties({
      title: 'popup_html_wallet_history',
      isBackButtonEnabled: true,
      rightAction: {
        icon: SVGIcons.WALLET_HISTORY_FILTER_BUTTON,
        callback: toggleFilter,
        className: 'wallet-filter-button',
      },
    });

    lastOperationFetched = await TransactionUtils.getLastTransaction(
      activeAccountName!,
    );
    setLoading(true);
    fetchAccountTransactions(activeAccountName!, lastOperationFetched);
    initFilters();
  };

  useEffect(() => {
    if (transactions.lastUsedStart !== -1) {
      if (
        transactions.list.length < MINIMUM_FETCHED_TRANSACTIONS &&
        !transactions.list.some((t) => t.last)
      ) {
        if (transactions.lastUsedStart === 1) {
          setLoading(false);
          return;
        }
        setLoading(true);
        fetchAccountTransactions(
          activeAccountName!,
          transactions.lastUsedStart - NB_TRANSACTION_FETCHED,
        );
      } else {
        setTimeout(() => {
          filterTransactions();
        }, 0);

        setLastTransactionIndex(
          ArrayUtils.getMinValue(transactions.list, 'index'),
        );
      }
    }
  }, [transactions]);

  const initFilters = async () => {
    const filter = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.WALLET_HISTORY_FILTERS,
    );

    if (filter) {
      setFilter(filter);
    }
    setFilterReady(true);
  };

  useEffect(() => {
    setPreviousTransactionLength(0);
    if (filterReady) {
      filterTransactions();
      saveFilterInLocalStorage();
    }
  }, [filter]);

  const saveFilterInLocalStorage = () => {
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.WALLET_HISTORY_FILTERS,
      filter,
    );
  };

  const filterTransactions = () => {
    const selectedTransactionsTypes = Object.keys(
      filter.selectedTransactionTypes,
    ).filter(
      (transactionName) => filter.selectedTransactionTypes[transactionName],
    );
    let filteredTransactions = transactions.list.filter(
      (transaction: Transaction) => {
        const isInOrOutSelected = filter.inSelected || filter.outSelected;
        if (
          selectedTransactionsTypes.includes(transaction.type) ||
          selectedTransactionsTypes.length === 0
        ) {
          if (
            HAS_IN_OUT_TRANSACTIONS.includes(transaction.type) &&
            isInOrOutSelected
          ) {
            return (
              (filter.inSelected &&
                ((TRANSFER_TYPE_TRANSACTIONS.includes(transaction.type) &&
                  (transaction as Transfer).to === activeAccountName) ||
                  (transaction.type === 'delegate_vesting_shares' &&
                    (transaction as Delegation).delegatee ===
                      activeAccountName))) ||
              (filter.outSelected &&
                ((TRANSFER_TYPE_TRANSACTIONS.includes(transaction.type) &&
                  (transaction as Transfer).from === activeAccountName) ||
                  (transaction.type === 'delegate_vesting_shares' &&
                    (transaction as Delegation).delegator ===
                      activeAccountName)))
            );
          } else {
            return true;
          }
        }
      },
    );
    filteredTransactions = filteredTransactions.filter((transaction) => {
      return (
        (TRANSFER_TYPE_TRANSACTIONS.includes(transaction.type) &&
          WalletHistoryUtils.filterTransfer(
            transaction as Transfer,
            filter.filterValue,
            activeAccountName!,
          )) ||
        (transaction.type === 'claim_reward_balance' &&
          WalletHistoryUtils.filterClaimReward(
            transaction as ClaimReward,
            filter.filterValue,
          )) ||
        (transaction.type === 'delegate_vesting_shares' &&
          WalletHistoryUtils.filterDelegation(
            transaction as Delegation,
            filter.filterValue,
            activeAccountName!,
          )) ||
        (transaction.subType === 'withdraw_vesting' &&
          WalletHistoryUtils.filterPowerUpDown(
            transaction as PowerDown,
            filter.filterValue,
          )) ||
        (transaction.subType === 'transfer_to_vesting' &&
          WalletHistoryUtils.filterPowerUpDown(
            transaction as PowerUp,
            filter.filterValue,
          )) ||
        (transaction.subType === 'transfer_from_savings' &&
          WalletHistoryUtils.filterSavingsTransaction(
            transaction as WithdrawSavings,
            filter.filterValue,
          )) ||
        (transaction.subType === 'transfer_to_savings' &&
          WalletHistoryUtils.filterSavingsTransaction(
            transaction as DepositSavings,
            filter.filterValue,
          )) ||
        (transaction.subType === 'interest' &&
          WalletHistoryUtils.filterInterest(
            transaction as ReceivedInterests,
            filter.filterValue,
          )) ||
        (transaction.subType === 'fill_collateralized_convert_request' &&
          WalletHistoryUtils.filterFillConversion(
            transaction as FillCollateralizedConvert,
            filter.filterValue,
          )) ||
        (transaction.subType === 'fill_convert_request' &&
          WalletHistoryUtils.filterFillConversion(
            transaction as FillConvert,
            filter.filterValue,
          )) ||
        (transaction.subType === 'collateralized_convert' &&
          WalletHistoryUtils.filterConversion(
            transaction as CollateralizedConvert,
            filter.filterValue,
          )) ||
        (transaction.subType === 'convert' &&
          WalletHistoryUtils.filterConversion(
            transaction as Convert,
            filter.filterValue,
          )) ||
        (transaction.timestamp &&
          moment(transaction.timestamp)
            .format('L')
            .includes(filter.filterValue.toLowerCase()))
      );
    });

    if (
      (filteredTransactions.length >= MINIMUM_FETCHED_TRANSACTIONS &&
        filteredTransactions.length >= previousTransactionLength + 1) ||
      transactions.list.some((t) => t.last) ||
      transactions.lastUsedStart === 0
    ) {
      finalizeDisplayedList(filteredTransactions);
    } else {
      setLoading(true);
      fetchAccountTransactions(
        activeAccountName!,
        transactions.lastUsedStart - NB_TRANSACTION_FETCHED,
      );
    }
  };

  const clearFilters = () => {
    setFilter(DEFAULT_FILTER);
    setTimeout(() => {
      walletItemList?.current?.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }, 200);
  };

  const renderListItem = (transaction: Transaction) => {
    return (
      <WalletHistoryItemComponent
        ariaLabel="wallet-history-item"
        key={transaction.key}
        transaction={transaction}></WalletHistoryItemComponent>
    );
  };

  const tryToLoadMore = () => {
    if (loading) return;
    setPreviousTransactionLength(displayedTransactions.length);
    setLoading(true);
    fetchAccountTransactions(
      activeAccountName!,
      Math.min(
        lastTransactionIndex,
        transactions.lastUsedStart - NB_TRANSACTION_FETCHED,
      ),
    );
  };

  const handleScroll = (event: any) => {
    if (
      transactions.list[transactions.list.length - 1]?.last === true ||
      transactions.lastUsedStart === 0
    )
      return;
    setDisplayedScrollToTop(event.target.scrollTop !== 0);

    if (
      event.target.scrollHeight - event.target.scrollTop ===
      event.target.clientHeight
    ) {
      tryToLoadMore();
    }
  };

  return (
    <div
      className="wallet-history-page"
      data-testid={`${Screen.WALLET_HISTORY_PAGE}-page`}>
      <div
        data-testid="wallet-history-filter-panel"
        className={
          'filter-panel ' + (isFilterOpened ? 'filter-opened' : 'filter-closed')
        }>
        <div className="filters">
          <div className="search-panel">
            <InputComponent
              dataTestId="input-filter-box"
              type={InputType.TEXT}
              placeholder="popup_html_search"
              value={filter.filterValue}
              onChange={updateFilterValue}
              logo={SVGIcons.INPUT_SEARCH}
              logoPosition="right"
            />
          </div>
          <div className="filter-selectors">
            <div className="types">
              {filter.selectedTransactionTypes &&
                Object.keys(filter.selectedTransactionTypes).map(
                  (filterOperationType) => (
                    <div
                      data-testid={`filter-selector-${filterOperationType}`}
                      key={filterOperationType}
                      className={
                        'filter-button ' +
                        (filter.selectedTransactionTypes[filterOperationType]
                          ? 'selected'
                          : 'not-selected')
                      }
                      onClick={() => toggleFilterType(filterOperationType)}>
                      {chrome.i18n.getMessage(
                        `popup_html_filter_type_${filterOperationType}`,
                      )}{' '}
                    </div>
                  ),
                )}
            </div>
            <Separator type="horizontal" fullSize />
            <div className="in-out-panel">
              <div
                data-testid="filter-by-incoming"
                className={
                  'filter-button ' +
                  (filter.inSelected ? 'selected' : 'not-selected')
                }
                onClick={() => toggleFilterIn()}>
                {chrome.i18n.getMessage(`popup_html_filter_in`)}
              </div>
              <div
                data-testid="filter-by-outgoing"
                className={
                  'filter-button ' +
                  (filter.outSelected ? 'selected' : 'not-selected')
                }
                onClick={() => toggleFilterOut()}>
                {chrome.i18n.getMessage(`popup_html_filter_out`)}
              </div>
            </div>
          </div>
          <ButtonComponent
            data-testid="clear-filters"
            onClick={() => clearFilters()}
            label="popup_html_clear_filters"
            height="small"
          />
        </div>
      </div>

      <div
        data-testid="wallet-item-list"
        ref={walletItemList}
        className="wallet-item-list"
        onScroll={handleScroll}>
        <FlatList
          list={displayedTransactions}
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
                    <div>
                      {chrome.i18n.getMessage(
                        'popup_html_transaction_list_is_empty_try_clear_filter',
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          }}
        />
        {transactions.list[transactions.list.length - 1]?.last === false &&
          transactions.lastUsedStart !== 0 &&
          !loading && (
            <div className="load-more-panel" onClick={tryToLoadMore}>
              <span className="label">
                {chrome.i18n.getMessage('popup_html_load_more')}
              </span>
              <SVGIcon icon={SVGIcons.GLOBAL_ADD_CIRCLE}></SVGIcon>
            </div>
          )}
        {loading && (
          <div className="rotating-logo-container">
            <RotatingLogoComponent></RotatingLogoComponent>
          </div>
        )}
      </div>
      {displayScrollToTop && <BackToTopButton element={walletItemList} />}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    transactions: state.hive.transactions as Transactions,
    activeAccountName: state.hive.activeAccount.name,
  };
};

const connector = connect(mapStateToProps, {
  fetchAccountTransactions,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WalletHistoryComponent = connector(WalletHistory);
