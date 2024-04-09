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

interface Props {
  account: string;
  lastRoutes: VestingRoute[];
  currentRoutes: VestingRoute[];
  nextCarouselSlide: () => void;
  isLast: boolean;
  clearDisplayWrongVestingRoutes: () => void;
}

const VestingRouteItem = ({
  account,
  lastRoutes,
  currentRoutes,
  nextCarouselSlide,
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
    currentRoutes: VestingRoute[],
    account: string,
    isLast: boolean,
  ) => {
    await VestingRoutesUtils.skipAccountRoutes(
      currentRoutes,
      account,
      isLast,
      nextCarouselSlide,
      currentlyRemovedRoutesIdList,
      (value) => setCurrentlyRemovedRoutesIdList(value),
      (message) => setSuccessMessage(message),
      clearDisplayWrongVestingRoutes,
    );
  };

  const revert = async (
    lastRoutes: VestingRoute[],
    currentRoutes: VestingRoute[],
    account: string,
    isLast: boolean,
  ) => {
    await VestingRoutesUtils.revertAccountRoutes(
      lastRoutes,
      currentRoutes,
      account,
      isLast,
      (message) => addToLoadingList(message),
      accounts,
      (message) => removeFromLoadingList(message),
      nextCarouselSlide,
      (message) => setSuccessMessage(message),
      clearDisplayWrongVestingRoutes,
    );
  };

  return (
    <div className={`carousel-item`} key={`${account}-vesting-routes`}>
      <div className="carousel-item-container">
        <div className="account-title">
          {chrome.i18n.getMessage(
            'popup_html_vesting_route_account_item_label',
          )}
          {account}
        </div>
        <div className="vesting-routes-titles-container">
          <div className="old-route-title">
            {chrome.i18n.getMessage(
              'popup_html_vesting_route_account_item_old_route_title',
            )}
          </div>
          <div className="new-route-title">
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
