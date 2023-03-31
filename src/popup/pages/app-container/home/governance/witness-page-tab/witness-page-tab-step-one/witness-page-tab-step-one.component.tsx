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
import { Icons } from '@popup/icons.enum';
import WitnessPageTabItemComponent from '@popup/pages/app-container/home/governance/witness-page-tab/witness-page-tab-item.component/witness-page-tab-item.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import ButtonComponent from 'src/common-ui/button/button.component';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import WitnessUtils from 'src/utils/witness.utils';
import './witness-page-tab-step-one.component.scss';
interface WitnessPageTabProps {
  witnessAccountInfo: any; //TODO type?
  setWitnessPageStep: React.Dispatch<React.SetStateAction<number>>;
}

const WitnessPageTabStepOne = ({
  witnessAccountInfo,
  setWitnessPageStep,
  activeAccount,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
}: PropsFromRedux & WitnessPageTabProps) => {
  //   witness information
  // amount of votes (total and number people voting)
  // block missed (today and global)
  // position (real and including inactives)
  // last block
  // price feed
  //TODO add a loading to display info.
  const [witnessInformation, setWitnessInformation] = useState<{
    rankingPosition: number;
    blockMissed: number;
    votesAmount: {
      totalVests: number;
      votesNumber: number;
    };
    last_confirmed_block_num: number;
    price_feed: {
      account_creation_fee: string;
      hbd_interest_rate: number;
    };
    rewards: {
      //TODO
    };
  }>();
  const [isExpandablePanelOpened, setExpandablePanelOpened] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    //condenser_api.get_witnesses_by_vote
    //  techcoderx stoodkev cedricguillas blocktrades
    const witnessToLookUp = activeAccount.name!;
    const witnessesByVotesTop100: any[] = await HiveTxUtils.getData(
      'condenser_api.get_witnesses_by_vote',
      ['', 100],
    );
    const totalMissedBlocksCountTop100 = witnessesByVotesTop100.reduce(
      (acc, current) => acc + current.total_missed,
      0,
    );
    //condenser_api.get_active_witnesses
    const activeWitnesses: string[] = await HiveTxUtils.getData(
      'condenser_api.get_active_witnesses',
      [],
    );
    //  first maybe lookUp into active
    let actualWitnessPosition = activeWitnesses.findIndex(
      (activeWitness) => activeWitness === witnessToLookUp,
    );
    //  if not found, then look up into witnessesByVotes
    if (actualWitnessPosition === -1) {
      actualWitnessPosition = witnessesByVotesTop100.findIndex(
        (topWitness) => topWitness.owner === witnessToLookUp,
      );
    }
    //  if not found then present info as Position: "+100"
    //  this can be done when rendering.

    //database_api.list_witness_votes
    //by_witness_account
    // const witnessVotes = await HiveTxUtils.getData(
    //   'database_api.list_witness_votes',
    //   {
    //     start: [witnessToLookUp, ''],
    //     limit: 10,
    //     order: 'by_witness_account',
    //   },
    // );

    const witnessTotalVotes = await WitnessUtils.getWitnessVoteListOrTotalVotes(
      witnessToLookUp,
    );

    console.log({
      witnessesByVotesTop100,
      totalMissedBlocksCountTop100,
      activeWitnesses,
      actualWitnessPosition: actualWitnessPosition + 1,
      witnessTotalVotes,
    });
  };

  const gotoNextPage = () => {
    setWitnessPageStep(2);
  };

  return (
    <div aria-label="witness-tab-page" className="witness-tab-page">
      <div className="text">
        {chrome.i18n.getMessage('popup_html_witness_page_text')}
      </div>
      <div className="witness-information">
        <div>Witness Information</div>
        <WitnessPageTabItemComponent
          label={'Rankings Position'}
          data={witnessAccountInfo.owner}
        />
      </div>
      <div className="page-information">
        <div className="row-line">
          <WitnessPageTabItemComponent
            label={'Owner'}
            data={witnessAccountInfo.owner}
          />
          <Icon
            name={Icons.EXPAND_MORE}
            type={IconType.OUTLINED}
            onClick={() => setExpandablePanelOpened(!isExpandablePanelOpened)}
            tooltipMessage={'popup_html_witness_page_expand_more_tooltip'}
            tooltipPosition={'bottom'}
            additionalClassName={
              isExpandablePanelOpened ? 'rotate-icon-180' : 'non-rotate-icon'
            }
          />
        </div>
        <WitnessPageTabItemComponent
          label={'Created'}
          data={witnessAccountInfo.created}
          isDate={true}
        />
        <WitnessPageTabItemComponent
          label={'Last confirmed block num'}
          data={`https://hiveblocks.com/b/${witnessAccountInfo.last_confirmed_block_num}`}
          isUrl={true}
        />
        <WitnessPageTabItemComponent
          label={'Signing key'}
          data={witnessAccountInfo.signing_key}
          extraClassName={'small-text'}
        />
        <WitnessPageTabItemComponent
          label={'Hbd exchange rate'}
          data={witnessAccountInfo.hbd_exchange_rate as Object}
        />
        <WitnessPageTabItemComponent
          label={'Available account subsidies'}
          data={witnessAccountInfo.available_witness_account_subsidies}
        />
        {isExpandablePanelOpened && (
          <div>
            <WitnessPageTabItemComponent
              label={'Id'}
              data={witnessAccountInfo.id}
            />
            <WitnessPageTabItemComponent
              label={'Votes'}
              data={witnessAccountInfo.votes}
            />
            <WitnessPageTabItemComponent
              label={'Total missed'}
              data={witnessAccountInfo.total_missed}
            />
            <WitnessPageTabItemComponent
              label={'Last hbd exchange update'}
              data={witnessAccountInfo.last_hbd_exchange_update}
              isDate={true}
            />
            <WitnessPageTabItemComponent
              label={'Running version'}
              data={witnessAccountInfo.running_version}
            />
            <WitnessPageTabItemComponent
              label={'Hardfork version vote'}
              data={witnessAccountInfo.hardfork_version_vote}
            />
            <WitnessPageTabItemComponent
              label={'Hardfork time vote'}
              data={witnessAccountInfo.hardfork_time_vote}
              isDate={true}
            />
            <WitnessPageTabItemComponent
              label={'URL'}
              data={witnessAccountInfo.url}
              isUrl={true}
            />
          </div>
        )}
      </div>
      <ButtonComponent
        label={'html_popup_button_next_step_label'}
        onClick={() => gotoNextPage()}
        additionalClass={'margin-bottom margin-top'}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessPageTabStepOneComponent = connector(WitnessPageTabStepOne);
