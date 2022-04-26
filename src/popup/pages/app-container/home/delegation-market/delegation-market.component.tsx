import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import {
  Lease,
  LeaseStatus,
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
  const [myDelegations, setMyDelegations] = useState<Lease[]>();
  const [myLeases, setMyLeases] = useState<Lease[]>();
  const [leaseMarket, setLeaseMarket] = useState<Lease[]>();
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_delegation_market',
      isBackButtonEnabled: true,
    });
    initDelegationMarket();
  }, []);

  const initDelegationMarket = async () => {
    const allLeases = await DelegationMarketUtils.downloadAllLeases();
    setLeaseMarket(
      allLeases.filter(
        (lease: Lease) =>
          lease.creator !== activeAccount.name! &&
          lease.status === LeaseStatus.PENDING,
      ),
    );
    setMyLeases(
      allLeases.filter((lease: Lease) => lease.creator === activeAccount.name!),
    );
    setMyDelegations(
      allLeases.filter(
        (lease: Lease) => lease.delegator === activeAccount.name!,
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
            leases={leaseMarket}
            hideDisplayChip
            displayAddButton
          />
        </TabPanel>
        <TabPanel>
          <TabContainerComponent leases={myLeases} displayAddButton />
        </TabPanel>
        <TabPanel>
          <TabContainerComponent leases={myDelegations} />
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
