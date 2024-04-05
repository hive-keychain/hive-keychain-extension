import { UserLastCurrentRoutes } from '@interfaces/vesting-routes.interface';
import { VestinRouteItemComponent } from '@popup/hive/pages/app-container/vesting-routes-popup/vesting-route-item/vesting-route-item.component';
import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
//TODO important bellow.
//  - fix the key error in items
interface Props {
  displayWrongVestingRoutesPopup: UserLastCurrentRoutes[];
  clearDisplayWrongVestingRoutes: () => void;
}

const VestingRoutesPopup = ({
  displayWrongVestingRoutesPopup,
  clearDisplayWrongVestingRoutes,
}: Props) => {
  const [pageIndex, setPageIndex] = useState(0);

  const next = () => {
    setPageIndex(pageIndex + 1);
  };

  return (
    <PopupContainer className="vesting-routes-popup">
      <div className="popup-title">
        {chrome.i18n.getMessage('popup_html_vesting_routes_title')}
      </div>
      <div
        className="content"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage(
            'popup_html_vesting_routes_warning_message',
          ),
        }}></div>

      <Carousel
        showArrows={false}
        showIndicators={false}
        selectedItem={pageIndex}
        showThumbs={false}
        showStatus={false}
        dynamicHeight>
        {displayWrongVestingRoutesPopup.map(
          ({ account, lastRoutes, currentRoutes }) => {
            return (
              <VestinRouteItemComponent
                account={account}
                lastRoutes={lastRoutes}
                currentRoutes={currentRoutes}
                next={next}
                isLast={pageIndex === displayWrongVestingRoutesPopup.length - 1}
                finish={clearDisplayWrongVestingRoutes}
              />
            );
          },
        )}
      </Carousel>
      <div className="popup-footer">
        <ul className="indicator-container">
          {displayWrongVestingRoutesPopup.map((v, index) => {
            return (
              <li
                key={`dot-indicator-${index}`}
                className={`dot ${index === pageIndex ? 'selected' : ''}`}></li>
            );
          })}
        </ul>
      </div>
    </PopupContainer>
  );
};

export const VestingRoutesPopupComponent = VestingRoutesPopup;
