import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import {
  DelegationRequest,
  DelegationRequestStatus,
} from '@popup/pages/app-container/home/delegation-market/delegation-market.interface';
import { TabContainerComponent } from '@popup/pages/app-container/home/delegation-market/tab-container/tab-container.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { DelegationMarketUtils } from 'src/utils/delegation-market.utils';
import './delegation-market.component.scss';

const DelegationMarket = ({
  activeAccount,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [myDelegations, setMyDelegations] = useState<DelegationRequest[]>();
  const [myLeases, setMyLeases] = useState<DelegationRequest[]>();
  const [leaseMarket, setLeaseMarket] = useState<DelegationRequest[]>();
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_delegation_market',
      isBackButtonEnabled: true,
    });
    initDelegationMarket();
  }, []);

  const initDelegationMarket = async () => {
    const allDelegations = await DelegationMarketUtils.downloadAllProposals();
    setLeaseMarket(
      allDelegations.filter(
        (delegationRequest: DelegationRequest) =>
          delegationRequest.creator !== activeAccount.name! &&
          delegationRequest.status === DelegationRequestStatus.PENDING,
      ),
    );
    setMyLeases(
      allDelegations.filter(
        (delegationRequest: DelegationRequest) =>
          delegationRequest.creator === activeAccount.name!,
      ),
    );
    setMyDelegations(
      allDelegations.filter(
        (delegationRequest: DelegationRequest) =>
          delegationRequest.delegator === activeAccount.name!,
      ),
    );
  };

  return (
    <div className="delegation-market">
      <div className="introduction">
        {chrome.i18n.getMessage('popup_html_delegation_market_introduction')}
      </div>
      <Tabs>
        <TabList>
          <Tab>
            {chrome.i18n.getMessage(
              'popup_html_delegation_market_leave_market',
            )}
          </Tab>
          <Tab>
            {chrome.i18n.getMessage('popup_html_delegation_market_my_lease')}
          </Tab>
          <Tab>
            {chrome.i18n.getMessage(
              'popup_html_delegation_market_my_delegations',
            )}
          </Tab>
        </TabList>
        <TabPanel>
          <TabContainerComponent
            delegationRequests={leaseMarket}
            hideDisplayChip
            displayAddButton
          />
        </TabPanel>
        <TabPanel>
          <TabContainerComponent
            delegationRequests={myLeases}
            displayAddButton
          />
        </TabPanel>
        <TabPanel>
          <TabContainerComponent delegationRequests={myDelegations} />
        </TabPanel>
      </Tabs>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const DelegationMarketComponent = connector(DelegationMarket);
