import { AccountVestingRoutesDifferences } from '@interfaces/vesting-routes.interface';
import { VestinRouteItemComponent } from '@popup/hive/pages/app-container/vesting-routes-popup/vesting-route-item/vesting-route-item.component';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import { RootState } from '@popup/multichain/store';
import React, { useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
interface Props {
  vestingRoutesDifferences: AccountVestingRoutesDifferences[];
  closePopup: () => void;
}

const VestingRoutesPopup = ({
  vestingRoutesDifferences,
  closePopup,
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
      <div className="popup-title">
        {chrome.i18n.getMessage('popup_html_vesting_routes_title')}
      </div>
      <div
        className="caption"
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
        {vestingRoutesDifferences.map(({ account, differences }) => {
          return (
            <VestinRouteItemComponent
              key={`vesting-route-item-${account}`}
              account={account}
              differences={differences}
              nextCarouselSlide={nextCarouselSlide}
              isLast={pageIndex === vestingRoutesDifferences.length - 1}
              clearDisplayWrongVestingRoutes={closePopup}
            />
          );
        })}
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
