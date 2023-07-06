import { WitnessInfo } from '@interfaces/witness.interface';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { Icons } from 'src/common-ui/icons.enum';
import { WitnessInfoDataComponent } from 'src/popup/hive/pages/app-container/home/governance/my-witness-tab/witness-information/witness-info-data/witness-info-data.component';
import { RootState } from 'src/popup/hive/store';
import CurrencyUtils from 'src/utils/currency.utils';
import './witness-global-information.component.scss';

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
          valueIcon={Icons.OPEN_IN_NEW}
          valueOnClickAction={() => gotoUrl(witnessInfo.lastBlockUrl)}
        />
        <WitnessInfoDataComponent
          label={'html_popup_witness_global_information_price_feed_label'}
          value={witnessInfo.priceFeed}
          extraInfo={chrome.i18n.getMessage(
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
