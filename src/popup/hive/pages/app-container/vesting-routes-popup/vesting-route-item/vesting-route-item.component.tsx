import { VestingRoute } from '@interfaces/vesting-routes.interface';
import { setSuccessMessage } from '@popup/hive/actions/message.actions';
import { RootState } from '@popup/hive/store';
import { VestingRoutesUtils } from '@popup/hive/utils/vesting-routes.utils';
import React, { useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';

interface Props {
  account: string;
  lastRoutes: VestingRoute[];
  currentRoutes: VestingRoute[];
  next: () => void;
  isLast: boolean;
  finish: () => void;
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
}: Props & PropsFromRedux) => {
  const [isRevertingVestingRoutes, setIsRevertingVestingRoutes] =
    useState(false);
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
    await VestingRoutesUtils.saveLastVestingRoutes(copyLast);
    setCurrentlyRemovedRoutesIdList([]);
    if (!isLast) return next();
    setSuccessMessage('popup_html_vesting_routes_handled_successfully');
    finish();
  };

  const revert = (
    last: VestingRoute[],
    current: VestingRoute[],
    acc: string,
    isLast: boolean,
  ) => {
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
            }
            dataTestId="button-revert-vesting-routes"
            type={ButtonType.IMPORTANT}
            label={'popup_html_vesting_route_account_item_button_revert_label'}
            onClick={() => revert(lastRoutes, currentRoutes, account, isLast)}
            additionalClass="vesting-action-button small-font"
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
