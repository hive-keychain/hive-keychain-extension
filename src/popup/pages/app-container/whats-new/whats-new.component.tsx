import {
  Feature,
  WhatsNewContent,
} from '@popup/pages/app-container/whats-new/whats-new.interface';
import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { WhatsNewUtils } from 'src/utils/whats-new.utils';
import './whats-new.component.scss';

interface Props {
  onOverlayClick: () => void;
  content: WhatsNewContent;
}

const WhatsNew = ({ onOverlayClick, content }: Props) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [images, setImages] = useState<HTMLImageElement[]>();
  const [ready, setReady] = useState(false);
  const locale = 'en'; // later use getUILanguage()

  useEffect(() => {
    const imgs = [];
    for (const feature of content.features[locale]) {
      const imageElement = new Image();
      imageElement.src = feature.image;
      imgs.push(imageElement);
    }
    setImages(imgs);
    imgs[0].onload = () => {
      setReady(true);
    };
  }, []);

  const next = () => {
    setPageIndex(pageIndex + 1);
  };
  const previous = () => {
    setPageIndex(pageIndex - 1);
  };

  const handleOnClick = (content: WhatsNewContent, feature: Feature) => {
    if (feature.externalUrl) {
      chrome.tabs.create({ url: feature.externalUrl });
    } else {
      navigateToArticle(`${content.url}#${feature.anchor}`);
    }
  };

  const navigateToArticle = (url: string) => {
    chrome.tabs.create({ url: url });
  };

  const finish = () => {
    WhatsNewUtils.saveLastSeen();
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

  if (!ready) return null;
  else
    return (
      <div data-testid="whats-new-popup" className="whats-new">
        <div className="overlay"></div>
        <div className="whats-new-container">
          <div className="whats-new-title">
            {chrome.i18n.getMessage('popup_html_whats_new', [content.version])}
          </div>
          {images && (
            <Carousel
              showArrows={false}
              showIndicators={content.features[locale].length > 1}
              selectedItem={pageIndex}
              showThumbs={false}
              showStatus={false}
              renderIndicator={renderCustomIndicator}>
              {content.features[locale].map((feature, index) => (
                <div className="carousel-item" key={`feature-${index}`}>
                  <div className="image">
                    <img src={images[index].src} />
                  </div>
                  <div className="title">{feature.title}</div>
                  <div className="description">{feature.description}</div>
                  <div className="extra-information">
                    {feature.extraInformation}
                  </div>
                  <a
                    data-testid="link-whats-new-read-more"
                    className="read-more-link"
                    onClick={() => handleOnClick(content, feature)}>
                    {feature.overrideReadMoreLabel ??
                      chrome.i18n.getMessage('html_popup_read_more')}
                  </a>
                </div>
              ))}
            </Carousel>
          )}

          <div className="button-panel">
            {pageIndex > 0 && (
              <ButtonComponent
                type={ButtonType.STROKED}
                label="popup_html_whats_new_previous"
                onClick={() => previous()}
              />
            )}
            {pageIndex === content.features[locale].length - 1 && (
              <ButtonComponent
                dataTestId="button-last-page"
                type={ButtonType.STROKED}
                label="popup_html_whats_new_got_it"
                onClick={() => finish()}
              />
            )}
            {pageIndex < content.features[locale].length - 1 && (
              <ButtonComponent
                dataTestId="button-next-page"
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
