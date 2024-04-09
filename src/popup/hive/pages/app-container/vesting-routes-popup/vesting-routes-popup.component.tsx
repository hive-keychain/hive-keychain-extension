import { UserLastCurrentRoutes } from '@interfaces/vesting-routes.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/hive/actions/loading.actions';
import { VestinRouteItemComponent } from '@popup/hive/pages/app-container/vesting-routes-popup/vesting-route-item/vesting-route-item.component';
import { RootState } from '@popup/hive/store';
import React, { useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
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
  loadingState,
}: Props & PropsFromRedux) => {
  const [pageIndex, setPageIndex] = useState(0);

  const nextCarouselSlide = () => {
    setPageIndex(pageIndex + 1);
  };

  return (
    <PopupContainer className="vesting-routes-popup">
      <LoadingComponent
        hide={!loadingState.loadingOperations.length}
        operations={loadingState.loadingOperations}
      />
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
                nextCarouselSlide={nextCarouselSlide}
                isLast={pageIndex === displayWrongVestingRoutesPopup.length - 1}
                clearDisplayWrongVestingRoutes={clearDisplayWrongVestingRoutes}
              />
            );
          },
        )}
      </Carousel>
    </PopupContainer>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    loadingState: state.loading,
  };
};

const connector = connect(mapStateToProps, {
  addToLoadingList,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const VestingRoutesPopupComponent = connector(VestingRoutesPopup);
