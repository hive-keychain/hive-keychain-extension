import { VestingDelegation } from '@hiveio/dhive';
import { navigateTo } from '@popup/actions/navigation.actions';
import { Icons } from '@popup/icons.enum';
import { Lease } from '@popup/pages/app-container/home/lease-market/lease-market.interface';
import { LeaseMarketItemComponent } from '@popup/pages/app-container/home/lease-market/tab-container/lease-item/market-item/market-item.component';
import { MyDelegationItemComponent } from '@popup/pages/app-container/home/lease-market/tab-container/lease-item/my-delegation-item/my-delegation-item.component';
import { MyLeaseItemComponent } from '@popup/pages/app-container/home/lease-market/tab-container/lease-item/my-lease-item/my-lease-item.component';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import './tab-container.component.scss';

export enum TabContainerType {
  MARKET = 'MARKET',
  MY_LEASES = 'MY_LEASES',
  MY_DELEGATIONS = 'MY_DELEGATIONS',
}

interface TabContainerProps {
  leases: Lease[] | undefined;
  hideDisplayChip?: boolean;
  displayAddButton?: boolean;
  tabType: TabContainerType;
}

const TabContainer = ({
  leases,
  displayAddButton,
  activeAccount,
  globalProperties,
  tabType,
  navigateTo,
}: PropsFromRedux) => {
  const [availableVestingShares, setAvailableVestingShares] = useState(0);
  const [outgoingDelegations, setOutgoingDelegations] = useState<
    VestingDelegation[]
  >([]);

  useEffect(() => {
    init();
  }, [activeAccount]);

  const init = async () => {
    setOutgoingDelegations(await HiveUtils.getDelegatees(activeAccount.name!));

    const totalVestingShares = parseFloat(
      activeAccount.account.vesting_shares.toString().replace(' VESTS', ''),
    );
    const outgoingVestingShares = parseFloat(
      activeAccount.account.delegated_vesting_shares
        .toString()
        .replace(' VESTS', ''),
    );

    setAvailableVestingShares(
      Math.max(
        totalVestingShares -
          outgoingVestingShares -
          FormatUtils.fromHP('5', globalProperties!),
        0,
      ),
    );
  };

  return (
    <div className="tab-container">
      {leases &&
        leases.map((lease: Lease) => {
          switch (tabType) {
            case TabContainerType.MARKET:
              return (
                <LeaseMarketItemComponent
                  key={lease.id}
                  canDelegate={lease.value <= availableVestingShares}
                  lease={lease}
                  outgoingDelegations={outgoingDelegations}
                />
              );
            case TabContainerType.MY_LEASES:
              return <MyLeaseItemComponent key={lease.id} lease={lease} />;
            case TabContainerType.MY_DELEGATIONS:
              return (
                <MyDelegationItemComponent
                  key={lease.id}
                  lease={lease}
                  outgoingDelegations={outgoingDelegations}
                />
              );
            default:
              return <span key={lease.id}>FAILED {lease.id}</span>;
          }
        })}
      {displayAddButton && (
        <div
          className="add-button"
          onClick={() => navigateTo(Screen.LEASE_MARKET_REQUEST_PAGE)}>
          <Icon type={IconType.OUTLINED} name={Icons.ADD_CIRCLE} />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    globalProperties: state.globalProperties.globals,
  };
};

const connector = connect(mapStateToProps, { navigateTo });
type PropsFromRedux = ConnectedProps<typeof connector> & TabContainerProps;

export const TabContainerComponent = connector(TabContainer);
