import { UserVestingRoute } from '@interfaces/vesting-routes.interface';
import React from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';

interface Props {
  displayWrongVestingRoutesPopup: UserVestingRoute[];
  clearDisplayWrongVestingRoutes: () => void;
}

const VestingRoutesPopup = ({
  displayWrongVestingRoutesPopup,
  clearDisplayWrongVestingRoutes,
}: Props) => {
  return (
    <PopupContainer className="wrong-key-popup">
      <div className="popup-title">
        {chrome.i18n.getMessage('popup_html_vesting_shares_title')}
      </div>
      <div>
        {chrome.i18n.getMessage('popup_html_vesting_shares_warning_message')}
      </div>
      <div style={{ height: '-webkit-fill-available', overflowY: 'scroll' }}>
        {displayWrongVestingRoutesPopup.map((acc) => {
          return (
            <div
              style={{
                width: '-webkit-fill-available',
                overflowY: 'scroll',
              }}
              key={`${acc.account}-vesting-routes`}>
              <div>Account: {acc.account}</div>
              <div
                style={{
                  flexDirection: 'row',
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '-webkit-fill-available',
                  fontSize: '10px',
                }}>
                <div>
                  <div>Before</div>
                  {acc.routesChanged ? (
                    acc.routesChanged.map((item) => {
                      return (
                        <div key={`${item.id}-vesting-route-2`}>
                          <div>Id: {item.id}</div>
                          <div>fromAccount: {item.fromAccount}</div>
                          <div>toAccount: {item.toAccount}</div>
                          <div>percent: {item.percent}</div>
                          <div>autoVest: {item.autoVest.toString()}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div>Non existent!</div>
                  )}
                </div>
                <div>
                  <div>Now</div>
                  {acc.routes.map((routeChanged) => {
                    return (
                      <div key={`${routeChanged.id}-vesting-route`}>
                        <div>Id: {routeChanged.id}</div>
                        <div>fromAccount: {routeChanged.fromAccount}</div>
                        <div>toAccount: {routeChanged.toAccount}</div>
                        <div>percent: {routeChanged.percent}</div>
                        <div>autoVest: {routeChanged.autoVest.toString()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="popup-footer">
        <ButtonComponent
          //TODO bellow add to tr
          skipLabelTranslation
          label={'Got it!'}
          onClick={clearDisplayWrongVestingRoutes}
        />
      </div>
    </PopupContainer>
  );
};

export const VestingRoutesPopupComponent = VestingRoutesPopup;
