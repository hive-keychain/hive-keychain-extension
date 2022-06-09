import { VestingDelegation } from '@hiveio/dhive';
import { navigateTo } from '@popup/actions/navigation.actions';
import { Icons } from '@popup/icons.enum';
import { Lease } from '@popup/pages/app-container/home/lease-request/lease-market.interface';
import { LeaseItemComponent } from '@popup/pages/app-container/home/lease-request/tab-container/lease-item/lease-item.component';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import './tab-container.component.scss';

interface TabContainerProps {
  leases: Lease[] | undefined;
  hideDisplayChip?: boolean;
  displayAddButton?: boolean;
}

const TabContainer = ({
  leases,
  hideDisplayChip,
  displayAddButton,
  activeAccount,
  globalProperties,
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
        leases.map((lease: Lease) => (
          <LeaseItemComponent
            key={lease.id}
            lease={lease}
            hideDisplayChip={hideDisplayChip}
            outgoingDelegations={outgoingDelegations}
            canDelegate={lease.value <= availableVestingShares}
          />
        ))}
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
