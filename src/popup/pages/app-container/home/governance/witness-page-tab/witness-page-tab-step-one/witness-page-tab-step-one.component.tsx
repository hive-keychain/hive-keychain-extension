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
  witnessRakings: any;
  setWitnessAccountInfo: React.Dispatch<any>;
  setWitnessPageStep: React.Dispatch<
    React.SetStateAction<{
      page: number;
      props?: any;
    }>
  >;
}

const WitnessPageTabStepOne = ({
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
  //TODO clean up, waiting review

  const [isLoading, setIsLoading] = useState(true);

  const [witnessInfo, setWitnessInfo] = useState<any>();
  const [witnessRanking, setWitnessRanking] = useState<Witness>();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setIsLoading(true);
    let requestResult;
    try {
      requestResult = await KeychainApi.get(
        `hive/witness/${activeAccount.name!}`,
      );
      console.log({ requestResult }); //TODO to remove
      if (!!requestResult && requestResult !== '') {
        setWitnessInfo(requestResult);
        setIsLoading(false);
      } else {
        throw new Error('Witness-info data error');
      }
    } catch (err) {
      setErrorMessage('popup_html_error_retrieving_witness_information');
    }
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
    setWitnessPageStep({ page: 2, props: witnessInfo });
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

  return (
    <div className="witness-tab-page-step-one">
      {!isLoading && witnessRanking && witnessInfo && (
        <div className="padding-bottom">
          <div className="text">
            {chrome.i18n.getMessage('popup_html_witness_page_text')}
          </div>
          <hr />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_owner_label'}
            data={`https://peakd.com/@${witnessInfo.name}`}
            isUrl={true}
          />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_votes_count_label'}
            data={witnessInfo.votes_count}
          />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_active_rank_label'}
            data={witnessRanking.active_rank}
          />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_rank_label'}
            data={witnessRanking.rank}
          />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_created_label'}
            data={witnessInfo.created}
            isDate={true}
          />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_total_missed_label'}
            data={witnessInfo.total_missed}
          />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_last_aslot_label'}
            data={witnessInfo.last_aslot}
          />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_last_confirmed_block_label'}
            data={getUrlBlock(witnessInfo.last_confirmed_block_num)}
            isUrl={true}
          />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_signing_key_label'}
            data={witnessInfo.signing_key}
          />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_fee_label'}
            data={`${witnessInfo.account_creation_fee} ${witnessInfo.account_creation_fee_symbol}`}
          />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_maximum_block_size_label'}
            data={witnessInfo.maximum_block_size}
          />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_hbd_interest_rate_label'}
            data={witnessInfo.hbd_interest_rate}
          />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_exchange_rate_base_label'}
            data={`${witnessInfo.hbd_exchange_rate_base} ${witnessInfo.hbd_exchange_rate_base_symbol}`}
          />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_exchange_rate_quote_label'}
            data={`${witnessInfo.hbd_exchange_rate_quote} ${witnessInfo.hbd_exchange_rate_quote_symbol}`}
          />
          <WitnessPageTabItemComponent
            label={
              'popup_html_witness_information_last_hbd_exchange_update_label'
            }
            data={witnessInfo.last_hbd_exchange_update}
            isDate={true}
          />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_running_version_label'}
            data={witnessInfo.running_version}
          />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_hardfork_version_vote_label'}
            data={witnessInfo.hardfork_version_vote}
          />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_hardfork_time_vote_label'}
            data={witnessInfo.hardfork_time_vote}
            isDate={true}
          />
          <WitnessPageTabItemComponent
            label={'popup_html_witness_information_url_label'}
            data={witnessInfo.url}
            isUrl={true}
          />
          <hr />
          <div className="title centered-text">
            {chrome.i18n.getMessage(
              'popup_html_witness_information_rewards_label',
            )}
          </div>
          <div className="witness-rewards-panel">
            <div className="reward-column">
              <div className="reward-column-title">
                {chrome.i18n.getMessage(
                  'popup_html_witness_information_reward_panel_time_frame_label',
                )}
              </div>
              <div className="reward-column-title">
                {chrome.i18n.getMessage(
                  'popup_html_witness_information_reward_panel_last_week_label',
                )}
              </div>
              <div className="reward-column-title">
                {chrome.i18n.getMessage(
                  'popup_html_witness_information_reward_panel_last_month_label',
                )}
              </div>
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
            </div>
          </div>
          <hr />
          <ButtonComponent
            label={'html_popup_button_next_step_label'}
            onClick={() => gotoNextPage()}
          />
        </div>
      )}
      {isLoading && (
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
