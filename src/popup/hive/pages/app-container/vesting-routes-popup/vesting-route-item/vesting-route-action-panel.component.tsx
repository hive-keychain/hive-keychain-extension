import { VestingRoute } from '@interfaces/vesting-routes.interface';
import React from 'react';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox/checkbox.component';

interface Props {
  item: VestingRoute;
  account: string;
  handleRevert: (account: string, item: VestingRoute) => void;
  handleIntentionalChanges: (account: string, item: VestingRoute) => void;
}

const VestingRouteActionPanel = ({
  item,
  account,
  handleIntentionalChanges,
  handleRevert,
}: Props) => {
  return (
    <div className="action-panel">
      <CheckboxComponent
        //TODO add tr
        skipTranslation
        title={'These changes are intentional'}
        checked={
          false
          // markAsIntentionalVestingRouteList.find(
          //   (item) => item.id === routeChanged.id,
          // ) !== undefined
        }
        onChange={() => handleIntentionalChanges(account, item)}
      />
      <CheckboxComponent
        //TODO add tr
        skipTranslation
        title={'Revert Changes'}
        checked={
          false
          // markAsIntentionalVestingRouteList.find(
          //   (item) => item.id === routeChanged.id,
          // ) !== undefined
        }
        onChange={() => handleRevert(account, item)}
      />
    </div>
  );
};

export const VestingRouteActionPanelComponent = VestingRouteActionPanel;
