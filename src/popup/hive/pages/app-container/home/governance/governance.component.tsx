import { KeychainApi } from '@api/keychain';
import { Witness } from '@interfaces/witness.interface';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { Tab, TabsComponent } from 'src/common-ui/tabs/tabs.component';
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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [tabs, setTabs] = useState<Tab[]>([]);

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
      console.log(requestResult);
      if (!!requestResult && requestResult !== '') {
        const ranking: Witness[] = requestResult;

        const tempTabs: Tab[] = [
          {
            title: 'popup_html_witness',
            content: (
              <WitnessTabComponent ranking={ranking} hasError={hasError} />
            ),
          },
          {
            title: 'popup_html_proxy',
            content: <ProxyTabComponent />,
          },
          {
            title: 'popup_html_proposal',
            content: <ProposalTabComponent />,
          },
        ];
        if (
          ranking &&
          ranking.length > 0 &&
          ranking.find((witness) => witness.name === activeAccount.name!) !==
            undefined
        ) {
          tempTabs.push({
            title: 'popup_html_my_witness_page',
            content: <MyWitnessTabComponent ranking={ranking} />,
          });
        }
        setTabs(tempTabs);
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
      {!isLoading && <TabsComponent tabs={tabs} />}
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
