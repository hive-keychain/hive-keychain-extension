import {
  UserVestingRoute,
  VestingRoute,
} from '@interfaces/vesting-routes.interface';
import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox/checkbox.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';

interface Props {
  displayWrongVestingRoutesPopup: UserVestingRoute[];
  clearDisplayWrongVestingRoutes: () => void;
}

const VestingRoutesPopup = ({
  displayWrongVestingRoutesPopup,
  clearDisplayWrongVestingRoutes,
}: Props) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [
    markAsIntentionalVestingRouteList,
    setMarkAsIntentionalVestingRouteList,
  ] = useState<VestingRoute[]>([]);

  const next = () => {
    setPageIndex(pageIndex + 1);
  };

  const previous = () => {
    setPageIndex(pageIndex - 1);
  };

  const finish = () => {
    clearDisplayWrongVestingRoutes();
  };

  const renderCustomIndicator = (
    clickHandler: (e: React.MouseEvent | React.KeyboardEvent) => void,
    isSelected: boolean,
    index: number,
    label: string,
  ) => {
    return (
      <li
        className={`dot ${isSelected ? 'selected' : ''}`}
        onClick={(e) => {
          clickHandler(e);
          setPageIndex(index);
        }}></li>
    );
  };

  const handleRevert = (account: string, vestingRoute: VestingRoute) => {
    console.log('//TODO revert for item', { account, vestingRoute });
  };

  const handleSkipVestingRouteChange = (
    account: string,
    routeChanged: VestingRoute,
  ) => {
    console.log('//TODO mark to skip for item', { account, routeChanged });
    const foundInList = markAsIntentionalVestingRouteList.find(
      (item) => item.id === routeChanged.id,
    );
    let tempList = [...markAsIntentionalVestingRouteList];
    if (foundInList) {
      // setMarkAsIntentionalVestingRouteList(tempList.filter(item => item.id !== routeChanged.id));
      tempList = tempList.filter((item) => item.id !== routeChanged.id);
    } else {
      tempList.push(routeChanged);
    }
    setMarkAsIntentionalVestingRouteList(tempList);
  };

  return (
    <PopupContainer className="vesting-routes-popup">
      <div className="popup-title">
        {chrome.i18n.getMessage('popup_html_vesting_shares_title')}
      </div>
      <div
        className="content"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage(
            'popup_html_vesting_shares_warning_message',
          ),
        }}></div>
      <div>
        <Carousel
          showArrows={false}
          showIndicators
          selectedItem={pageIndex}
          showThumbs={false}
          showStatus={false}
          renderIndicator={renderCustomIndicator}>
          {displayWrongVestingRoutesPopup.map((acc) => {
            return (
              <div
                className="carousel-item"
                key={`${acc.account}-vesting-routes`}>
                <div className="title">Account: @{acc.account}</div>
                <div className="vesting-item-row">
                  <div className="vesting-route-item flex-align-left">
                    <div className="title">Before</div>
                    {acc.routesChanged ? (
                      acc.routesChanged.map((item) => {
                        return (
                          <div
                            className="display-content"
                            key={`${item.id}-vesting-route-2`}>
                            <div className="title">Id: {item.id}</div>
                            <div className="title">
                              fromAccount: {item.fromAccount}
                            </div>
                            <div className="title">
                              toAccount: {item.toAccount}
                            </div>
                            <div className="title">percent: {item.percent}</div>
                            <div className="title">
                              autoVest: {item.autoVest.toString()}
                            </div>
                            <ButtonComponent
                              //TODO add tr
                              additionalClass="content-vesting-route-button"
                              skipLabelTranslation
                              label={'Revert'}
                              onClick={() => handleRevert(acc.account, item)}
                            />
                          </div>
                        );
                      })
                    ) : (
                      <div className="title">Non existent!</div>
                    )}
                  </div>
                  <div className="vesting-route-item flex-align-right">
                    <div className="title">Now</div>
                    {acc.routes.map((routeChanged) => {
                      return (
                        <div
                          className="display-content"
                          key={`${routeChanged.id}-vesting-route`}>
                          <div className="title">Id: {routeChanged.id}</div>
                          <div className="title">
                            fromAccount: {routeChanged.fromAccount}
                          </div>
                          <div className="title">
                            toAccount: {routeChanged.toAccount}
                          </div>
                          <div className="title">
                            percent: {routeChanged.percent}
                          </div>
                          <div className="title">
                            autoVest: {routeChanged.autoVest.toString()}
                          </div>
                          <CheckboxComponent
                            //TODO add tr
                            skipTranslation
                            title={'These changes are intentional'}
                            checked={
                              markAsIntentionalVestingRouteList.find(
                                (item) => item.id === routeChanged.id,
                              ) !== undefined
                            }
                            onChange={() =>
                              handleSkipVestingRouteChange(
                                acc.account,
                                routeChanged,
                              )
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </Carousel>
      </div>
      <div className="popup-footer">
        {pageIndex > 0 && (
          <ButtonComponent
            type={ButtonType.ALTERNATIVE}
            label="popup_html_whats_new_previous"
            onClick={() => previous()}
          />
        )}
        {pageIndex === displayWrongVestingRoutesPopup.length - 1 && (
          <ButtonComponent
            //TODO check if those buttons needed at all or not.
            dataTestId="button-last-page"
            type={ButtonType.IMPORTANT}
            label="popup_html_whats_new_got_it"
            onClick={() => finish()}
          />
        )}
        {pageIndex < displayWrongVestingRoutesPopup.length - 1 && (
          <ButtonComponent
            dataTestId="button-next-page"
            type={ButtonType.ALTERNATIVE}
            label="popup_html_whats_new_next"
            onClick={() => next()}
          />
        )}
      </div>
    </PopupContainer>
  );
};

export const VestingRoutesPopupComponent = VestingRoutesPopup;
