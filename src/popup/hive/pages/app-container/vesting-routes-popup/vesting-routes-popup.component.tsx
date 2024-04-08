import { UserLastCurrentRoutes } from '@interfaces/vesting-routes.interface';
import { VestinRouteItemComponent } from '@popup/hive/pages/app-container/vesting-routes-popup/vesting-route-item/vesting-route-item.component';
import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
interface Props {
  displayWrongVestingRoutesPopup: UserLastCurrentRoutes[];
  clearDisplayWrongVestingRoutes: () => void;
}

const VestingRoutesPopup = ({
  displayWrongVestingRoutesPopup,
  clearDisplayWrongVestingRoutes,
}: Props) => {
  const [isLoadingChanges, setIsLoadingChanges] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  const next = () => {
    setPageIndex(pageIndex + 1);
  };

  return (
    <PopupContainer className="vesting-routes-popup">
      <LoadingComponent hide={!isLoadingChanges} />
      <div className="popup-title text-centered">
        {chrome.i18n.getMessage('popup_html_vesting_routes_title')}
      </div>
      <div
        className="content caption"
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
                key={`vesting-route-item-${account}`}
                account={account}
                lastRoutes={lastRoutes}
                currentRoutes={currentRoutes}
                next={next}
                isLast={pageIndex === displayWrongVestingRoutesPopup.length - 1}
                finish={clearDisplayWrongVestingRoutes}
                setIsLoadingChanges={(value: boolean) =>
                  setIsLoadingChanges(value)
                }
              />
            );
          },
        )}
      </Carousel>
      {/* <div className="popup-footer">
        <ul className="indicator-container">
          {displayWrongVestingRoutesPopup.map((v, index) => {
            return (
              <li
                key={`dot-indicator-${v.account}-${index}`}
                className={`dot ${index === pageIndex ? 'selected' : ''}`}></li>
            );
          })}
        </ul>
      </div> */}
    </PopupContainer>
  );
};

export const VestingRoutesPopupComponent = VestingRoutesPopup;
