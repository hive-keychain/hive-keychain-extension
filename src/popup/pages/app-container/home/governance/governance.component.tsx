import { Witness } from '@interfaces/witness.interface';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { ProposalTabComponent } from '@popup/pages/app-container/home/governance/proposal-tab/proposal-tab.component';
import { ProxyTabComponent } from '@popup/pages/app-container/home/governance/proxy-tab/proxy-tab.component';
import { WitnessPageTabStepOneComponent } from '@popup/pages/app-container/home/governance/witness-page-tab/witness-page-tab-step-one/witness-page-tab-step-one.component';
import { WitnessPageTabStepTwoComponent } from '@popup/pages/app-container/home/governance/witness-page-tab/witness-page-tab-step-two/witness-page-tab-step-two.component';
import { WitnessTabComponent } from '@popup/pages/app-container/home/governance/witness-tab/witness-tab.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.scss';
import './governance.component.scss';

const Governance = ({
  setTitleContainerProperties,
  activeAccount,
}: PropsFromRedux) => {
  const [witnessAccountInfo, setWitnessAccountInfo] = useState<any>();

  const [witnessPageStep, setWitnessPageStep] = useState(1);
  const [witnessRakings, setWitnessRakings] = useState<Witness[]>([]);
  const [isWitness, setIsWitness] = useState(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_governance',
      isBackButtonEnabled: true,
    });
  });

  useEffect(() => {
    setIsWitness(
      witnessRakings &&
        witnessRakings.length > 0 &&
        witnessRakings.find(
          (witness) => witness.name === activeAccount.name!,
        ) !== undefined,
    );
  }, [witnessRakings]);

  const renderWitnessPageStep = () => {
    switch (witnessPageStep) {
      case 1:
        return (
          <WitnessPageTabStepOneComponent
            witnessAccountInfo={witnessAccountInfo}
            setWitnessAccountInfo={setWitnessAccountInfo}
            witnessRakings={witnessRakings}
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
            isWitness ? 'make-flex' : 'make-grid'
          }`}>
          <Tab>{chrome.i18n.getMessage('popup_html_witness')}</Tab>
          <Tab>{chrome.i18n.getMessage('popup_html_proxy')}</Tab>
          <Tab>{chrome.i18n.getMessage('popup_html_proposal')}</Tab>
          {isWitness && (
            <Tab>{chrome.i18n.getMessage('popup_html_my_witness_page')}</Tab>
          )}
        </TabList>
        <TabPanel>
          <WitnessTabComponent setWitnessRakings={setWitnessRakings} />
        </TabPanel>
        <TabPanel>
          <ProxyTabComponent />
        </TabPanel>
        <TabPanel>
          <ProposalTabComponent />
        </TabPanel>
        {isWitness && <TabPanel>{renderWitnessPageStep()}</TabPanel>}
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
