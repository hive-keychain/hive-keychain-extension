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
import { RootState, store } from '@popup/store';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
//TODO change scss name file & check
import { Witness } from '@interfaces/witness.interface';
import { Icons } from '@popup/icons.enum';
import moment from 'moment';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import FormatUtils from 'src/utils/format.utils';
import './witness-global-information.component.scss';

interface WitnessGlobalInformationProps {
  witnessRanking: Witness;
  witnessInfo: any;
}

const WitnessGlobalInformation = ({
  witnessRanking,
  witnessInfo,
  currencyPrices,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
  fetchAccountTransactions,
}: PropsFromRedux & WitnessGlobalInformationProps) => {
  //TODO clean up & finish

  const lastPriceFeedUpdate = moment(witnessInfo.last_hbd_exchange_update)
    .startOf('hour')
    .fromNow();

  const passedUpdateHoursThreshold =
    lastPriceFeedUpdate.match(/[1-9][0-9]|[6-9]/);

  const gotoUrl = (block: string | number) => {
    chrome.tabs.create({ url: `https://hiveblocks.com/b/${block}` });
  };

  const getUSDFromVests = (vestAmount: Number, decimals: number = 3) =>
    (
      FormatUtils.toHP(
        vestAmount.toString(),
        store.getState().globalProperties.globals!,
      ) * currencyPrices.hive.usd!
    ).toFixed(decimals);

  return (
    <div className="witness-global-information">
      <div className="row-container">
        <div className="label-title">Amount of votes</div>
        <div>{witnessRanking.votes_count}</div>
      </div>
      <div className="row-container">
        <div className="label-title">Block missed</div>
        <div>{witnessInfo.total_missed}</div>
      </div>
      <div className="row-container">
        <div className="label-title">Last block</div>
        <div
          className="data-clickeable"
          onClick={() => gotoUrl(witnessInfo.last_confirmed_block_num)}>
          {witnessInfo.last_confirmed_block_num}
          <Icon name={Icons.OPEN_IN_NEW} type={IconType.OUTLINED} />
        </div>
      </div>
      <div className="row-container">
        <div className="label-title">Price feed</div>
        <div>
          {witnessInfo.hbd_exchange_rate_base}{' '}
          {witnessInfo.hbd_exchange_rate_base_symbol}
        </div>
      </div>
      <div
        className={`info-last-update ${
          passedUpdateHoursThreshold ? 'warning-red-color' : ''
        }`}>
        Updated {lastPriceFeedUpdate}
      </div>
      <div className="row-container">
        <div className="label-title">Version</div>
        <div>{witnessInfo.running_version}</div>
      </div>
      <div className="title centered-text">
        {chrome.i18n.getMessage('popup_html_witness_information_rewards_label')}
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
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
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

export const WitnessGlobalInformationComponent = connector(
  WitnessGlobalInformation,
);
