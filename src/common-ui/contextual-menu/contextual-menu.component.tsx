import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import { PopupContainer } from '@common-ui/popup-container/popup-container.component';
import {
  ContextualMenu,
  ContextualMenuSectionItem,
} from '@interfaces/contextual-menu.interface';
import React, { useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { LabelComponent } from 'src/common-ui/label/label.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface Props {
  menu: ContextualMenu;
}

export const ContextualMenuComponent = ({ menu }: Props) => {
  const [isMenuOpened, setMenuOpened] = useState<boolean>(false);

  const [isConfirmationPopupOpened, setConfirmationPopupOpened] =
    useState<boolean>(false);
  const [clickedItem, setClickedItem] = useState<ContextualMenuSectionItem>();

  const handleItemClick = (sectionItem: ContextualMenuSectionItem) => {
    setClickedItem(sectionItem);
    if (sectionItem.onClick) {
      if (sectionItem.needsConfirmation) {
        setConfirmationPopupOpened(true);
      } else {
        processOnClick(sectionItem);
      }
    }
  };

  const processOnClick = (sectionItem: ContextualMenuSectionItem) => {
    setMenuOpened(false);
    if (sectionItem.onClick) {
      sectionItem.onClick();
      setConfirmationPopupOpened(false);
    }
  };

  return (
    <>
      <div className={`contextual-menu ${isMenuOpened ? 'opened' : 'closed'}`}>
        <SVGIcon
          icon={SVGIcons.GLOBAL_MENU_DOTS}
          onClick={() => setMenuOpened(!isMenuOpened)}
        />
        <div className={`contextual-menu-container`}>
          {menu.sections.map((section, index) => (
            <div
              className="contextual-menu-section"
              key={`contextual-menu-section-${index}`}>
              {section.title && (
                <div className="section-title">
                  <LabelComponent
                    value={section.title}
                    skipTranslation={section.skipTranslation}
                  />
                </div>
              )}
              <div className="section-items">
                {section.items.map((sectionItem, index) => (
                  <div
                    className="section-item"
                    key={`section-item-${index}`}
                    onClick={() => handleItemClick(sectionItem)}>
                    <SVGIcon
                      className="section-item-icon"
                      icon={sectionItem.icon}
                    />
                    <LabelComponent
                      value={sectionItem.label}
                      skipTranslation={sectionItem.skipTranslation}
                      className="label"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {isMenuOpened && (
          <div
            className="contextual-menu-overlay"
            onClick={() => setMenuOpened(false)}></div>
        )}
      </div>
      {isConfirmationPopupOpened && clickedItem && (
        <PopupContainer className="seed-nickname-popup">
          <div className="popup-title">
            {chrome.i18n.getMessage(clickedItem.label)}
          </div>

          {clickedItem.confirmationMessage && (
            <div className="caption">
              {chrome.i18n.getMessage(clickedItem.confirmationMessage)}
            </div>
          )}

          <div className="popup-footer">
            <ButtonComponent
              label="dialog_cancel"
              type={ButtonType.ALTERNATIVE}
              onClick={() => setConfirmationPopupOpened(false)}
              height="small"
            />
            <ButtonComponent
              type={ButtonType.IMPORTANT}
              label="popup_html_confirm"
              onClick={() => processOnClick(clickedItem)}
              height="small"
            />
          </div>
        </PopupContainer>
      )}
    </>
  );
};
