import { Witness, WitnessInfo } from '@interfaces/witness.interface';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import CurrencyUtils from 'src/utils/currency.utils';
import './witness-global-information.component.scss';

interface WitnessGlobalInformationProps {
  witnessRanking: Witness;
  witnessInfo: WitnessInfo;
}

const WitnessGlobalInformation = ({
  witnessRanking,
  witnessInfo,
  currencyPrices,
  currencyLabels,
  globalProperties,
}: PropsFromRedux & WitnessGlobalInformationProps) => {
  const gotoUrl = (url: string) => {
    window.open(url);
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
        <div>
          {witnessInfo.voteValueInHP} {currencyLabels.hp}
        </div>
      </div>
      <div className="row-container">
        <div className="label-title">
          {chrome.i18n.getMessage(
            'html_popup_witness_global_information_blocks_missed_label',
          )}
        </div>
        <div>{witnessInfo.blockMissed}</div>
      </div>
      <div className="row-container">
        <div className="label-title">
          {chrome.i18n.getMessage(
            'html_popup_witness_global_information_last_block_label',
          )}
        </div>
        <div
          className="data-clickeable"
          onClick={() => gotoUrl(witnessInfo.lastBlockUrl)}>
          {witnessInfo.lastBlock}
          <Icon name={Icons.OPEN_IN_NEW} type={IconType.OUTLINED} />
        </div>
      </div>
      <div className="row-container">
        <div className="label-title">
          {chrome.i18n.getMessage(
            'html_popup_witness_global_information_price_feed_label',
          )}
        </div>
        <div>{witnessInfo.priceFeed}</div>
      </div>
      <div
        className={`info-last-update ${
          witnessInfo.priceFeedUpdatedAtWarning ? 'warning-red-color' : ''
        }`}>
        {chrome.i18n.getMessage(
          'html_popup_witness_global_information_updated_label',
        )}{' '}
        {witnessInfo.priceFeedUpdatedAt.startOf('hour').fromNow()}
      </div>
      <div className="row-container">
        <div className="label-title">
          {chrome.i18n.getMessage(
            'html_popup_witness_global_information_version_label',
          )}
        </div>
        <div>{witnessInfo.version}</div>
      </div>

      <div className="witness-rewards-panel">
        <div className="title">
          {chrome.i18n.getMessage(
            'popup_html_witness_information_rewards_label',
          )}
        </div>
        <div className="rewards-row">
          <div className="label">
            {chrome.i18n.getMessage(
              'popup_html_witness_information_reward_panel_last_week_label',
            )}
          </div>
          <div className="hp-value">{witnessInfo.rewards.lastWeekInHP}</div>
          <div className="usd-value">
            ≈ ${witnessInfo.rewards.lastWeekInUSD}
          </div>
        </div>
        <div className="rewards-row">
          <div className="label">
            {chrome.i18n.getMessage(
              'popup_html_witness_information_reward_panel_last_month_label',
            )}
          </div>
          <div className="hp-value">{witnessInfo.rewards.lastMonthInHP}</div>
          <div className="usd-value">
            ≈ ${witnessInfo.rewards.lastMonthInUSD}
          </div>
        </div>
        {/* <div className="reward-column">
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
                  2,
                  globalProperties,
                  currencyPrices,
                )
              : '...'}
          </div>
          <div>
            {currencyPrices && currencyPrices.hive
              ? FormatUtils.getUSDFromVests(
                  witnessInfo.lastMonthValue,
                  2,
                  globalProperties,
                  currencyPrices,
                )
              : '...'}
          </div>
        </div> */}
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
