import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { VestingRoute } from '@interfaces/vesting-routes.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/hive/actions/loading.actions';
import { setSuccessMessage } from '@popup/hive/actions/message.actions';
import { RootState } from '@popup/hive/store';
import { VestingRoutesUtils } from '@popup/hive/utils/vesting-routes.utils';
import React, { useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import Logger from 'src/utils/logger.utils';

interface Props {
  account: string;
  lastRoutes: VestingRoute[];
  currentRoutes: VestingRoute[];
  next: () => void;
  isLast: boolean;
  clearDisplayWrongVestingRoutes: () => void;
}

const VestingRouteItem = ({
  account,
  lastRoutes,
  currentRoutes,
  next,
  isLast,
  setSuccessMessage,
  clearDisplayWrongVestingRoutes,
  accounts,
  addToLoadingList,
  removeFromLoadingList,
}: Props & PropsFromRedux) => {
  const [currentlyRemovedRoutesIdList, setCurrentlyRemovedRoutesIdList] =
    useState<number[]>([]);

  const renderVestingItemDetails = (
    vestingRoute: VestingRoute,
    vestingRouteType: 'old' | 'new',
  ) => {
    return (
      <div
        key={`vesting-item-details-${vestingRoute.id}-${vestingRouteType}`}
        className={`vesting-item-details-container ${
          vestingRouteType === 'new' ? 'alignment-right' : 'alignment-left'
        }`}>
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
          {vestingRoute.fromAccount}
        </div>
        <div className="title">
          {chrome.i18n.getMessage(
            'popup_html_vesting_route_item_details_to_title',
          )}
          {vestingRoute.toAccount}
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
          {vestingRoute.autoVest.toString()}
        </div>
      </div>
    );
  };

  const addToRemovedList = (id: number) => {
    if (!currentlyRemovedRoutesIdList.find((idNumber) => idNumber === id)) {
      const tempList = [...currentlyRemovedRoutesIdList];
      tempList.push(id);
      setCurrentlyRemovedRoutesIdList(tempList);
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
                renderVestingItemDetails(foundInLast, 'old')
              )}
              {renderVestingItemDetails(curr, 'new')}
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
              {renderVestingItemDetails(last, 'old')}
              {!foundInCurr ? (
                <div className="title small-font">
                  {chrome.i18n.getMessage(
                    'popup_html_vesting_route_item_details_non_existent_label',
                  )}
                </div>
              ) : (
                renderVestingItemDetails(foundInCurr, 'new')
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
            ].routes.filter((r) => r.id !== removedRoute);
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
    await VestingRoutesUtils.saveLastVestingRoutes(copyLast);
    setCurrentlyRemovedRoutesIdList([]);
    if (!isLast) return next();
    setSuccessMessage('popup_html_vesting_routes_handled_successfully');
    clearDisplayWrongVestingRoutes();
  };

  const revert = async (
    last: VestingRoute[],
    current: VestingRoute[],
    acc: string,
    isLast: boolean,
  ) => {
    addToLoadingList('html_popup_revert_vesting_route_operation');
    const activeKey = accounts.find((a) => a.name === acc)?.keys.active!;
    const broadcastOperation: {
      from_account: string;
      to_account: string;
      percent: number;
      auto_vest: boolean;
    }[] = [];
    if (last.length === current.length) {
      last.map((l) => {
        broadcastOperation.push({
          from_account: l.fromAccount,
          to_account: l.toAccount,
          percent: l.percent,
          auto_vest: l.autoVest,
        });
      });
    } else if (current.length > last.length) {
      current.map((c) => {
        const foundInlast = last.find((f) => f.id === c.id);
        if (!foundInlast) {
          broadcastOperation.push({
            from_account: c.fromAccount,
            to_account: c.toAccount,
            percent: 0,
            auto_vest: c.autoVest,
          });
        }
      });
    } else if (current.length < last.length) {
      last.map((l) => {
        const foundInCurr = current.find((c) => c.id === l.id);
        if (!foundInCurr) {
          broadcastOperation.push({
            from_account: l.fromAccount,
            to_account: l.toAccount,
            percent: l.percent,
            auto_vest: l.autoVest,
          });
        }
      });
    }
    try {
      for (const t of broadcastOperation) {
        const result = await VestingRoutesUtils.sendVestingRoute(
          t.from_account,
          t.to_account,
          t.percent,
          t.auto_vest,
          activeKey,
        );
      }
      const currentRoutes =
        await VestingRoutesUtils.getAllAccountsVestingRoutes(
          accounts.map((a) => a.name),
          'outgoing',
        );
      await VestingRoutesUtils.saveLastVestingRoutes(currentRoutes);
      removeFromLoadingList('html_popup_revert_vesting_route_operation');
      if (!isLast) return next();
      setSuccessMessage('popup_html_vesting_routes_handled_successfully');
      clearDisplayWrongVestingRoutes();
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
            dataTestId="button-skip-vesting-routes"
            type={ButtonType.ALTERNATIVE}
            label={'popup_html_vesting_route_account_item_button_skip_label'}
            onClick={() => skipAndSave(currentRoutes, account, isLast)}
            additionalClass="vesting-action-button small-font"
          />
          <OperationButtonComponent
            dataTestId="button-revert-vesting-routes"
            requiredKey={KeychainKeyTypesLC.active}
            onClick={() => revert(lastRoutes, currentRoutes, account, isLast)}
            label={'popup_html_vesting_route_account_item_button_revert_label'}
            additionalClass={'vesting-action-button small-font'}
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
  addToLoadingList,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const VestinRouteItemComponent = connector(VestingRouteItem);
