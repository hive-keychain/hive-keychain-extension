import { Witness } from '@interfaces/witness.interface';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import moment from 'moment';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import CurrencyUtils from 'src/utils/currency.utils';
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
  currencyLabels,
  globalProperties,
  activeAccount,
}: PropsFromRedux & WitnessGlobalInformationProps) => {
  const lastPriceFeedUpdateAgoFormat = moment(
    witnessInfo.last_hbd_exchange_update,
  )
    .startOf('hour')
    .fromNow();

  const wasUpdatedAfterThreshold = (last_hbd_exchange_update: string) => {
    const lasUpdateTimestamp = new Date(last_hbd_exchange_update).getTime();
    const lastUpdateHoursMs = Date.now() - lasUpdateTimestamp;
    let seconds = Math.floor(lastUpdateHoursMs / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    return hours > 5;
  };

  const gotoUrl = (block: string | number) => {
    window.open(`https://hiveblocks.com/b/${block}`);
  };

  return (
    <div className="witness-global-information">
      <div className="row-container">
        <div className="label-title">
          {chrome.i18n.getMessage(
            'html_popup_witness_global_information_votes_label',
          )}
        </div>
        <div>{witnessRanking.votes_count}</div>
      </div>
      <div className="row-container">
        <div className="label-title">
          {chrome.i18n.getMessage('html_popup_witness_information_votes_label')}
        </div>
        <div>{witnessInfo.votes}</div>
      </div>
      <div className="row-container">
        <div className="label-title">
          {chrome.i18n.getMessage(
            'html_popup_witness_information_vote_value_label',
          )}
        </div>
        <div>
          {FormatUtils.getVPInUSD(
            globalProperties,
            activeAccount,
            currencyPrices,
          )}{' '}
          {currencyLabels.hp}
        </div>
      </div>
      <div className="row-container">
        <div className="label-title">
          {chrome.i18n.getMessage(
            'html_popup_witness_global_information_blocks_missed_label',
          )}
        </div>
        <div>{witnessInfo.total_missed}</div>
      </div>
      <div className="row-container">
        <div className="label-title">
          {chrome.i18n.getMessage(
            'html_popup_witness_global_information_last_block_label',
          )}
        </div>
        <div
          className="data-clickeable"
          onClick={() => gotoUrl(witnessInfo.last_confirmed_block_num)}>
          {witnessInfo.last_confirmed_block_num}
          <Icon name={Icons.OPEN_IN_NEW} type={IconType.OUTLINED} />
        </div>
      </div>
      <div className="row-container">
        <div className="label-title">
          {chrome.i18n.getMessage(
            'html_popup_witness_global_information_price_feed_label',
          )}
        </div>
        <div>
          {witnessInfo.hbd_exchange_rate_base}{' '}
          {witnessInfo.hbd_exchange_rate_base_symbol}
        </div>
      </div>
      <div
        className={`info-last-update ${
          wasUpdatedAfterThreshold(witnessInfo.last_hbd_exchange_update)
            ? 'warning-red-color'
            : ''
        }`}>
        {chrome.i18n.getMessage(
          'html_popup_witness_global_information_updated_label',
        )}{' '}
        {lastPriceFeedUpdateAgoFormat}
      </div>
      <div className="row-container">
        <div className="label-title">
          {chrome.i18n.getMessage(
            'html_popup_witness_global_information_version_label',
          )}
        </div>
        <div>{witnessInfo.running_version}</div>
      </div>
      <div className="label-title centered-text">
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
          <div className="reward-column-title">{currencyLabels.hp}</div>
          <div>
            {FormatUtils.toHP(
              witnessInfo.lastWeekValue.toString(),
              globalProperties.globals!,
            ).toFixed(3)}
          </div>
          <div>
            {FormatUtils.toHP(
              witnessInfo.lastMonthValue.toString(),
              globalProperties.globals!,
            ).toFixed(3)}
          </div>
        </div>
        <div className="reward-column">
          <div className="reward-column-title">$USD</div>
          <div>
            {currencyPrices && currencyPrices.hive
              ? FormatUtils.getUSDFromVests(
                  witnessInfo.lastWeekValue,
                  3,
                  globalProperties,
                  currencyPrices,
                )
              : '...'}
          </div>
          <div>
            {currencyPrices && currencyPrices.hive
              ? FormatUtils.getUSDFromVests(
                  witnessInfo.lastMonthValue,
                  3,
                  globalProperties,
                  currencyPrices,
                )
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
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    globalProperties: state.globalProperties,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessGlobalInformationComponent = connector(
  WitnessGlobalInformation,
);
