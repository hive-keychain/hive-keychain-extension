import { Transaction, Transactions } from '@interfaces/transaction.interface';
import { WalletHistoryItemComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-history-item.component';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './wallet-history.component.scss';

interface FilterTransactionTypes {
  [key: string]: boolean;
}

const FILTER_TRANSACTION_TYPES: FilterTransactionTypes = {
  transfer: false,
};

const HAS_IN_OUT_TRANSACTIONS = ['transfer', 'delegate_vesting_shares'];

const WalletHistory = ({ transactions, activeAccountName }: PropsFromRedux) => {
  const [isFilterOpened, setIsFilterPanelOpened] = useState(false);

  const [filterValue, setFilterValue] = useState('');
  const [inSelected, setInSelected] = useState(false);
  const [outSelected, setOutSelected] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] =
    useState<FilterTransactionTypes>(FILTER_TRANSACTION_TYPES);

  const [displayedTransactions, setDisplayedTransactions] = useState<
    Transaction[]
  >(transactions.list);

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
    initFilters();
  }, []);

  useEffect(() => {
    saveFilterInLocalStorage();
    filterTransactions();
  }, [inSelected, outSelected, selectedTransactionType, transactions]);

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
    if (selectedTransactionsTypes.length === 0) {
      setDisplayedTransactions(transactions.list);
    } else {
      let filteredTransactions = transactions.list.filter(
        (transaction: Transaction) => {
          const isInOrOutSelected = inSelected || outSelected;
          if (selectedTransactionsTypes.includes(transaction.type)) {
            if (
              HAS_IN_OUT_TRANSACTIONS.includes(transaction.type) &&
              isInOrOutSelected
            ) {
              return (
                (inSelected && transaction.to === activeAccountName) ||
                (outSelected && transaction.from === activeAccountName)
              );
            } else {
              return true;
            }
          }
        },
      );
      setDisplayedTransactions(filteredTransactions);
    }
  };

  return (
    <div className="wallet-history-page">
      <PageTitleComponent
        title="popup_html_wallet_history"
        isBackButtonEnabled={true}
      />

      <div className="page-content">
        <div
          className={
            'filter-panel ' +
            (isFilterOpened ? 'filter-opened' : 'filter-closed')
          }>
          <div className="title-panel" onClick={() => toggleFilter()}>
            <div className="title">Filter</div>
            <img className={'icon'} src="/assets/images/downarrow.png" />
          </div>
          <div className="filters">
            <InputComponent
              type={InputType.TEXT}
              placeholder="popup_html_filter"
              value={filterValue}
              onChange={setFilterValue}
            />
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
                    'filter-button ' +
                    (inSelected ? 'selected' : 'not-selected')
                  }
                  onClick={() => setInSelected(!inSelected)}>
                  {chrome.i18n.getMessage(`popup_html_filter_in`)}
                </div>
                <div
                  className={
                    'filter-button ' +
                    (outSelected ? 'selected' : 'not-selected')
                  }
                  onClick={() => setOutSelected(!outSelected)}>
                  {chrome.i18n.getMessage(`popup_html_filter_out`)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {displayedTransactions.map((transaction: Transaction) => (
          <WalletHistoryItemComponent
            key={transaction.key}
            transaction={transaction}></WalletHistoryItemComponent>
        ))}
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

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WalletHistoryComponent = connector(WalletHistory);
