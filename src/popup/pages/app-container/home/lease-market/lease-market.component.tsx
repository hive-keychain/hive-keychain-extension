import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import {
  Lease,
  LeaseStatus,
} from '@popup/pages/app-container/home/lease-market/lease-market.interface';
import {
  TabContainerComponent,
  TabContainerType,
} from '@popup/pages/app-container/home/lease-market/tab-container/tab-container.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { LeaseMarketUtils } from 'src/utils/lease-market.utils';
import './lease-market.component.scss';

const REFRESH_INTERVAL = 15;

const LeaseMarket = ({
  activeAccount,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [myDelegations, setMyDelegations] = useState<Lease[]>();
  const [myLeases, setMyLeases] = useState<Lease[]>();
  const [leaseMarket, setLeaseMarket] = useState<Lease[]>();
  const [refreshCountdown, setRefreshCountdown] = useState<number>(0);
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_lease_market',
      isBackButtonEnabled: true,
    });
    initLeaseMarket();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let newCountdown = refreshCountdown + 1;

      setRefreshCountdown(newCountdown);
      if (newCountdown === REFRESH_INTERVAL) {
        initLeaseMarket();
        setRefreshCountdown(0);
      }
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [refreshCountdown]);

  const initLeaseMarket = async () => {
    const allLeases = await LeaseMarketUtils.downloadAllLeases();
    setLeaseMarket(
      allLeases.filter(
        (lease: Lease) =>
          lease.creator !== activeAccount.name! &&
          lease.status === LeaseStatus.PENDING,
      ),
    );
    setMyLeases(
      allLeases
        .filter((lease: Lease) => lease.creator === activeAccount.name!)
        .sort(LeaseMarketUtils.sortLease),
    );
    setMyDelegations(
      allLeases
        .filter((lease: Lease) => lease.delegator === activeAccount.name!)
        .sort(LeaseMarketUtils.sortLease),
    );
  };

  return (
    <div className="lease-market">
      <div className="introduction">
        {chrome.i18n.getMessage('popup_html_lease_market_introduction')}
      </div>
      {/* <ProgressBar
        completed={refreshCountdown}
        maxCompleted={REFRESH_INTERVAL}
        customLabel={chrome.i18n.getMessage('popup_html_refresh_in', [
          (REFRESH_INTERVAL - refreshCountdown).toString(),
        ])}
        labelAlignment={'outside'}
        transitionTimingFunction="linear"
        height="4px"
        bgColor="#a3112a"
        className="progress-bar-container"
        labelClassName="label"
      /> */}
      <Tabs>
        <TabList>
          <Tab>
            {chrome.i18n.getMessage('popup_html_lease_market_lease_market')}
          </Tab>
          <Tab>
            {chrome.i18n.getMessage('popup_html_lease_market_my_lease')}
          </Tab>
          <Tab>
            {chrome.i18n.getMessage('popup_html_lease_market_my_delegations')}
          </Tab>
        </TabList>
        <TabPanel>
          <TabContainerComponent
            leases={leaseMarket}
            hideDisplayChip
            displayAddButton
            tabType={TabContainerType.MARKET}
          />
        </TabPanel>
        <TabPanel>
          <TabContainerComponent
            leases={myLeases}
            displayAddButton
            tabType={TabContainerType.MY_LEASES}
          />
        </TabPanel>
        <TabPanel>
          <TabContainerComponent
            leases={myDelegations}
            tabType={TabContainerType.MY_DELEGATIONS}
          />
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

export const LeaseMarketComponent = connector(LeaseMarket);
