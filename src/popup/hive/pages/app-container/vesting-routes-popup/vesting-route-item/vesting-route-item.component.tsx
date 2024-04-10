import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import {
  VestingRoute,
  VestingRouteDifference,
} from '@interfaces/vesting-routes.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/hive/actions/loading.actions';
import { setSuccessMessage } from '@popup/hive/actions/message.actions';
import { RootState } from '@popup/hive/store';
import { VestingRoutesUtils } from '@popup/hive/utils/vesting-routes.utils';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';

interface Props {
  account: string;
  differences: VestingRouteDifference[];
  nextCarouselSlide: () => void;
  isLast: boolean;
  clearDisplayWrongVestingRoutes: () => void;
}

const VestingRouteItem = ({
  account,
  nextCarouselSlide,
  isLast,
  setSuccessMessage,
  clearDisplayWrongVestingRoutes,
  accounts,
  addToLoadingList,
  removeFromLoadingList,
  differences,
}: Props & PropsFromRedux) => {
  const renderVestingItemDetails = (
    vestingRoute: VestingRoute,
    vestingRouteType: 'old' | 'new',
  ) => {
    return (
      <div
        key={`vesting-item-details-${vestingRoute.toAccount}-${vestingRouteType}-${vestingRoute.percent}`}
        className={`vesting-item-details-container ${vestingRouteType}`}>
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

  const renderNone = () => {
    return (
      <div className="title">
        {chrome.i18n.getMessage(
          'popup_html_vesting_route_item_details_non_existent_label',
        )}
      </div>
    );
  };

  const skipAndSave = async (
    differences: VestingRouteDifference[],
    account: string,
  ) => {
    await VestingRoutesUtils.skipAccountRoutes(differences, account);
    checkForNextSlideOrHidePopup();
  };

  const checkForNextSlideOrHidePopup = () => {
    if (!isLast) return nextCarouselSlide();
    setSuccessMessage('popup_html_vesting_routes_handled_successfully');
    clearDisplayWrongVestingRoutes();
  };

  const revert = async (
    differences: VestingRouteDifference[],
    account: string,
  ) => {
    addToLoadingList('html_popup_revert_vesting_route_operation');
    await VestingRoutesUtils.revertAccountRoutes(
      accounts,
      differences,
      account,
    );
    removeFromLoadingList('html_popup_revert_vesting_route_operation');
    checkForNextSlideOrHidePopup();
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
          <div className="vesting-route-title old-route">
            {chrome.i18n.getMessage(
              'popup_html_vesting_route_account_item_old_route_title',
            )}
          </div>
          <div className="vesting-route-title new-route">
            {chrome.i18n.getMessage(
              'popup_html_vesting_route_account_item_new_route_title',
            )}
          </div>
        </div>
        <div
          className="vesting-item-list-container"
          key={`${account}-vesting-item-list-container`}>
          {differences.map(({ oldRoute, newRoute }) => {
            const id = oldRoute?.toAccount ?? newRoute?.toAccount;
            return (
              <div
                key={`vesting-route-card-item-current-${id}`}
                className="vesting-route-card-item">
                {oldRoute
                  ? renderVestingItemDetails(oldRoute, 'old')
                  : renderNone()}
                {newRoute
                  ? renderVestingItemDetails(newRoute, 'new')
                  : renderNone()}
              </div>
            );
          })}
        </div>
        <div className="vesting-action-buttons-container">
          <ButtonComponent
            dataTestId="button-skip-vesting-routes"
            type={ButtonType.ALTERNATIVE}
            label={'popup_html_vesting_route_account_item_button_skip_label'}
            onClick={() => skipAndSave(differences, account)}
            additionalClass="vesting-action-button small-font"
          />
          <OperationButtonComponent
            dataTestId="button-revert-vesting-routes"
            requiredKey={KeychainKeyTypesLC.active}
            onClick={() => revert(differences, account)}
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
