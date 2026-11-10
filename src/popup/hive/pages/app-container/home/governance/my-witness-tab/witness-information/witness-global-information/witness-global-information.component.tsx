import { WitnessInfo } from '@interfaces/witness.interface';
import {
  ChainType,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { WitnessInfoDataComponent } from 'src/popup/hive/pages/app-container/home/governance/my-witness-tab/witness-information/witness-info-data/witness-info-data.component';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
interface WitnessGlobalInformationProps {
  witnessInfo: WitnessInfo;
}

const WitnessGlobalInformation = ({
  witnessInfo,
  currencyLabels,
}: PropsFromRedux & WitnessGlobalInformationProps) => {
  const gotoUrl = (url: string) => {
    window.open(url);
  };

  return (
    <div className="witness-global-information">
      <div className="info-panel">
        <WitnessInfoDataComponent
          label={'html_popup_witness_global_information_votes_label'}
          value={witnessInfo.votesCount}
        />
        <WitnessInfoDataComponent
          label={'html_popup_witness_information_votes_label'}
          value={`${witnessInfo.voteValueInHP} ${currencyLabels.hp}`}
        />
        <WitnessInfoDataComponent
          label={'html_popup_witness_global_information_blocks_missed_label'}
          value={witnessInfo.blockMissed}
        />
        <WitnessInfoDataComponent
          label={'html_popup_witness_global_information_last_block_label'}
          value={witnessInfo.lastBlock}
          valueOnClickAction={() => gotoUrl(witnessInfo.lastBlockUrl)}
        />
        <WitnessInfoDataComponent
          label={'html_popup_witness_global_information_price_feed_label'}
          value={witnessInfo.priceFeed}
          extraInfo={I18nUtils.getMessage(
            'html_popup_witness_global_information_updated_label',
            [witnessInfo.priceFeedUpdatedAt.fromNow()],
          )}
          extraInfoAdditionalClass={`info-last-update ${
            witnessInfo.priceFeedUpdatedAtWarning ? 'warning-red-color' : ''
          }`}
        />
        <WitnessInfoDataComponent
          label={'html_popup_witness_global_information_version_label'}
          value={witnessInfo.version}
        />
      </div>

      <div className="witness-rewards-panel">
        <div className="title">
          {I18nUtils.getMessage(
            'popup_html_witness_information_rewards_label',
          )}
        </div>
        <div className="rewards-row">
          <div className="label">
            {I18nUtils.getMessage(
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
            {I18nUtils.getMessage(
              'popup_html_witness_information_reward_panel_last_month_label',
            )}
          </div>
          <div className="hp-value">{witnessInfo.rewards.lastMonthInHP}</div>
          <div className="usd-value">
            ≈ ${witnessInfo.rewards.lastMonthInUSD}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
    currencyPrices: state.hive.currencyPrices,
    currencyLabels:
      state.chain.type === ChainType.HIVE
        ? (state.chain as HiveChain).mainTokens
        : CurrencyUtils.getCurrencyLabels(false),
    globalProperties: state.hive.globalProperties,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessGlobalInformationComponent = connector(
  WitnessGlobalInformation,
);
