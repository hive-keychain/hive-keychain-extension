import { KeychainApi } from '@api/keychain';
import { Witness } from '@interfaces/witness.interface';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.scss';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { setErrorMessage } from 'src/popup/hive/actions/message.actions';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { MyWitnessTabComponent } from 'src/popup/hive/pages/app-container/home/governance/my-witness-tab/my-witness-tab.component';
import { ProposalTabComponent } from 'src/popup/hive/pages/app-container/home/governance/proposal-tab/proposal-tab.component';
import { ProxyTabComponent } from 'src/popup/hive/pages/app-container/home/governance/proxy-tab/proxy-tab.component';
import { WitnessTabComponent } from 'src/popup/hive/pages/app-container/home/governance/witness-tab/witness-tab.component';
import { RootState } from 'src/popup/hive/store';

const Governance = ({
  setTitleContainerProperties,
  setErrorMessage,
  activeAccount,
}: PropsFromRedux) => {
  const [isWitness, setIsWitness] = useState(false);

  const [witnessList, setWitnessList] = useState<Witness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_governance',
      isBackButtonEnabled: true,
    });
    init();
  }, []);

  const init = async () => {
    let requestResult;
    try {
      requestResult = await KeychainApi.get('hive/v2/witnesses-ranks');
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
        setHasError(true);
        throw new Error('Witness-ranks data error');
      }
    } catch (err) {
      setErrorMessage('popup_html_error_retrieving_witness_ranking');
    }
    setIsLoading(false);
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
