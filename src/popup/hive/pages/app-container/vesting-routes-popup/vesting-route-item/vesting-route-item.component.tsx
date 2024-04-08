import { VestingRoute } from '@interfaces/vesting-routes.interface';
import { setSuccessMessage } from '@popup/hive/actions/message.actions';
import { RootState } from '@popup/hive/store';
import { VestingRoutesUtils } from '@popup/hive/utils/vesting-routes.utils';
import React, { useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import Logger from 'src/utils/logger.utils';

interface Props {
  account: string;
  lastRoutes: VestingRoute[];
  currentRoutes: VestingRoute[];
  next: () => void;
  isLast: boolean;
  finish: () => void;
  setIsLoadingChanges: (value: boolean) => void;
}

const VestingRouteItem = ({
  account,
  lastRoutes,
  currentRoutes,
  next,
  isLast,
  setSuccessMessage,
  finish,
  accounts,
  setIsLoadingChanges,
}: Props & PropsFromRedux) => {
  const [currentlyRemovedRoutesIdList, setCurrentlyRemovedRoutesIdList] =
    useState<{ id: number }[]>([]);

  const renderVestingItemDetails = (
    vestingRoute: VestingRoute,
    alignment: 'alignment-left' | 'alignment-right',
    addToKey?: string,
  ) => {
    return (
      <div
        key={`vesting-item-details-${vestingRoute.id}-${addToKey}`}
        className={`vesting-item-details-container ${alignment}`}>
        <div className="title">
          {chrome.i18n.getMessage(
            'popup_html_vesting_route_item_details_id_title',
          )}
          {vestingRoute.id}
        </div>
        <div className="title">
          {chrome.i18n.getMessage(
            'popup_html_vesting_route_item_details_from_title',
          )}
          {vestingRoute.from_account}
        </div>
        <div className="title">
          {chrome.i18n.getMessage(
            'popup_html_vesting_route_item_details_to_title',
          )}
          {vestingRoute.to_account}
        </div>
        <div className="title">
          {chrome.i18n.getMessage(
            'popup_html_vesting_route_item_details_percent_title',
          )}
          {vestingRoute.percent / 100}
        </div>
        <div className="title">
          {chrome.i18n.getMessage(
            'popup_html_vesting_route_item_details_autovest_title',
          )}
          {vestingRoute.auto_vest.toString()}
        </div>
      </div>
    );
  };

  const addToRemovedList = (id: number) => {
    if (!currentlyRemovedRoutesIdList.find((item) => item.id === id)) {
      setCurrentlyRemovedRoutesIdList((prev) => [...prev, { id }]);
    }
  };

  const renderFromList = (last: VestingRoute[], current: VestingRoute[]) => {
    if (current.length >= last.length) {
      return current.map((curr) => {
        const foundInLast = last.find((l) => l.id === curr.id);
        return (
          <div
            key={`vesting-route-card-item-current-${curr.id}`}
            className="vesting-route-card-item">
            <div className="vesting-item-card-row-container">
              {!foundInLast ? (
                <div className="title small-font">
                  {chrome.i18n.getMessage(
                    'popup_html_vesting_route_item_details_non_existent_label',
                  )}
                </div>
              ) : (
                renderVestingItemDetails(foundInLast, 'alignment-left', 'last')
              )}
              {renderVestingItemDetails(curr, 'alignment-right', 'curr')}
            </div>
          </div>
        );
      });
    } else if (last.length > current.length) {
      return last.map((last) => {
        const foundInCurr = current.find((c) => c.id === last.id);
        if (!foundInCurr) addToRemovedList(last.id);
        return (
          <div
            key={`vesting-route-card-item-current-last-${last.id}`}
            className="vesting-route-card-item">
            <div className="vesting-item-card-row-container">
              {renderVestingItemDetails(last, 'alignment-left', 'curr')}
              {!foundInCurr ? (
                <div className="title small-font">
                  {chrome.i18n.getMessage(
                    'popup_html_vesting_route_item_details_non_existent_label',
                  )}
                </div>
              ) : (
                renderVestingItemDetails(foundInCurr, 'alignment-right', 'last')
              )}
            </div>
          </div>
        );
      });
    } else {
      return null;
    }
  };

  const skipAndSave = async (
    current: VestingRoute[],
    acc: string,
    isLast: boolean,
  ) => {
    setIsLoadingChanges(true);
    let copyLast = [...(await VestingRoutesUtils.getLastVestingRoutes())!];
    const toUpdateIndex = copyLast.findIndex((c) => c.account === acc);
    if (toUpdateIndex !== -1) {
      if (!copyLast[toUpdateIndex].routes.length) {
        copyLast[toUpdateIndex].routes = current;
      } else {
        if (current.length === 0 || currentlyRemovedRoutesIdList.length) {
          currentlyRemovedRoutesIdList.map((removedRoute) => {
            copyLast[toUpdateIndex].routes = copyLast[
              toUpdateIndex
            ].routes.filter((r) => r.id !== removedRoute.id);
          });
        } else {
          current.map((c) => {
            const toUpdateIndexRouteInlast = copyLast[
              toUpdateIndex
            ].routes.findIndex((r) => r.id === c.id);
            if (toUpdateIndexRouteInlast !== -1) {
              copyLast[toUpdateIndex].routes[toUpdateIndexRouteInlast] = c;
            } else {
              copyLast[toUpdateIndex].routes.push(c);
            }
          });
        }
      }
    }
    console.log('about to update lastVestingRoutes: ', { copyLast }); //TODO remove line
    await VestingRoutesUtils.saveLastVestingRoutes(copyLast);
    setCurrentlyRemovedRoutesIdList([]);
    setIsLoadingChanges(false);
    if (!isLast) return next();
    setSuccessMessage('popup_html_vesting_routes_handled_successfully');
    finish();
  };

  const revert = async (
    last: VestingRoute[],
    current: VestingRoute[],
    acc: string,
    isLast: boolean,
  ) => {
    setIsLoadingChanges(true);
    const activeKey = accounts.find((a) => a.name === acc)?.keys.active!;
    // op to broadcast.
    // [
    //   "set_withdraw_vesting_route",
    //   {
    //     "from_account": "alice",
    //     "to_account": "bob",
    //     "percent": 10000,
    //     "auto_vest": true
    //   }
    // ]
    //TODO:
    //  - validation of active key still needed? roght now the revert button will be disabled if not active key present
    console.log({ last, current, acc, isLast, currentlyRemovedRoutesIdList }); //TODO remove line
    const broadcastOperation: {
      from_account: string;
      to_account: string;
      percent: number;
      auto_vest: boolean;
    }[] = [];
    if (last.length === current.length) {
      last.map((l) => {
        broadcastOperation.push({
          from_account: l.from_account,
          to_account: l.to_account,
          percent: l.percent,
          auto_vest: l.auto_vest,
        });
      });
    } else if (current.length > last.length) {
      //TODO check & broadcast
      current.map((c) => {
        const foundInlast = last.find((f) => f.id === c.id);
        if (!foundInlast) {
          broadcastOperation.push({
            from_account: c.from_account,
            to_account: c.to_account,
            percent: 0,
            auto_vest: c.auto_vest,
          });
        }
      });
    } else if (current.length < last.length) {
      last.map((l) => {
        const foundInCurr = current.find((c) => c.id === l.id);
        if (!foundInCurr) {
          broadcastOperation.push({
            from_account: l.from_account,
            to_account: l.to_account,
            percent: l.percent,
            auto_vest: l.auto_vest,
          });
        }
      });
    }
    console.log('About to broadcast: ', { broadcastOperation });
    //TODO bellow uncomment after testing the actual case
    try {
      for (const t of broadcastOperation) {
        const result = await VestingRoutesUtils.sendVestingRoute(
          t.from_account,
          t.to_account,
          t.percent,
          t.auto_vest,
          activeKey,
        );
        console.log({ result }); //TODO remove line
      }
      const currentRoutes =
        await VestingRoutesUtils.getAllAccountsVestingRoutes(
          accounts.map((a) => a.name),
          'outgoing',
        );
      console.log('After broadcasting changes: ', { currentRoutes }); //TODO remove line
      await VestingRoutesUtils.saveLastVestingRoutes(currentRoutes);
      setIsLoadingChanges(false);
      if (!isLast) return next();
      setSuccessMessage('popup_html_vesting_routes_handled_successfully');
      finish();
    } catch (error) {
      Logger.error('Error while sending vesting route', true);
    }
  };

  return (
    <div className={`carousel-item`} key={`${account}-vesting-routes`}>
      <div className="carousel-item-container">
        <div className="title margin-bottom-8px">
          {chrome.i18n.getMessage(
            'popup_html_vesting_route_account_item_label',
          )}
          {account}
        </div>
        <div className="vesting-routes-titles-container margin-bottom-8px">
          <div className="title margin-left-16px">
            {chrome.i18n.getMessage(
              'popup_html_vesting_route_account_item_old_route_title',
            )}
          </div>
          <div className="title margin-right-16px">
            {chrome.i18n.getMessage(
              'popup_html_vesting_route_account_item_new_route_title',
            )}
          </div>
        </div>
        <div
          className="vesting-item-list-container"
          key={`${account}-vesting-item-list-container`}>
          {renderFromList(lastRoutes, currentRoutes)}
        </div>

        <div className="vesting-action-buttons-container">
          <ButtonComponent
            disabled={
              accounts.find((acc) => acc.name === account)?.keys.active !==
              undefined
                ? false
                : true
            }
            dataTestId="button-revert-vesting-routes"
            type={ButtonType.IMPORTANT}
            label={'popup_html_vesting_route_account_item_button_revert_label'}
            onClick={() => revert(lastRoutes, currentRoutes, account, isLast)}
            additionalClass={`vesting-action-button small-font ${
              accounts.find((acc) => acc.name === account)?.keys.active ===
              undefined
                ? 'disabled'
                : null
            }`}
          />
          <ButtonComponent
            dataTestId="button-skip-vesting-routes"
            type={ButtonType.IMPORTANT}
            label={'popup_html_vesting_route_account_item_button_skip_label'}
            onClick={() => skipAndSave(currentRoutes, account, isLast)}
            additionalClass="vesting-action-button small-font"
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.accounts,
  };
};

const connector = connect(mapStateToProps, {
  setSuccessMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const VestinRouteItemComponent = connector(VestingRouteItem);
