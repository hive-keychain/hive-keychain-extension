import { KeychainApi } from '@api/keychain';
import { Witness } from '@interfaces/witness.interface';
import { setErrorMessage } from '@popup/actions/message.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { MyWitnessTabComponent } from '@popup/pages/app-container/home/governance/my-witness-tab/my-witness-tab.component';
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
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import './governance.component.scss';

const Governance = ({
  setTitleContainerProperties,
  setErrorMessage,
  activeAccount,
}: PropsFromRedux) => {
  const [witnessAccountInfo, setWitnessAccountInfo] = useState<any>();

  const [witnessPageStep, setWitnessPageStep] = useState<{
    page: number;
    props?: any;
  }>({
    page: 1,
  });
  const [witnessRakings, setWitnessRakings] = useState<Witness[]>([]);
  const [isWitness, setIsWitness] = useState(false);

  const [witnessList, setWitnessList] = useState<Witness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_governance',
      isBackButtonEnabled: true,
    });
    initWitnessList();
  }, []);

  const initWitnessList = async () => {
    let requestResult;
    try {
      requestResult = await KeychainApi.get('hive/v2/witnesses-ranks');
      console.log({ requestResult }); //TODO to remove
      if (!!requestResult && requestResult !== '') {
        const ranking: Witness[] = requestResult;
        setWitnessList(ranking);
        setIsWitness(
          ranking &&
            ranking.length > 0 &&
            ranking.find((witness) => witness.name === activeAccount.name!) !==
              undefined,
        );
      } else {
        throw new Error('Witness-ranks data error');
      }
    } catch (err) {
      setErrorMessage('popup_html_error_retrieving_witness_ranking');
    }
    setIsLoading(false);
  };

  const renderWitnessPageStep = () => {
    switch (witnessPageStep.page) {
      case 1:
        return (
          <WitnessPageTabStepOneComponent
            setWitnessAccountInfo={setWitnessAccountInfo}
            witnessRakings={witnessRakings}
            setWitnessPageStep={setWitnessPageStep}
          />
        );
      case 2:
        return (
          <WitnessPageTabStepTwoComponent
            witnessInfo={witnessPageStep.props}
            setWitnessPageStep={setWitnessPageStep}
          />
        );
    }
  };

  return (
    <div className="governance-page" aria-label="governance-page">
      {!isLoading && (
        <Tabs>
          <TabList
            className={`react-tabs__tab-list ${
              isWitness ? 'four-items' : 'three-items'
            }`}>
            <Tab>{chrome.i18n.getMessage('popup_html_witness')}</Tab>
            <Tab>{chrome.i18n.getMessage('popup_html_proxy')}</Tab>
            <Tab>{chrome.i18n.getMessage('popup_html_proposal')}</Tab>
            {isWitness && (
              <Tab>{chrome.i18n.getMessage('popup_html_my_witness_page')}</Tab>
            )}
          </TabList>
          <TabPanel>
            <WitnessTabComponent ranking={witnessList} hasError={hasError} />
          </TabPanel>
          <TabPanel>
            <ProxyTabComponent />
          </TabPanel>
          <TabPanel>
            <ProposalTabComponent />
          </TabPanel>
          {/* //TODO important -> remove old components
              -> witness-page-tab
              -> witness-page-tab-step-one
              -> witness-page-tab-step-two
          */}
          {/* {isWitness && <TabPanel>{renderWitnessPageStep()}</TabPanel>} */}
          {isWitness && (
            <TabPanel>
              <MyWitnessTabComponent ranking={witnessList} />
            </TabPanel>
          )}
        </Tabs>
      )}
      {isLoading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const GovernanceComponent = connector(Governance);
