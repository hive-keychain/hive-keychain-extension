import {
  UserVestingRoute,
  VestingRoute,
} from '@interfaces/vesting-routes.interface';
import { refreshActiveAccount } from '@popup/hive/actions/active-account.actions';
import { RootState } from '@popup/hive/store';
import { VestingRoutesUtils } from '@popup/hive/utils/vesting-routes.utils';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';

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
  refreshActiveAccount,
}: //   item,
//   account,
//   handleIntentionalChanges,
//   handleRevert,
//   preFixKey,
Props & PropsFromRedux) => {
  const { account, routes, routesChanged } = userVestingRoute;
  console.log({ account, routes, routesChanged }); //TODO remove line

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

  // const renderVestingItem = (
  //   // vestingRoute: VestingRoute,
  //   // index: number,
  //   // account: string,
  //   userVestinRoute: UserVestingRoute,
  // ) => {
  //   return (
  //     <div
  //       className="display-content"
  //       key={`${vestingRoute.id}-vesting-route-${index}`}>
  //       <div className="title">Id: {vestingRoute.id}</div>
  //       <div className="title">fromAccount: {vestingRoute.fromAccount}</div>
  //       <div className="title">toAccount: {vestingRoute.toAccount}</div>
  //       <div className="title">percent: {vestingRoute.percent}</div>
  //       <div className="title">
  //         autoVest: {vestingRoute.autoVest.toString()}
  //       </div>
  //       <VestingRouteActionPanelComponent
  //         key={`${vestingRoute.id}-action-panel-${index}`}
  //         item={vestingRoute}
  //         account={account}
  //         handleRevert={handleRevert}
  //         handleIntentionalChanges={handleIntentionalChanges}
  //       />
  //     </div>
  //   );
  // };

  const handleSelect = async (
    option: string,
    account: string,
    route: VestingRoute,
    action: 'add' | 'remove',
  ) => {
    //'default' | 'skipAndSave' | 'revert'
    if (option === 'default') return;
    if (option === 'skipAndSave') {
      const tempLastVestingRoutes =
        await VestingRoutesUtils.getLastVestingRoutes();
      if (action === 'add') {
        const foundLast = tempLastVestingRoutes?.find(
          (lastRoute) => lastRoute.account === account,
        );
        if (foundLast?.routes.length === 0) {
          foundLast.routes.push(route);
        }
      } else {
        //TODO keep working on this...
      }
      console.log({ tempLastVestingRoutes }); //TODO remove line
      await VestingRoutesUtils.saveLastVestingRoutes(tempLastVestingRoutes!);
      //TODO here, remove from initial display array or find a better way to reload the app, ask cedric!!!
      refreshActiveAccount();
    }
  };

  const renderActionOptions = (
    acc: string,
    route: VestingRoute,
    action: 'add' | 'remove',
  ) => {
    return (
      <select
        className="mandatory-select-option"
        onChange={(e) => handleSelect(e.target.value, acc, route, action)}>
        <option
          defaultChecked
          defaultValue={'default'}
          label="Please Select an option"
          value={'default'}
        />
        <option label="These changes are intentional" value="skipAndSave" />
        <option label="Revert Changes" value="revert" />
      </select>
    );
  };

  const renderVestingItemDetails = (vestingRoute: VestingRoute) => {
    return (
      <div className="vesting-item-details-container">
        <div className="title">Id: {vestingRoute.id}</div>
        <div className="title">fromAccount: {vestingRoute.fromAccount}</div>
        <div className="title">toAccount: {vestingRoute.toAccount}</div>
        <div className="title">percent: {vestingRoute.percent}</div>
        <div className="title">
          autoVest: {vestingRoute.autoVest.toString()}
        </div>
      </div>
    );
  };

  const renderVestingItems = ({
    account,
    routes: newRoutes,
    routesChanged: oldRoutes,
  }: UserVestingRoute) => {
    console.log({ account, oldRoutes, newRoutes }); //TODO remove line
    if (!oldRoutes) {
      newRoutes.map((newRoute) => {
        return (
          <div key={`${account}-${newRoute.id}-vesting-route-card`}>
            <div className="vesting-item-card-row-container">
              <div className="title">Non existent!</div>
              {renderVestingItemDetails(newRoute)}
            </div>
          </div>
        );
      });
    } else if (oldRoutes) {
      oldRoutes.map((oldRoute) => {
        const oldRouteId = oldRoute.id;
        return (
          <div key={`${account}-${oldRouteId}-vesting-route-card`}>
            {renderVestingItemDetails(oldRoute)}
            {renderVestingItemDetails(
              newRoutes.find((item) => item.id === oldRouteId)!,
            )}
          </div>
        );
      });
    }
    return null;
  };

  //TODO add to tr
  return (
    <div
      className={`carousel-item`}
      key={`${userVestingRoute.account}-vesting-routes`}>
      <div className="carousel-item-container">
        <div className="title margin-bottom-8px">
          Account: @{userVestingRoute.account}
        </div>
        <div className="vesting-routes-titles-container">
          <div className="title">Old Route</div>
          <div className="title">New Route</div>
        </div>
        <div
          className="vesting-item-list-container"
          key={`${userVestingRoute.account}-vesting-item-list-container`}>
          {!userVestingRoute.routesChanged && userVestingRoute.routes?.length
            ? userVestingRoute.routes.map((newRoute) => {
                return (
                  <div
                    className="vesting-route-card-item"
                    key={`${userVestingRoute.account}-${newRoute.id}-vesting-route-card`}>
                    <div className="vesting-item-card-row-container">
                      <div className="title small-font">Non existent!</div>
                      {renderVestingItemDetails(newRoute)}
                    </div>
                    <div>{renderActionOptions(account, newRoute, 'add')}</div>
                  </div>
                );
              })
            : userVestingRoute.routes.length === 0 &&
              userVestingRoute.routesChanged?.length
            ? userVestingRoute.routesChanged.map((oldRoute) => {
                return (
                  <div
                    className="vesting-route-card-item"
                    key={`${userVestingRoute.account}-${oldRoute.id}-vesting-route-card`}>
                    <div className="vesting-item-card-row-container">
                      {renderVestingItemDetails(oldRoute)}
                      <div className="title small-font">Non existent!</div>
                    </div>
                    <div>
                      {renderActionOptions(account, oldRoute, 'remove')}
                    </div>
                  </div>
                );
              })
            : null}
          {/* <div
            className="vesting-item"
            key={`${userVestingRoute.account}-vesting-item`}>
            <div key={`${userVestingRoute.account}-vesting-itemrow-left`}>
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
            <div key={`${userVestingRoute.account}-vesting-itemrow-right`}>
              {userVestingRoute.routes.map((newRoute, i) =>
                renderVestingItem(newRoute, i, userVestingRoute.account),
              )}
            </div>
          </div> */}
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

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  refreshActiveAccount,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const VestinRouteItemComponent = connector(VestingRouteItem);
