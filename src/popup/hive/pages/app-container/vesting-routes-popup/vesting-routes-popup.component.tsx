import {
  UserVestingRoute,
  VestingRoute,
} from '@interfaces/vesting-routes.interface';
import { VestingRouteActionPanelComponent } from '@popup/hive/pages/app-container/vesting-routes-popup/vesting-route-item/vesting-route-action-panel.component';
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
      <div>
        <Carousel
          showArrows={false}
          showIndicators={false}
          selectedItem={pageIndex}
          showThumbs={false}
          showStatus={false}
          dynamicHeight
          renderIndicator={renderCustomIndicator}>
          {displayWrongVestingRoutesPopup.map((acc) => {
            return (
              <div
                className="carousel-item"
                key={`${acc.account}-vesting-routes`}>
                <div className="title">Account: @{acc.account}</div>
                <div className="vesting-item">
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
                              <div className="title">
                                percent: {item.percent}
                              </div>
                              <div className="title">
                                autoVest: {item.autoVest.toString()}
                              </div>
                              <VestingRouteActionPanelComponent
                                key={`${acc.account}-${item.id}-action-panel`}
                                item={item}
                                account={acc.account}
                                handleRevert={handleRevert}
                                handleIntentionalChanges={
                                  handleIntentionalChanges
                                }
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
                            <VestingRouteActionPanelComponent
                              key={`${acc.account}-${routeChanged.id}-action-panel`}
                              item={routeChanged}
                              account={acc.account}
                              handleRevert={handleRevert}
                              handleIntentionalChanges={
                                handleIntentionalChanges
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </Carousel>
      </div>
      <div className="popup-footer">
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
