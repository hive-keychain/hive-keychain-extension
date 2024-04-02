import {
  UserVestingRoute,
  VestingRoute,
} from '@interfaces/vesting-routes.interface';
import { VestingRouteActionPanelComponent } from '@popup/hive/pages/app-container/vesting-routes-popup/vesting-route-item/vesting-route-action-panel.component';
import React from 'react';

interface Props {
  userVestingRoute: UserVestingRoute;
  //   account: string;
  //   item: VestingRoute;
  //   handleRevert: (account: string, item: VestingRoute) => void;
  //   handleIntentionalChanges: (account: string, item: VestingRoute) => void;
  //   preFixKey: string;
}

const VestingRouteItem = ({
  userVestingRoute,
}: //   item,
//   account,
//   handleIntentionalChanges,
//   handleRevert,
//   preFixKey,
Props) => {
  const handleRevert = (account: string, vestingRoute: VestingRoute) => {
    console.log('//TODO revert for item', { account, vestingRoute });
  };

  const handleIntentionalChanges = (
    account: string,
    routeChanged: VestingRoute,
  ) => {
    //TODO what it should happen here is, we save this vesting route in local storage
    // //TODO while testing the displaying is commented, TO add later on
    // VestingRoutesUtils.saveLastVestingRoutes(currentVestingRoutes);

    console.log('//TODO mark to skip for item', { account, routeChanged });
    // const foundInList = markAsIntentionalVestingRouteList.find(
    //   (item) => item.id === routeChanged.id,
    // );
    // let tempList = [...markAsIntentionalVestingRouteList];
    // if (foundInList) {
    //   // setMarkAsIntentionalVestingRouteList(tempList.filter(item => item.id !== routeChanged.id));
    //   tempList = tempList.filter((item) => item.id !== routeChanged.id);
    // } else {
    //   tempList.push(routeChanged);
    // }
    // setMarkAsIntentionalVestingRouteList(tempList);
  };

  const renderVestingItem = (
    vestingRoute: VestingRoute,
    index: number,
    account: string,
  ) => {
    return (
      <div
        className="display-content"
        key={`${vestingRoute.id}-vesting-route-${index}`}>
        <div className="title">Id: {vestingRoute.id}</div>
        <div className="title">fromAccount: {vestingRoute.fromAccount}</div>
        <div className="title">toAccount: {vestingRoute.toAccount}</div>
        <div className="title">percent: {vestingRoute.percent}</div>
        <div className="title">
          autoVest: {vestingRoute.autoVest.toString()}
        </div>
        <VestingRouteActionPanelComponent
          key={`${vestingRoute.id}-action-panel-${index}`}
          item={vestingRoute}
          account={account}
          handleRevert={handleRevert}
          handleIntentionalChanges={handleIntentionalChanges}
        />
      </div>
    );
  };

  //TODO add to tr
  return (
    <div
      className={`carousel-item`}
      key={`${userVestingRoute.account}-vesting-routes`}>
      <div className="title">Account: @{userVestingRoute.account}</div>
      <div
        className="vesting-item"
        key={`${userVestingRoute.account}-vesting-item`}>
        <div
          className="vesting-item-row"
          key={`${userVestingRoute.account}-vesting-item-row`}>
          <div
            className="vesting-route-item flex-align-left"
            key={`${userVestingRoute.account}-vesting-itemrow-left`}>
            <div className="title">Old Route</div>
            {userVestingRoute.routesChanged ? (
              userVestingRoute.routesChanged.map((oldRoute, i) =>
                renderVestingItem(oldRoute, i, userVestingRoute.account),
              )
            ) : (
              <div
                className="title"
                key={`${userVestingRoute.account}-non-existent-title`}>
                Non existent!
              </div>
            )}
          </div>
          <div
            className="vesting-route-item flex-align-right"
            key={`${userVestingRoute.account}-vesting-itemrow-right`}>
            <div className="title">New Route</div>
            {userVestingRoute.routes.map((newRoute, i) =>
              renderVestingItem(newRoute, i, userVestingRoute.account),
            )}
          </div>
        </div>
      </div>
    </div>
  );

  //   return (
  //     <div
  //       className="display-content"
  //       key={`${account}${item.id}-vesting-route-${preFixKey}`}>
  //       <div className="title">Id: {item.id}</div>
  //       <div className="title">fromAccount: {item.fromAccount}</div>
  //       <div className="title">toAccount: {item.toAccount}</div>
  //       <div className="title">percent: {item.percent}</div>
  //       <div className="title">autoVest: {item.autoVest.toString()}</div>
  //       <VestingRouteActionPanelComponent
  //         key={`${account}-${item.id}-action-panel-${preFixKey}`}
  //         item={item}
  //         account={account}
  //         handleRevert={handleRevert}
  //         handleIntentionalChanges={handleIntentionalChanges}
  //       />
  //     </div>
  //   );
};

export const VestinRouteItemComponent = VestingRouteItem;
