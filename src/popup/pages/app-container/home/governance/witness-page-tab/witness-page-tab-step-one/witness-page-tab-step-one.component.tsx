import { KeychainApi } from '@api/keychain';
import { Transactions } from '@interfaces/transaction.interface';
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
import WitnessPageTabItemComponent from '@popup/pages/app-container/home/governance/witness-page-tab/witness-page-tab-item.component/witness-page-tab-item.component';
import { RootState, store } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import ButtonComponent from 'src/common-ui/button/button.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import FormatUtils from 'src/utils/format.utils';
import './witness-page-tab-step-one.component.scss';
interface WitnessPageTabProps {
  witnessAccountInfo: any; //TODO type?
  witnessRakings: any;
  setWitnessAccountInfo: React.Dispatch<any>;
  setWitnessPageStep: React.Dispatch<React.SetStateAction<number>>;
}

const MINIMUM_FETCHED_TRANSACTIONS = 1;

const WitnessPageTabStepOne = ({
  witnessAccountInfo, //TODO needed??
  setWitnessAccountInfo,
  witnessRakings,
  setWitnessPageStep,
  activeAccount,
  transactions,
  currencyPrices,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
  fetchAccountTransactions,
}: PropsFromRedux & WitnessPageTabProps) => {
  //TODO add a loading to display info, clean up

  const [loading, setLoading] = useState(true);

  const [witnessInfo, setWitnessInfo] = useState<any>();
  const [witnessRanking, setWitnessRanking] = useState<Witness>();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    //using BE
    let requestResult;
    try {
      requestResult = await KeychainApi.get(
        `hive/witness/${activeAccount.name!}`,
      );
      console.log({ requestResult }); //TODO to remove
      if (!!requestResult && requestResult !== '') {
        setWitnessInfo(requestResult);
        setLoading(false);
      } else {
        throw new Error('Witness-info data error');
      }
    } catch (err) {
      //TODO add locale
      setErrorMessage('popup_html_error_retrieving_witness_ranking');
      // setHasError(true);
    }
    //end using BE
  };

  useEffect(() => {
    if (
      !!witnessRakings &&
      witnessRakings !== '' &&
      witnessRakings.find(
        (witness: any) => witness.name === activeAccount.name!,
      )
    ) {
      setWitnessRanking(
        witnessRakings.filter(
          (witness: any) => witness.name === activeAccount.name!,
        )[0],
      );
    }
  }, [witnessRakings]);

  const gotoNextPage = () => {
    setWitnessPageStep(2);
  };

  const getUrlBlock = (block: string | number) =>
    `https://hiveblocks.com/b/${block}`;

  const getUSDFromVests = (vestAmount: Number, decimals: number = 3) =>
    (
      FormatUtils.toHP(
        vestAmount.toString(),
        store.getState().globalProperties.globals!,
      ) * currencyPrices.hive.usd!
    ).toFixed(decimals);

  //sample code
  const response = {
    lastWeekValue: 4461098.410653,
    lastMonthValue: 19787660.631344,
    lastYearValue: 229322533.648884,
    allValue: 4461098.410653,
    timestamp: '2023-04-04T09:38:33.000Z',
    name: 'stoodkev',
    votes_count: 9899,
    created: '2018-01-24T03:55:09.000Z',
    url: 'https://peakd.com/witness-category/@stoodkev/witness-update-running-v1-24-2',
    votes: '134536006413411484',
    total_missed: 552,
    last_aslot: '73921971',
    last_confirmed_block_num: '73707495',
    signing_key: 'STM7wEZ2Sj1embiofddWjkRHDDA5EZfcEPmdLN7Pbc4X8afrRCX9n',
    account_creation_fee: 1,
    account_creation_fee_symbol: 'HIVE',
    maximum_block_size: 65536,
    hbd_interest_rate: 2000,
    hbd_exchange_rate_base: 0.404,
    hbd_exchange_rate_base_symbol: 'HBD',
    hbd_exchange_rate_quote: 1,
    hbd_exchange_rate_quote_symbol: 'HIVE',
    last_hbd_exchange_update: '2023-04-04T09:06:54.000Z',
    running_version: '1.27.3',
    hardfork_version_vote: '1.27.0',
    hardfork_time_vote: '2022-10-24T12:00:00.000Z',
  };
  ///end sample

  return (
    <div aria-label="witness-tab-page" className="witness-tab-page">
      <div className="text">
        {chrome.i18n.getMessage('popup_html_witness_page_text')}
      </div>
      {!loading && witnessRanking && witnessInfo && (
        <>
          <WitnessPageTabItemComponent
            label={'Owner'}
            data={witnessInfo.name}
          />
          <WitnessPageTabItemComponent
            label={'Votes Count'}
            data={witnessInfo.votes_count}
          />
          <WitnessPageTabItemComponent
            label={'Active Rank'}
            data={witnessRanking.active_rank}
          />
          <WitnessPageTabItemComponent
            label={'Rank'}
            data={witnessRanking.rank}
          />
          <WitnessPageTabItemComponent
            label={'Created'}
            data={witnessInfo.created}
            isDate={true}
          />
          <WitnessPageTabItemComponent
            label={'total_missed'}
            data={witnessInfo.total_missed}
          />
          <WitnessPageTabItemComponent
            label={'last_aslot'}
            data={witnessInfo.last_aslot}
          />
          <WitnessPageTabItemComponent
            label={'last_confirmed_block_num'}
            data={getUrlBlock(witnessInfo.last_confirmed_block_num)}
            isUrl={true}
          />
          <WitnessPageTabItemComponent
            label={'signing_key'}
            data={witnessInfo.signing_key}
          />
          <WitnessPageTabItemComponent
            label={'Fee'}
            data={`${witnessInfo.account_creation_fee} ${witnessInfo.account_creation_fee_symbol}`}
          />
          <WitnessPageTabItemComponent
            label={'maximum_block_size'}
            data={witnessInfo.maximum_block_size}
          />
          <WitnessPageTabItemComponent
            label={'hbd_interest_rate'}
            data={witnessInfo.hbd_interest_rate}
          />
          <WitnessPageTabItemComponent
            label={'Exchange rate base'}
            data={`${witnessInfo.hbd_exchange_rate_base} ${witnessInfo.hbd_exchange_rate_base_symbol}`}
          />
          <WitnessPageTabItemComponent
            label={'Exchange rate quote'}
            data={`${witnessInfo.hbd_exchange_rate_quote} ${witnessInfo.hbd_exchange_rate_quote_symbol}`}
          />
          <WitnessPageTabItemComponent
            label={'last_hbd_exchange_update'}
            data={witnessInfo.last_hbd_exchange_update}
            isDate={true}
          />
          <WitnessPageTabItemComponent
            label={'running_version'}
            data={witnessInfo.running_version}
          />
          <WitnessPageTabItemComponent
            label={'hardfork_version_vote'}
            data={witnessInfo.hardfork_version_vote}
          />
          <WitnessPageTabItemComponent
            label={'hardfork_time_vote'}
            data={witnessInfo.hardfork_time_vote}
            isDate={true}
          />
          <div className="witness-rewards-panel">
            <div className="reward-column">
              <div className="reward-column-title">Time frame</div>
              <div className="reward-column-title">Last Week Value</div>
              <div className="reward-column-title">Last Month Value</div>
              <div className="reward-column-title">Last Year Value</div>
              <div className="reward-column-title">All Time value</div>
            </div>
            <div className="reward-column">
              <div className="reward-column-title">HP</div>
              <div>
                {FormatUtils.toHP(
                  witnessInfo.lastWeekValue.toString(),
                  store.getState().globalProperties.globals!,
                ).toFixed(3)}
              </div>
              <div>
                {FormatUtils.toHP(
                  witnessInfo.lastMonthValue.toString(),
                  store.getState().globalProperties.globals!,
                ).toFixed(3)}
              </div>
              <div>
                {FormatUtils.toHP(
                  witnessInfo.lastYearValue.toString(),
                  store.getState().globalProperties.globals!,
                ).toFixed(3)}
              </div>
              <div>
                {FormatUtils.toHP(
                  witnessInfo.allValue.toString(),
                  store.getState().globalProperties.globals!,
                ).toFixed(3)}
              </div>
            </div>
            <div className="reward-column">
              <div className="reward-column-title">$USD</div>
              <div>
                {currencyPrices && currencyPrices.hive
                  ? getUSDFromVests(witnessInfo.lastWeekValue.toString(), 3)
                  : '...'}
              </div>
              <div>
                {currencyPrices && currencyPrices.hive
                  ? getUSDFromVests(witnessInfo.lastMonthValue.toString(), 3)
                  : '...'}
              </div>
              <div>
                {currencyPrices && currencyPrices.hive
                  ? getUSDFromVests(witnessInfo.lastYearValue.toString(), 3)
                  : '...'}
              </div>
              <div>
                {currencyPrices && currencyPrices.hive
                  ? getUSDFromVests(witnessInfo.allValue.toString(), 3)
                  : '...'}
              </div>
            </div>
          </div>
          <ButtonComponent
            label={'html_popup_button_next_step_label'}
            onClick={() => gotoNextPage()}
            additionalClass={'margin-bottom margin-top'}
          />
        </>
      )}
      {loading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    transactions: state.transactions as Transactions,
    currencyPrices: state.currencyPrices,
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
