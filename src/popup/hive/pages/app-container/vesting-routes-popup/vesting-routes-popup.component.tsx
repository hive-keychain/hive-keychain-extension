import { LocalAccount } from '@interfaces/local-account.interface';
import { AccountVestingRoute } from '@interfaces/vesting-routes.interface';
import { VestinRouteItemComponent } from '@popup/hive/pages/app-container/vesting-routes-popup/vesting-route-item/vesting-route-item.component';
import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';

interface Props {
  displayWrongVestingRoutesPopup: AccountVestingRoute[];
  clearDisplayWrongVestingRoutes: () => void;
  setDisplayWrongVestingRoutesPopup: (
    updatedWrongVestingRoutes: AccountVestingRoute[] | undefined,
  ) => void;
  localAccounts: LocalAccount[];
}

const VestingRoutesPopup = ({
  displayWrongVestingRoutesPopup,
  clearDisplayWrongVestingRoutes,
  setDisplayWrongVestingRoutesPopup,
  localAccounts,
}: Props) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [optionActionSelected, setOptionActionSelected] = useState<{
    option: string;
    account: string;
  }>();

  const next = () => {
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
        {displayWrongVestingRoutesPopup
          .filter(
            (item) => item.lastRoutes.length > 0 || item.newRoutes.length > 0,
          )
          .map((acc, index) => {
            return (
              <VestinRouteItemComponent
                key={`${acc.account}-${index}`}
                userVestingRoute={acc}
              />
            );
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
