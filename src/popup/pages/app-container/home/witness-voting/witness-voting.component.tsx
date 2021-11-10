import { WitnessVotingAddTabComponent } from '@popup/pages/app-container/home/witness-voting/witness-voting-add-tab/witness-voting-add-tab.component';
import { WitnessVotingTopHundredTabComponent } from '@popup/pages/app-container/home/witness-voting/witness-voting-top-hundred-tab/witness-voting-top-hundred-tab.component';
import { WitnessVotingVotedTabComponent } from '@popup/pages/app-container/home/witness-voting/witness-voting-voted-tab/witness-voting-voted-tab.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.scss';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import './witness-voting.component.scss';

const MAX_WITNESS_VOTE = 30;

const WitnessVoting = ({ activeAccount }: PropsFromRedux) => {
  const [remainingVotes, setRemainingVotes] = useState<string | number>('...');

  useEffect(() => {
    setRemainingVotes(
      MAX_WITNESS_VOTE - activeAccount.account.witnesses_voted_for,
    );
  }, []);

  return (
    <div className="witness-voting-page">
      <PageTitleComponent
        title="popup_html_witness_title"
        isBackButtonEnabled={true}
      />

      <div className="disclaimer">
        {chrome.i18n.getMessage('popup_html_witness_disclaimer', [
          MAX_WITNESS_VOTE,
        ])}
      </div>

      <div className="remaining-votes">
        {chrome.i18n.getMessage('popup_html_witness_remaining', [
          remainingVotes,
        ])}
      </div>

      <Tabs>
        <TabList>
          <Tab>{chrome.i18n.getMessage('popup_html_witness_voted')}</Tab>
          <Tab>{chrome.i18n.getMessage('popup_html_witness_top')}</Tab>
          <Tab>{chrome.i18n.getMessage('popup_html_witness_add')}</Tab>
        </TabList>
        <TabPanel>
          <WitnessVotingVotedTabComponent></WitnessVotingVotedTabComponent>
        </TabPanel>
        <TabPanel>
          <WitnessVotingTopHundredTabComponent></WitnessVotingTopHundredTabComponent>
        </TabPanel>
        <TabPanel>
          <WitnessVotingAddTabComponent></WitnessVotingAddTabComponent>
        </TabPanel>
      </Tabs>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessVotingComponent = connector(WitnessVoting);
