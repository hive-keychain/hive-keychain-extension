import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { ProposalTabComponent } from '@popup/pages/app-container/home/governance/proposal-tab/proposal-tab.component';
import { ProxyTabComponent } from '@popup/pages/app-container/home/governance/proxy-tab/proxy-tab.component';
import { WitnessPageTabStepOneComponent } from '@popup/pages/app-container/home/governance/witness-page-tab/witness-page-tab-step-one/witness-page-tab-step-one.component';
import { WitnessPageTabStepTwoComponent } from '@popup/pages/app-container/home/governance/witness-page-tab/witness-page-tab-step-two/witness-page-tab-step-two.component';
import { WitnessTabComponent } from '@popup/pages/app-container/home/governance/witness-tab/witness-tab.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.scss';
import WitnessUtils from 'src/utils/witness.utils';
import './governance.component.scss';

const Governance = ({
  setTitleContainerProperties,
  activeAccount,
}: PropsFromRedux) => {
  const [witnessAccountInfo, setWitnessAccountInfo] = useState<any>();
  const [witnessPageStep, setWitnessPageStep] = useState(1);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setWitnessAccountInfo(
      await WitnessUtils.getWitnessAccountInfo(activeAccount.name!),
    );
  };

  //just to see props //TODO clean up
  useEffect(() => {
    console.log({ witnessAccountInfo });
  }, [witnessAccountInfo]);
  //end to remove

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_governance',
      isBackButtonEnabled: true,
    });
  });

  const renderWitnessPageStep = () => {
    switch (witnessPageStep) {
      case 1:
        return (
          <WitnessPageTabStepOneComponent
            witnessAccountInfo={witnessAccountInfo}
            setWitnessPageStep={setWitnessPageStep}
          />
        );
      case 2:
        return (
          <WitnessPageTabStepTwoComponent
            witnessAccountInfo={witnessAccountInfo}
            setWitnessPageStep={setWitnessPageStep}
          />
        );
    }
  };

  return (
    <div className="governance-page" aria-label="governance-page">
      <Tabs>
        <TabList
          className={`react-tabs__tab-list ${
            witnessAccountInfo ? 'make-flex' : 'make-grid'
          }`}>
          <Tab>{chrome.i18n.getMessage('popup_html_witness')}</Tab>
          <Tab>{chrome.i18n.getMessage('popup_html_proxy')}</Tab>
          <Tab>{chrome.i18n.getMessage('popup_html_proposal')}</Tab>
          {witnessAccountInfo && (
            <Tab>{chrome.i18n.getMessage('popup_html_witness_page')}</Tab>
          )}
        </TabList>
        <TabPanel>
          <WitnessTabComponent />
        </TabPanel>
        <TabPanel>
          <ProxyTabComponent />
        </TabPanel>
        <TabPanel>
          <ProposalTabComponent />
        </TabPanel>
        {witnessAccountInfo && <TabPanel>{renderWitnessPageStep()}</TabPanel>}
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
