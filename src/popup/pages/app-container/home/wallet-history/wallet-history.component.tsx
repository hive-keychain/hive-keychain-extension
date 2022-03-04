import {
  ClaimReward,
  Delegation,
  Transaction,
  Transactions,
  Transfer,
} from '@interfaces/transaction.interface';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import {
  fetchAccountTransactions,
  initAccountTransactions,
} from '@popup/actions/transaction.actions';
import { Icons } from '@popup/icons.enum';
import { WalletHistoryItemComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-history-item.component';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import FlatList from 'flatlist-react';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import ArrayUtils from 'src/utils/array.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import TransactionUtils, {
  HAS_IN_OUT_TRANSACTIONS,
  TRANSFER_TYPE_TRANSACTIONS,
} from 'src/utils/transaction.utils';
import { WalletHistoryUtils } from 'src/utils/wallet-history.utils';
import './wallet-history.component.scss';

type FilterTransactionTypes = {
  [key: string]: boolean;
};

const FILTER_TRANSACTION_TYPES: FilterTransactionTypes = {
  transfer: false,
  claim_reward_balance: false,
  delegate_vesting_shares: false,
};

const WalletHistory = ({
  transactions,
  activeAccountName,
  initAccountTransactions,
  fetchAccountTransactions,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [isFilterOpened, setIsFilterPanelOpened] = useState(false);
  let lastOperationFetched = -1;

  const [filterValue, setFilterValue] = useState('');
  const [inSelected, setInSelected] = useState(false);
  const [outSelected, setOutSelected] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] =
    useState<FilterTransactionTypes>(FILTER_TRANSACTION_TYPES);

  const [displayedTransactions, setDisplayedTransactions] = useState<
    Transaction[]
  >(transactions.list);

  const [lastTransactionIndex, setLastTransactionIndex] = useState<number>(-1);

  const [idToScrollTo, setIdToScrollTo] = useState<string>();

  const toggleFilter = () => {
    setIsFilterPanelOpened(!isFilterOpened);
  };

  const toggleFilterType = (transactionName: string) => {
    const newValue = !selectedTransactionType[transactionName];
    setSelectedTransactionType({
      ...selectedTransactionType,
      [transactionName]: newValue,
    });
  };

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setTitleContainerProperties({
      title: 'popup_html_wallet_history',
      isBackButtonEnabled: true,
    });
    lastOperationFetched = await TransactionUtils.getLastTransaction(
      activeAccountName!,
    );
    console.log(lastOperationFetched);
    fetchAccountTransactions(activeAccountName!, lastOperationFetched);
    initFilters();
  };

  useEffect(() => {
    setDisplayedTransactions(transactions.list);
    setTimeout(() => {
      filterTransactions();
    }, 0);
    setLastTransactionIndex(ArrayUtils.getMinValue(transactions.list, 'index'));
    setTimeout(() => {
      if (idToScrollTo) {
        document.getElementById(idToScrollTo)?.scrollIntoView();
      }
    }, 1000);
  }, [transactions]);

  useEffect(() => {
    saveFilterInLocalStorage();
    filterTransactions();
  }, [inSelected, outSelected, selectedTransactionType, filterValue]);

  const initFilters = async () => {
    const filters = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.WALLET_HISTORY_FILTERS,
    );
    if (filters) {
      setSelectedTransactionType({
        ...FILTER_TRANSACTION_TYPES,
        ...filters.types,
      });
      setInSelected(filters.in);
      setOutSelected(filters.out);
    }
  };

  const saveFilterInLocalStorage = () => {
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.WALLET_HISTORY_FILTERS,
      { types: selectedTransactionType, in: inSelected, out: outSelected },
    );
  };

  const filterTransactions = () => {
    const selectedTransactionsTypes = Object.keys(
      selectedTransactionType,
    ).filter((transactionName) => selectedTransactionType[transactionName]);
    let filteredTransactions = transactions.list.filter(
      (transaction: Transaction) => {
        const isInOrOutSelected = inSelected || outSelected;
        if (
          selectedTransactionsTypes.includes(transaction.type) ||
          selectedTransactionsTypes.length === 0
        ) {
          if (
            HAS_IN_OUT_TRANSACTIONS.includes(transaction.type) &&
            isInOrOutSelected
          ) {
            return (
              (inSelected &&
                ((TRANSFER_TYPE_TRANSACTIONS.includes(transaction.type) &&
                  (transaction as Transfer).to === activeAccountName) ||
                  (transaction.type === 'delegate_vesting_shares' &&
                    (transaction as Delegation).delegatee ===
                      activeAccountName))) ||
              (outSelected &&
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
            filterValue,
            activeAccountName!,
          )) ||
        (transaction.type === 'claim_reward_balance' &&
          WalletHistoryUtils.filterClaimReward(
            transaction as ClaimReward,
            filterValue,
          )) ||
        (transaction.timestamp &&
          moment(transaction.timestamp)
            .format('L')
            .includes(filterValue.toLowerCase()))
      );
    });
    setDisplayedTransactions(filteredTransactions);
  };

  const clearFilters = () => {
    setFilterValue('');
    setInSelected(false);
    setOutSelected(false);
    setSelectedTransactionType(FILTER_TRANSACTION_TYPES);
  };

  const renderListItem = (transaction: Transaction) => {
    return (
      <WalletHistoryItemComponent
        key={transaction.key}
        transaction={transaction}></WalletHistoryItemComponent>
    );
  };

  const tryToLoadMore = () => {
    setIdToScrollTo(`index-${lastTransactionIndex}`);
    fetchAccountTransactions(activeAccountName!, lastTransactionIndex);
  };

  const handleScroll = (event: any) => {
    if (
      event.target.scrollHeight - event.target.scrollTop ===
      event.target.clientHeight
    ) {
      tryToLoadMore();
    }
  };

  return (
    <div className="wallet-history-page">
      <div
        className={
          'filter-panel ' + (isFilterOpened ? 'filter-opened' : 'filter-closed')
        }>
        <div className="title-panel" onClick={() => toggleFilter()}>
          <div className="title">Filter</div>
          <img className={'icon'} src="/assets/images/downarrow.png" />
        </div>
        <div className="filters">
          <div className="search-panel">
            <InputComponent
              type={InputType.TEXT}
              placeholder="popup_html_search"
              value={filterValue}
              onChange={setFilterValue}
            />
            <div className={'filter-button'} onClick={() => clearFilters()}>
              {chrome.i18n.getMessage(`popup_html_clear_filters`)}
            </div>
          </div>
          <div className="filter-selectors">
            <div className="types">
              {selectedTransactionType &&
                Object.keys(selectedTransactionType).map(
                  (filterOperationType) => (
                    <div
                      key={filterOperationType}
                      className={
                        'filter-button ' +
                        (selectedTransactionType[filterOperationType]
                          ? 'selected'
                          : 'not-selected')
                      }
                      onClick={() => toggleFilterType(filterOperationType)}>
                      {chrome.i18n.getMessage(
                        `popup_html_filter_type_${filterOperationType}`,
                      )}
                    </div>
                  ),
                )}
            </div>
            <div className="vertical-divider"></div>
            <div className="in-out-panel">
              <div
                className={
                  'filter-button ' + (inSelected ? 'selected' : 'not-selected')
                }
                onClick={() => setInSelected(!inSelected)}>
                {chrome.i18n.getMessage(`popup_html_filter_in`)}
              </div>
              <div
                className={
                  'filter-button ' + (outSelected ? 'selected' : 'not-selected')
                }
                onClick={() => setOutSelected(!outSelected)}>
                {chrome.i18n.getMessage(`popup_html_filter_out`)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wallet-item-list" onScroll={handleScroll}>
        <FlatList
          list={displayedTransactions}
          renderItem={renderListItem}
          // renderOnScroll
        />
        {!transactions.loading &&
          transactions.list[transactions.list.length - 1].last === false && (
            <div className="load-more-panel" onClick={tryToLoadMore}>
              <span className="label">
                {chrome.i18n.getMessage('popup_html_load_more')}
              </span>
              <Icon name={Icons.ADD_CIRCLE} type={IconType.OUTLINED}></Icon>
            </div>
          )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    transactions: state.transactions as Transactions,
    activeAccountName: state.activeAccount.name,
  };
};

const connector = connect(mapStateToProps, {
  initAccountTransactions,
  fetchAccountTransactions,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WalletHistoryComponent = connector(WalletHistory);
