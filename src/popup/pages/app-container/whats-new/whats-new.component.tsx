import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { WhatNew } from 'src/whats-new';
import './whats-new.component.scss';

interface Props {
  onOverlayClick: () => void;
}

const WhatsNew = ({ onOverlayClick }: Props) => {
  const [pageIndex, setPageIndex] = useState(0);
  const locale = 'en'; // later use getUILanguage()

  const next = () => {
    setPageIndex(pageIndex + 1);
  };
  const previous = () => {
    setPageIndex(pageIndex - 1);
  };

  const finish = () => {
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.LAST_VERSION_UPDATE,
      WhatNew.version,
    );
    onOverlayClick();
  };

  return (
    <div className="whats-new">
      <div className="overlay"></div>
      <div className="whats-new-container">
        <div className="whats-new-title">
          {chrome.i18n.getMessage('popup_html_whats_new', [WhatNew.version])}
        </div>
        <Carousel
          showArrows={false}
          showIndicators={false}
          selectedItem={pageIndex}>
          {WhatNew.features.map((feature, index) => (
            <div className="carousel-item" key={`feature-${index}`}>
              <div className="image">
                <img src={`assets/images/whats-new/${feature.image}`} />
              </div>
              <div className="title">{feature.title[locale]}</div>
              <div className="description">{feature.description[locale]}</div>
            </div>
          ))}
        </Carousel>

        <div className="button-panel">
          {pageIndex > 0 && (
            <ButtonComponent
              type={ButtonType.STROKED}
              label="popup_html_whats_new_previous"
              onClick={() => previous()}
            />
          )}
          {pageIndex === WhatNew.features.length - 1 && (
            <ButtonComponent
              type={ButtonType.STROKED}
              label="popup_html_whats_new_got_it"
              onClick={() => finish()}
            />
          )}
          {pageIndex < WhatNew.features.length - 1 && (
            <ButtonComponent
              type={ButtonType.STROKED}
              label="popup_html_whats_new_next"
              onClick={() => next()}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const WhatsNewComponent = WhatsNew;
