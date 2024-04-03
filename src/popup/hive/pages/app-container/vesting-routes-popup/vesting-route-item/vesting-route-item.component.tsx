import {
  AccountVestingRoute,
  NonExistenVestingRoute,
  VestingRoute,
} from '@interfaces/vesting-routes.interface';
import { RootState } from '@popup/hive/store';
import { VestingRoutesUtils } from '@popup/hive/utils/vesting-routes.utils';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';

interface Props {
  userVestingRoute: AccountVestingRoute;
}

const VestingRouteItem = ({ userVestingRoute }: Props & PropsFromRedux) => {
  const handleSelect = async (
    option: string,
    lastRoute: VestingRoute | NonExistenVestingRoute,
    newRoute: VestingRoute | NonExistenVestingRoute,
    acc: string,
  ) => {
    //TODO cleanup
    //'default' | 'skipAndSave' | 'revert'
    if (option === 'default') return;
    if (option === 'skipAndSave') {
      const tempLastVestingRoutes =
        await VestingRoutesUtils.getLastVestingRoutes();

      let foundLast = tempLastVestingRoutes?.find(
        (lastRoute) => lastRoute.account === acc,
      );
      if ((lastRoute as NonExistenVestingRoute).status === 'non existent') {
        foundLast!.routes.push(newRoute as VestingRoute);
      } else if ((lastRoute as VestingRoute).fromAccount) {
        if (foundLast) {
          let routesFound = foundLast.routes as VestingRoute[];
          const indexFound = routesFound.findIndex(
            (item) => item.id === newRoute.id,
          );
          if (indexFound > -1) {
            routesFound[indexFound] = newRoute as VestingRoute;
            foundLast.routes = routesFound;
          }
        }
      }

      // console.log('about to save: ', { tempLastVestingRoutes }); //TODO remove line

      await VestingRoutesUtils.saveLastVestingRoutes(tempLastVestingRoutes!);
      //TODO important: ask cedric what to do here? reload the app? set/update the new displayWrong array?
    }
  };

  const renderActionOptions = (
    lastRoute: VestingRoute | NonExistenVestingRoute,
    newRoute: VestingRoute | NonExistenVestingRoute,
    acc: string,
  ) => {
    return (
      <select
        className="mandatory-select-option"
        onChange={(e) =>
          handleSelect(e.target.value, lastRoute, newRoute, acc)
        }>
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

  const renderVestingItemDetails = (
    vestingRoute: VestingRoute,
    alignment: 'alignment-left' | 'alignment-right',
  ) => {
    return (
      <div className={`vesting-item-details-container ${alignment}`}>
        <div className="title">Id: {vestingRoute.id}</div>
        <div className="title">from: {vestingRoute.fromAccount}</div>
        <div className="title">to: {vestingRoute.toAccount}</div>
        <div className="title">percent: {vestingRoute.percent}</div>
        <div className="title">
          autoVest: {vestingRoute.autoVest.toString()}
        </div>
      </div>
    );
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
          {userVestingRoute.lastRoutes.map((lastRoute, index) => {
            const newRoute = userVestingRoute.newRoutes[index];
            return (
              <div
                className="vesting-route-card-item"
                key={`${userVestingRoute.account}-${lastRoute.id}-vesting-route-card`}>
                <div className="vesting-item-card-row-container">
                  {(lastRoute as NonExistenVestingRoute).status && (
                    <div className="title small-font">
                      {(lastRoute as NonExistenVestingRoute).status}
                    </div>
                  )}
                  {(lastRoute as VestingRoute).fromAccount &&
                    renderVestingItemDetails(
                      lastRoute as VestingRoute,
                      'alignment-left',
                    )}
                  {(newRoute as NonExistenVestingRoute).status && (
                    <div className="title small-font">
                      {(newRoute as NonExistenVestingRoute).status}
                    </div>
                  )}
                  {(newRoute as VestingRoute).fromAccount &&
                    renderVestingItemDetails(
                      newRoute as VestingRoute,
                      'alignment-right',
                    )}
                </div>
                <div>
                  {renderActionOptions(
                    lastRoute,
                    newRoute,
                    userVestingRoute.account,
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const VestinRouteItemComponent = connector(VestingRouteItem);
