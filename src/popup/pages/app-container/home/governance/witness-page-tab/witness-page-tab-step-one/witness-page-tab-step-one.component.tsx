import { Transaction, Transactions } from '@interfaces/transaction.interface';
import { Witness } from '@interfaces/witness.interface';
import { refreshActiveAccount } from '@popup/actions/active-account.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { navigateToWithParams } from '@popup/actions/navigation.actions';
import { fetchAccountTransactions } from '@popup/actions/transaction.actions';
import { Icons } from '@popup/icons.enum';
import WitnessPageTabItemComponent from '@popup/pages/app-container/home/governance/witness-page-tab/witness-page-tab-item.component/witness-page-tab-item.component';
import { WalletHistoryItemComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-history-item.component';
import { RootState } from '@popup/store';
import FlatList from 'flatlist-react';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import ButtonComponent from 'src/common-ui/button/button.component';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import ArrayUtils from 'src/utils/array.utils';
import TransactionUtils, {
  NB_TRANSACTION_FETCHED,
} from 'src/utils/transaction.utils';
import WitnessUtils from 'src/utils/witness.utils';
import './witness-page-tab-step-one.component.scss';
interface WitnessPageTabProps {
  witnessAccountInfo: any; //TODO type?
  witnessRakings: any;
  setWitnessAccountInfo: React.Dispatch<any>;
  setWitnessPageStep: React.Dispatch<React.SetStateAction<number>>;
}

const MINIMUM_FETCHED_TRANSACTIONS = 1;

const WitnessPageTabStepOne = ({
  witnessAccountInfo,
  setWitnessAccountInfo,
  witnessRakings,
  setWitnessPageStep,
  activeAccount,
  transactions,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
  fetchAccountTransactions,
}: PropsFromRedux & WitnessPageTabProps) => {
  //TODO add a loading to display info, clean up
  const [isInformationPanelOpened, setIsInformationPanelOpened] =
    useState(true);
  const [isParametersPanelOpened, setIsParametersPanelOpened] = useState(false);
  const [isPropsPanelOpened, setIsPropsPanelOpened] = useState(false);
  const [isRewardPanelOpened, setIsRewardPanelOpened] = useState(false);
  const [isRewardListOpened, setIsRewardListOpened] = useState(true);

  const [witnessFullInfo, setWitnessFullInfo] = useState<{
    parameters: {
      available_witness_account_subsidies: number;
      created: string;
      hardfork_time_vote: string;
      hardfork_version_vote: string;
      hbd_exchange_rate: {
        base: string;
        quote: string;
      };
      id: string;
      last_aslot: number;
      last_confirmed_block_num: number;
      last_hbd_exchange_update: string;
      last_work: string;
      owner: string;
      pow_worker: number;
      props: {
        account_creation_fee: string;
        account_subsidy_budget: number;
        account_subsidy_decay: number;
        hbd_interest_rate: number;
        maximum_block_size: number;
      };
      running_version: string;
      signing_key: string;
      total_missed: number;
      url: string;
      virtual_last_update: string;
      virtual_position: string;
      virtual_scheduled_time: string;
      votes: string;
    };
    information: Witness;
    rewards: {
      //TODO
    };
  }>();
  const [lastTransactionIndex, setLastTransactionIndex] = useState<number>(-1);
  const [displayedTransactions, setDisplayedTransactions] = useState<
    Transaction[]
  >(transactions.list);
  const [loading, setLoading] = useState(true);
  const [previousTransactionLength, setPreviousTransactionLength] = useState(0);

  let lastOperationFetched = -1;

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    //new code
    setWitnessAccountInfo(
      await WitnessUtils.getWitnessAccountInfo(activeAccount.name!),
    );
    //end new
    lastOperationFetched = await TransactionUtils.getLastTransaction(
      activeAccount.name!,
    );
    fetchAccountTransactions(activeAccount.name!, lastOperationFetched);
  };

  useEffect(() => {
    console.log({ transactions }); //TODO to remove
    // if (transactions.lastUsedStart !== -1) {
    //   if (
    //     transactions.list.length < MINIMUM_FETCHED_TRANSACTIONS &&
    //     !transactions.list.some((t) => t.last)
    //   ) {
    //     if (transactions.lastUsedStart === 1) {
    //       setLoading(false);
    //       return;
    //     }
    //     setLoading(true);
    //     fetchAccountTransactions(
    //       activeAccount.name!,
    //       transactions.lastUsedStart - NB_TRANSACTION_FETCHED,
    //     );
    //   } else {
    //     setTimeout(() => {
    //       filterTransactions();
    //     }, 0);

    //     setLastTransactionIndex(
    //       ArrayUtils.getMinValue(transactions.list, 'index'),
    //     );
    //   }
    // }
    if (transactions.lastUsedStart !== -1) {
      if (transactions.list.length > 0) {
        //filter to get only rewards related
        const filteredRewardTransactions = transactions.list.filter(
          (transaction) => {
            return (
              transaction.type === 'claim_reward_balance' ||
              transaction.subType === 'interest'
              //   WalletHistoryUtils.filterInterest(
              //     transaction as ReceivedInterests,
              //     filter.filterValue,
              //   )) ||
              // (transaction.timestamp &&
              //   moment(transaction.timestamp)
              //     .format('L')
              //     .includes(filter.filterValue.toLowerCase()))
            );
          },
        );
        console.log({ filteredRewardTransactions }); //TODO to remove
        //get actual date & add 7 days, to compare later on
        //we add +1 so we stop on the first found on the 8th day
        const sevenPlusOneDaysBefore = moment(new Date())
          .subtract(8, 'days')
          .toISOString()
          .split('T')[0];
        console.log({ sevenPlusOneDaysBefore });
        //check last received to know if need more fecthing
        const dateLast =
          filteredRewardTransactions[filteredRewardTransactions.length - 1]
            .timestamp;
        console.log({
          dateLast,
          isIncluded: dateLast.includes(sevenPlusOneDaysBefore),
        });
        //set lastIndex doesnt matter if founded or not.
        setLastTransactionIndex(
          ArrayUtils.getMinValue(transactions.list, 'index'),
        );
        if (dateLast.includes(sevenPlusOneDaysBefore)) {
          //end loading
          //filter & gather data to calculate
          console.log('is included now what???'); //TODO to remove
          //omit last one
          filteredRewardTransactions.pop();
          console.log({ filteredRewardTransactions }); //TODO to remove
          finalizeDisplayedList(filteredRewardTransactions);
        } else {
          fetchAccountTransactions(
            activeAccount.name!,
            transactions.lastUsedStart - NB_TRANSACTION_FETCHED,
          );
        }
      }
    }
  }, [transactions]);

  useEffect(() => {
    if (
      witnessAccountInfo &&
      !!witnessRakings &&
      witnessRakings !== '' &&
      witnessRakings.find(
        (witness: any) => witness.name === activeAccount.name!,
      )
    ) {
      setWitnessFullInfo({
        parameters: witnessAccountInfo,
        information: witnessRakings.filter(
          (witness: any) => witness.name === activeAccount.name!,
        )[0],
        rewards: {},
      });
    }
  }, [witnessAccountInfo, witnessRakings]);

  const gotoNextPage = () => {
    setWitnessPageStep(2);
  };

  const getUrlBlock = (block: string | number) =>
    `https://hiveblocks.com/b/${block}`;

  const renderListItem = (transaction: Transaction) => {
    return (
      <WalletHistoryItemComponent
        ariaLabel="wallet-history-item"
        key={transaction.key}
        transaction={transaction}
      />
    );
  };

  const finalizeDisplayedList = (list: Transaction[]) => {
    console.log({ list }); //TODO to remove
    setDisplayedTransactions(list);
    setLoading(false);
  };

  const totalizeRewards = (displayedTransactions: any[]) => {
    const totalHBD = displayedTransactions.reduce(
      (acc, tr: any) => acc + parseFloat(tr.hbd.split(' ')[0]),
      0,
    );
    const totalHIVE = displayedTransactions.reduce(
      (acc, tr: any) => acc + parseFloat(tr.hive.split(' ')[0]),
      0,
    );
    const totalHP = displayedTransactions.reduce(
      (acc, tr: any) => acc + parseFloat(tr.hp.split(' ')[0]),
      0,
    );
    console.log({ totalHBD, totalHIVE, totalHP });
    return {
      totalHBD,
      totalHIVE,
      totalHP,
    };
  };

  return (
    <div aria-label="witness-tab-page" className="witness-tab-page">
      <div className="text">
        {chrome.i18n.getMessage('popup_html_witness_page_text')}
      </div>
      {witnessFullInfo && (
        <>
          <div className="witness-information">
            <div className="row-line">
              <div className="panel-title">Witness Information</div>
              <Icon
                name={Icons.EXPAND_MORE}
                type={IconType.OUTLINED}
                onClick={() =>
                  setIsInformationPanelOpened(!isInformationPanelOpened)
                }
                additionalClassName={
                  isInformationPanelOpened
                    ? 'rotate-icon-180'
                    : 'non-rotate-icon'
                }
              />
            </div>
            {isInformationPanelOpened && (
              <div>
                <hr />
                <WitnessPageTabItemComponent
                  label={'active_rank'}
                  data={witnessFullInfo.information.active_rank}
                />
                <WitnessPageTabItemComponent
                  label={'rank'}
                  data={witnessFullInfo.information.rank}
                />
                <WitnessPageTabItemComponent
                  label={'votes_count'}
                  data={witnessFullInfo.information.votes_count}
                />
                <hr />
              </div>
            )}
            <div className="row-line">
              <div className="panel-title">Witness Parameters</div>
              <Icon
                name={Icons.EXPAND_MORE}
                type={IconType.OUTLINED}
                onClick={() =>
                  setIsParametersPanelOpened(!isParametersPanelOpened)
                }
                additionalClassName={
                  isParametersPanelOpened
                    ? 'rotate-icon-180'
                    : 'non-rotate-icon'
                }
              />
            </div>
            {isParametersPanelOpened && (
              <div>
                <hr />
                <WitnessPageTabItemComponent
                  label={'available_witness_account_subsidies'}
                  data={
                    witnessFullInfo.parameters
                      .available_witness_account_subsidies
                  }
                />
                <WitnessPageTabItemComponent
                  label={'created'}
                  data={witnessFullInfo.parameters.created}
                  isDate={true}
                />
                <WitnessPageTabItemComponent
                  label={'hardfork_time_vote'}
                  data={witnessFullInfo.parameters.hardfork_time_vote}
                  isDate={true}
                />
                <WitnessPageTabItemComponent
                  label={'hardfork_version_vote'}
                  data={witnessFullInfo.parameters.hardfork_version_vote}
                />
                <div>hbd_exchange_rate</div>
                <WitnessPageTabItemComponent
                  label={'base'}
                  data={witnessFullInfo.parameters.hbd_exchange_rate.base}
                />
                <WitnessPageTabItemComponent
                  label={'quote'}
                  data={witnessFullInfo.parameters.hbd_exchange_rate.quote}
                />
                <WitnessPageTabItemComponent
                  label={'id'}
                  data={witnessFullInfo.parameters.id}
                />
                <WitnessPageTabItemComponent
                  label={'last_aslot'}
                  data={witnessFullInfo.parameters.last_aslot}
                />
                <WitnessPageTabItemComponent
                  label={'last_confirmed_block_num'}
                  data={getUrlBlock(
                    witnessFullInfo.parameters.last_confirmed_block_num,
                  )}
                  isUrl={true}
                />
                <WitnessPageTabItemComponent
                  label={'last_hbd_exchange_update'}
                  data={witnessFullInfo.parameters.last_hbd_exchange_update}
                />
                <WitnessPageTabItemComponent
                  label={'last_work'}
                  data={witnessFullInfo.parameters.last_work}
                />
                <WitnessPageTabItemComponent
                  label={'owner'}
                  data={witnessFullInfo.parameters.owner}
                />
                <WitnessPageTabItemComponent
                  label={'pow_worker'}
                  data={witnessFullInfo.parameters.pow_worker}
                />
                <hr />
              </div>
            )}
            <div className="row-line">
              <div className="panel-title">Witness Props</div>
              <Icon
                name={Icons.EXPAND_MORE}
                type={IconType.OUTLINED}
                onClick={() => setIsPropsPanelOpened(!isPropsPanelOpened)}
                additionalClassName={
                  isPropsPanelOpened ? 'rotate-icon-180' : 'non-rotate-icon'
                }
              />
            </div>
            {isPropsPanelOpened && (
              <div>
                <hr />
                <WitnessPageTabItemComponent
                  label={'account_creation_fee'}
                  data={witnessFullInfo.parameters.props.account_creation_fee}
                />
                <WitnessPageTabItemComponent
                  label={'account_subsidy_budget'}
                  data={witnessFullInfo.parameters.props.account_subsidy_budget}
                />
                <WitnessPageTabItemComponent
                  label={'account_subsidy_decay'}
                  data={witnessFullInfo.parameters.props.account_subsidy_decay}
                />
                <WitnessPageTabItemComponent
                  label={'hbd_interest_rate'}
                  data={witnessFullInfo.parameters.props.hbd_interest_rate}
                />
                <WitnessPageTabItemComponent
                  label={'maximum_block_size'}
                  data={witnessFullInfo.parameters.props.maximum_block_size}
                />
                <WitnessPageTabItemComponent
                  label={'running_version'}
                  data={witnessFullInfo.parameters.running_version}
                />
                <WitnessPageTabItemComponent
                  label={'signing_key'}
                  data={witnessFullInfo.parameters.signing_key}
                />
                <WitnessPageTabItemComponent
                  label={'total_missed'}
                  data={witnessFullInfo.parameters.total_missed}
                />
                <WitnessPageTabItemComponent
                  label={'url'}
                  data={witnessFullInfo.parameters.url}
                  isUrl={true}
                />
                <WitnessPageTabItemComponent
                  label={'virtual_last_update'}
                  data={witnessFullInfo.parameters.virtual_last_update}
                />
                <WitnessPageTabItemComponent
                  label={'virtual_position'}
                  data={witnessFullInfo.parameters.virtual_position}
                />
                <WitnessPageTabItemComponent
                  label={'virtual_scheduled_time'}
                  data={witnessFullInfo.parameters.virtual_scheduled_time}
                />
                <WitnessPageTabItemComponent
                  label={'votes'}
                  data={witnessFullInfo.parameters.votes}
                />
                <hr />
              </div>
            )}
            <div className="row-line">
              <div className="panel-title">Witness Rewards</div>
              <Icon
                name={Icons.EXPAND_MORE}
                type={IconType.OUTLINED}
                onClick={() => setIsRewardPanelOpened(!isRewardPanelOpened)}
                additionalClassName={
                  isRewardPanelOpened ? 'rotate-icon-180' : 'non-rotate-icon'
                }
              />
            </div>
            {isRewardPanelOpened && (
              <div>
                <hr />
                <div className="row-line">
                  <div>
                    <div className="panel-title">Witness Rewards 7 days</div>
                    <div className="panel-title">Totals 7 days</div>
                    <div>
                      HBD: {totalizeRewards(displayedTransactions).totalHBD}
                    </div>
                    <div>
                      HIVE: {totalizeRewards(displayedTransactions).totalHIVE}
                    </div>
                    <div>
                      HP: {totalizeRewards(displayedTransactions).totalHP}
                    </div>
                  </div>
                  <Icon
                    name={Icons.EXPAND_MORE}
                    type={IconType.OUTLINED}
                    onClick={() => setIsRewardListOpened(!isRewardListOpened)}
                    additionalClassName={
                      isRewardListOpened ? 'rotate-icon-180' : 'non-rotate-icon'
                    }
                  />
                </div>
                {isRewardListOpened && !loading && (
                  <FlatList
                    list={displayedTransactions}
                    renderItem={renderListItem}
                    renderOnScroll
                    renderWhenEmpty={() => {
                      if (loading) {
                        return <div></div>;
                      } else {
                        return (
                          <div className="empty-list">
                            <Icon
                              name={Icons.INBOX}
                              type={IconType.OUTLINED}></Icon>
                            <div className="labels">
                              <span>
                                {chrome.i18n.getMessage(
                                  'popup_html_transaction_list_is_empty',
                                )}
                              </span>
                              <span>
                                {chrome.i18n.getMessage(
                                  'popup_html_transaction_list_is_empty_try_clear_filter',
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    }}
                  />
                )}
                {loading && (
                  <div className="rotating-logo-container">
                    <RotatingLogoComponent />
                  </div>
                )}
                <hr />
              </div>
            )}
          </div>
          <ButtonComponent
            label={'html_popup_button_next_step_label'}
            onClick={() => gotoNextPage()}
            additionalClass={'margin-bottom margin-top'}
          />
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    transactions: state.transactions as Transactions,
  };
};

const connector = connect(mapStateToProps, {
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
  navigateToWithParams,
  fetchAccountTransactions,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessPageTabStepOneComponent = connector(WitnessPageTabStepOne);
