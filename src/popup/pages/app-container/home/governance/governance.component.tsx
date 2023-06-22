import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { ProposalTabComponent } from '@popup/pages/app-container/home/governance/proposal-tab/proposal-tab.component';
import { ProxyTabComponent } from '@popup/pages/app-container/home/governance/proxy-tab/proxy-tab.component';
import { WitnessTabComponent } from '@popup/pages/app-container/home/governance/witness-tab/witness-tab.component';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.scss';
import './governance.component.scss';

const Governance = ({ setTitleContainerProperties }: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_governance',
      isBackButtonEnabled: true,
    });
  });

  return (
    <div
      className={'governance-page'}
      data-testid={`${Screen.GOVERNANCE_PAGE}-page`}>
      <Tabs>
        <TabList>
          <Tab>{chrome.i18n.getMessage('popup_html_witness')}</Tab>
          <Tab>{chrome.i18n.getMessage('popup_html_proxy')}</Tab>
          <Tab>{chrome.i18n.getMessage('popup_html_proposal')}</Tab>
        </TabList>
        <TabPanel>
          <WitnessTabComponent></WitnessTabComponent>
        </TabPanel>
        <TabPanel>
          <ProxyTabComponent></ProxyTabComponent>
        </TabPanel>
        <TabPanel>
          <ProposalTabComponent></ProposalTabComponent>
        </TabPanel>
      </Tabs>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const GovernanceComponent = connector(Governance);
