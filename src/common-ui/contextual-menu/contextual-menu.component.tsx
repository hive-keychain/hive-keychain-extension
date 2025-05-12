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

  const handleItemClick = (sectionItem: ContextualMenuSectionItem) => {
    if (sectionItem.onClick) {
      setMenuOpened(false);
      sectionItem.onClick();
    }
  };

  return (
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
  );
};
