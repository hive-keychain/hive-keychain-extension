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
  url: string;
}

const WhatsNew = ({ onOverlayClick, url }: Props) => {
  const [pageIndex, setPageIndex] = useState(0);
  const locale = 'en'; // later use getUILanguage()

  const next = () => {
    setPageIndex(pageIndex + 1);
  };
  const previous = () => {
    setPageIndex(pageIndex - 1);
  };

  const navigateToArticle = (url: string) => {
    chrome.tabs.create({ url: url });
  };

  const finish = () => {
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.LAST_VERSION_UPDATE,
      WhatNew.version,
    );
    onOverlayClick();
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
    <div className="whats-new">
      <div className="overlay"></div>
      <div className="whats-new-container">
        <div className="whats-new-title">
          {chrome.i18n.getMessage('popup_html_whats_new', [WhatNew.version])}
        </div>
        <Carousel
          showArrows={false}
          showIndicators={WhatNew.features.length > 1}
          selectedItem={pageIndex}
          showThumbs={false}
          showStatus={false}
          renderIndicator={renderCustomIndicator}>
          {WhatNew.features.map((feature, index) => (
            <div className="carousel-item" key={`feature-${index}`}>
              <div className="image">
                <img src={`assets/images/whats-new/${feature.image}`} />
              </div>
              <div className="title">{feature.title[locale]}</div>
              <div className="description">{feature.description[locale]}</div>
              <div className="extra-information">
                {feature.extraInformation[locale]}
              </div>
              <a
                className="read-more-link"
                onClick={() => navigateToArticle(`${url}#${feature.anchor}`)}>
                {chrome.i18n.getMessage('html_popup_read_more')}
              </a>
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
