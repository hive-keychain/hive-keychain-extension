import {
  UserVestingRoute,
  VestingRoute,
} from '@interfaces/vesting-routes.interface';
import { VestinRouteItemComponent } from '@popup/hive/pages/app-container/vesting-routes-popup/vesting-route-item/vesting-route-item.component';
import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
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
  const [optionActionSelected, setOptionActionSelected] = useState<{
    option: string;
    account: string;
  }>();
  const [
    markAsIntentionalVestingRouteList,
    setMarkAsIntentionalVestingRouteList,
  ] = useState<VestingRoute[]>([]);

  const next = () => {
    //TODO handle action
    //TODO very important before continuing this road.
    //  -> each vesting route that changed, should have the option(skip/revert) as part of the item, so code the item
    //  -> keep the scrolling in item.
    if (optionActionSelected && optionActionSelected.option === 'skipAndSave') {
      const found = displayWrongVestingRoutesPopup.find(
        (item) => item.account === optionActionSelected.account,
      );
      if (found) {
        const { account } = optionActionSelected;
        console.log({ account, found });
        // VestingRoutesUtils.updateLastVestingRoutes(account,);
      }
    } else if (
      optionActionSelected &&
      optionActionSelected.option === 'revert'
    ) {
    }
    //TODO uncoment bellow when finished above
    // setPageIndex(pageIndex + 1);
    // setOptionActionSelected(undefined);
  };

  //TODO cleanup
  // const previous = () => {
  //   setPageIndex(pageIndex - 1);
  // };

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

  const handleIntentionalChanges = (
    account: string,
    routeChanged: VestingRoute,
  ) => {
    //TODO what it should happen here is, we save this vesting route in local storage
    // //TODO while testing the displaying is commented, TO add later on
    // VestingRoutesUtils.saveLastVestingRoutes(currentVestingRoutes);

    console.log('//TODO mark to skip for item', { account, routeChanged });
    // const foundInList = markAsIntentionalVestingRouteList.find(
    //   (item) => item.id === routeChanged.id,
    // );
    // let tempList = [...markAsIntentionalVestingRouteList];
    // if (foundInList) {
    //   // setMarkAsIntentionalVestingRouteList(tempList.filter(item => item.id !== routeChanged.id));
    //   tempList = tempList.filter((item) => item.id !== routeChanged.id);
    // } else {
    //   tempList.push(routeChanged);
    // }
    // setMarkAsIntentionalVestingRouteList(tempList);
  };

  const handleSelect = (option: string, account: string) => {
    if (option === 'default') {
      setOptionActionSelected(undefined);
      return;
    }
    console.log({ option, account }); //TODO remove line
    //TODo to finish bellow
    setOptionActionSelected({
      option,
      account,
    });
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
        dynamicHeight
        renderIndicator={renderCustomIndicator}>
        {displayWrongVestingRoutesPopup.map((acc, index) => {
          return (
            <VestinRouteItemComponent
              key={`${acc.account}-${index}`}
              userVestingRoute={acc}
            />
          );
          // return (
          //   <div
          //     className={`carousel-item`}
          //     key={`${acc.account}-vesting-routes-${index}`}>
          //     <div className="title">Account: @{acc.account}</div>
          //     <div
          //       className="vesting-item"
          //       key={`${acc.account}-vesting-item-${index}`}>
          //       <div
          //         className="vesting-item-row"
          //         key={`${acc.account}-vesting-item-row-${index}`}>
          //         <div
          //           className="vesting-route-item flex-align-left"
          //           key={`${acc.account}-vesting-itemrow-left-${index}`}>
          //           <div
          //             className="title"
          //             key={`${acc.account}-old-title-${index}`}>
          //             Before
          //           </div>
          //           {acc.routesChanged ? (
          //             acc.routesChanged.map((item, i) => {
          //               return (
          //                 <VestinRouteItemComponent
          //                   preFixKey={`${item.id}-old-route-found-${index}-${i}`}
          //                   item={item}
          //                   account={acc.account}
          //                   handleIntentionalChanges={
          //                     handleIntentionalChanges
          //                   }
          //                   handleRevert={handleRevert}
          //                 />
          //               );
          //             })
          //           ) : (
          //             <div
          //               className="title"
          //               key={`${acc.account}-non-existent-title-${index}`}>
          //               Non existent!
          //             </div>
          //           )}
          //         </div>
          //         <div
          //           className="vesting-route-item flex-align-right"
          //           key={`${acc.account}-vesting-itemrow-right-${index}`}>
          //           <div
          //             className="title"
          //             key={`${acc.account}-new-title-${index}`}>
          //             Now
          //           </div>
          //           {acc.routes.map((routeChanged, i) => {
          //             return (
          //               <VestinRouteItemComponent
          //                 preFixKey={`${routeChanged.id}new-route-found-${index}-${i}`}
          //                 item={routeChanged}
          //                 account={acc.account}
          //                 handleIntentionalChanges={handleIntentionalChanges}
          //                 handleRevert={handleRevert}
          //               />
          //             );
          //           })}
          //         </div>
          //       </div>
          //     </div>
          //   </div>
          // );
        })}
      </Carousel>

      <div className="popup-footer">
        {/* //TODO cleanup unused code */}
        {/* {pageIndex > 0 && (
          <ButtonComponent
            type={ButtonType.ALTERNATIVE}
            label="popup_html_whats_new_previous"
            onClick={() => previous()}
          />
        )} */}
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
            disabled={optionActionSelected === undefined}
            dataTestId="button-next-page"
            type={ButtonType.ALTERNATIVE}
            label="popup_html_whats_new_next"
            onClick={() => next()}
            additionalClass={
              optionActionSelected === undefined ? 'button-disabled' : undefined
            }
          />
        )}
      </div>
    </PopupContainer>
  );
};

export const VestingRoutesPopupComponent = VestingRoutesPopup;

//TODO bellow check if useful or delete
{
  /* <select
                    className="mandatory-select-option"
                    onChange={(e) => handleSelect(e.target.value, acc.account)}>
                    <option
                      defaultChecked
                      defaultValue={'default'}
                      label="Please Select an option"
                      value={'default'}>
                      Default
                    </option>
                    <option
                      label="These changes are intentional"
                      value="skipAndSave">
                      Some option
                    </option>
                    <option label="Revert Changes" value="revert">
                      Other option
                    </option>
                  </select> */
}
