import {
  UserLastCurrentRoutes,
  UserVestingRoute,
} from '@interfaces/vesting-routes.interface';
import { VestinRouteItemComponent } from '@popup/hive/pages/app-container/vesting-routes-popup/vesting-route-item/vesting-route-item.component';
import { VestingRoutesUtils } from '@popup/hive/utils/vesting-routes.utils';
import _ from 'lodash';
import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
//TODO imporant bellow.
//  - Show the options: (skip or revert) for each account at the bottom.
//  - remove the next/prev buttons, add the indicators.
//  - each time the user select one option and succed, move to the next.
//  -> broadcast:
//    -> check when last doesnt have that item, so the one to broadcast is current. & viceversa.
//  - if last, close & display the success popup on top.
//  - clean unused remove unused interfaces.
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
  const [optionActionSelected, setOptionActionSelected] = useState<{
    option: string;
    account: string;
  }>();

  const next = () => {
    setPageIndex(pageIndex + 1);
  };

  //TODO cleanup
  const previous = () => {
    setPageIndex(pageIndex - 1);
  };

  const finish = () => {
    clearDisplayWrongVestingRoutes();
  };

  const skipAndSave = async (displayedData: UserLastCurrentRoutes[]) => {
    const lastVestingRoutes = await VestingRoutesUtils.getLastVestingRoutes();
    const copyDisplayedData = displayedData.map((item) => {
      return {
        account: item.account,
        routes: item.currentRoutes,
      } as UserVestingRoute;
    });
    const updatedLastList = lastVestingRoutes!.map((lastItem) => {
      let foundToUpdate = copyDisplayedData.find(
        (l) => l.account === lastItem.account,
      );
      if (foundToUpdate) {
        return {
          account: lastItem.account,
          routes: _.merge(foundToUpdate.routes, lastItem.routes),
        };
      } else
        return {
          account: lastItem.account,
          routes: lastItem.routes,
        };
    });
    console.log('About to save: ', { updatedLastList, lastVestingRoutes });
    await VestingRoutesUtils.saveLastVestingRoutes(updatedLastList);
    clearDisplayWrongVestingRoutes();
  };

  const renderCustomIndicator = (
    clickHandler: (e: React.MouseEvent | React.KeyboardEvent) => void,
    isSelected: boolean,
    index: number,
  ) => {
    return (
      <li
        key={`vesting-route-dot-indicator-${index}`}
        className={`dot ${isSelected ? 'selected' : ''}`}
        // onClick={(e) => {
        //   // clickHandler(e);
        //   setPageIndex(index);
        // }}
      ></li>
    );
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
      {/* //TODO clenup unused */}
      {/* <div className="popup-footer">
        {pageIndex === displayWrongVestingRoutesPopup.length - 1 && (
          <ButtonComponent
            //TODO add missing tr
            skipLabelTranslation
            dataTestId="button-revert-vesting-routes"
            type={ButtonType.IMPORTANT}
            label="These Changes are intentional"
            onClick={() => skipAndSave(displayWrongVestingRoutesPopup)}
            additionalClass="margin-bottom-8px"
          />
        )}
        <div className="footer-row">
          {pageIndex > 0 && (
            <ButtonComponent
              type={ButtonType.ALTERNATIVE}
              label="popup_html_whats_new_previous"
              onClick={() => previous()}
            />
          )}
          {pageIndex === displayWrongVestingRoutesPopup.length - 1 && (
            <ButtonComponent
              //TODO add missing tr
              skipLabelTranslation
              dataTestId="button-last-page"
              type={ButtonType.IMPORTANT}
              label="Revert All"
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
      </div> */}
    </PopupContainer>
  );
};

export const VestingRoutesPopupComponent = VestingRoutesPopup;
