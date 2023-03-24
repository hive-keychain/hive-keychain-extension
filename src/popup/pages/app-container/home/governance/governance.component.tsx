import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { ProposalTabComponent } from '@popup/pages/app-container/home/governance/proposal-tab/proposal-tab.component';
import { ProxyTabComponent } from '@popup/pages/app-container/home/governance/proxy-tab/proxy-tab.component';
import { WitnessPageTabComponent } from '@popup/pages/app-container/home/governance/witness-page-tab/witness-page-tab.component';
import { WitnessTabComponent } from '@popup/pages/app-container/home/governance/witness-tab/witness-tab.component';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.scss';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import './governance.component.scss';

const Governance = ({
  setTitleContainerProperties,
  activeAccount,
}: PropsFromRedux) => {
  //testing part hook //TODO to remove or clean up
  useEffect(() => {
    checkIfWitnessAccount('stoodkev'); //TODO later to be activeAccount.name!
    //the idea is checking if isWitness, so the page will be displayed.
  });

  const checkIfWitnessAccount = async (accountName: string) => {
    const witnessAccount = await HiveTxUtils.getData(
      'condenser_api.get_witness_by_account',
      [accountName],
    );
    console.log({ witnessAccount });
    // await HiveTxUtils.getData('condenser_api.get_witness_by_account', [
    //   username,
    // ]);
  };
  //end testing part

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_governance',
      isBackButtonEnabled: true,
    });
  });

  return (
    <div className="governance-page" aria-label="governance-page">
      <Tabs>
        <TabList>
          <Tab>{chrome.i18n.getMessage('popup_html_witness')}</Tab>
          <Tab>{chrome.i18n.getMessage('popup_html_proxy')}</Tab>
          <Tab>{chrome.i18n.getMessage('popup_html_proposal')}</Tab>
          {/* //TODO add bellow to locales */}
          <Tab>{chrome.i18n.getMessage('popup_html_witness_page')}</Tab>
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
        <TabPanel>
          <WitnessPageTabComponent></WitnessPageTabComponent>
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
