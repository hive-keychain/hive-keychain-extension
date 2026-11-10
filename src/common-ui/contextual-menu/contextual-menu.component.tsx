import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import { PopupContainer } from '@common-ui/popup-container/popup-container.component';
import {
  ContextualMenu,
  ContextualMenuSectionItem,
} from '@interfaces/contextual-menu.interface';
import React, { useEffect, useRef, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { LabelComponent } from 'src/common-ui/label/label.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

import { I18nUtils } from 'src/utils/i18n.utils';
interface Props {
  menu: ContextualMenu;
}

export const ContextualMenuComponent = ({ menu }: Props) => {
  const [isMenuOpened, setMenuOpened] = useState<boolean>(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [isConfirmationPopupOpened, setConfirmationPopupOpened] =
    useState<boolean>(false);
  const [clickedItem, setClickedItem] = useState<ContextualMenuSectionItem>();

  useEffect(() => {
    if (!isMenuOpened) {
      return;
    }

    requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    });
  }, [isMenuOpened]);

  const closeMenu = (restoreFocus = false) => {
    setMenuOpened(false);
    if (restoreFocus) {
      setTimeout(() => triggerRef.current?.focus());
    }
  };

  const handleItemClick = (sectionItem: ContextualMenuSectionItem) => {
    setClickedItem(sectionItem);
    if (sectionItem.onClick) {
      if (sectionItem.needsConfirmation) {
        closeMenu();
        setConfirmationPopupOpened(true);
      } else {
        processOnClick(sectionItem);
      }
    }
  };

  const processOnClick = (sectionItem: ContextualMenuSectionItem) => {
    closeMenu();
    if (sectionItem.onClick) {
      sectionItem.onClick();
      setConfirmationPopupOpened(false);
    }
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const menuItems = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    const currentIndex = menuItems.indexOf(
      document.activeElement as HTMLElement,
    );
    const targetIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? menuItems.length - 1
          : (currentIndex + (event.key === 'ArrowDown' ? 1 : -1) +
              menuItems.length) %
            menuItems.length;
    menuItems[targetIndex]?.focus();
  };

  return (
    <>
      <div className={`contextual-menu ${isMenuOpened ? 'opened' : 'closed'}`}>
        <button
          ref={triggerRef}
          className="contextual-menu-trigger"
          type="button"
          aria-label={I18nUtils.getMessage('dialog_options')}
          aria-haspopup="menu"
          aria-expanded={isMenuOpened}
          aria-controls="contextual-menu-options"
          onClick={() => setMenuOpened(!isMenuOpened)}>
          <SVGIcon icon={SVGIcons.GLOBAL_MENU_DOTS} />
        </button>
        <div
          id="contextual-menu-options"
          ref={menuRef}
          className="contextual-menu-container"
          role="menu"
          onKeyDown={handleMenuKeyDown}>
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
                  <button
                    type="button"
                    role="menuitem"
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
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {isMenuOpened && (
          <div
            className="contextual-menu-overlay"
            onClick={() => closeMenu()}></div>
        )}
      </div>
      {isConfirmationPopupOpened && clickedItem && (
        <PopupContainer className="seed-nickname-popup">
          <div className="popup-title">
            {I18nUtils.getMessage(clickedItem.label)}
          </div>

          {clickedItem.confirmationMessage && (
            <div className="caption">
              {I18nUtils.getMessage(clickedItem.confirmationMessage)}
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
