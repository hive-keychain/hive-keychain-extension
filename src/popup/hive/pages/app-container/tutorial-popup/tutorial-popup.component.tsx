import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';

interface Props {
  // onOverlayClick: () => void;
  // content: WhatsNewContent;
}

const TutorialPopup = ({}: Props) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [images, setImages] = useState<HTMLImageElement[]>();
  const [ready, setReady] = useState(false);
  const locale = 'en'; // later use getUILanguage()
  const [show, setShow] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const skipTutorial = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.SKIP_TUTORIAL,
    );
    if (!skipTutorial) {
      setShow(true);
    }
  };

  // useEffect(() => {
  //   const imgs = [];
  //   for (const feature of content.features[locale]) {
  //     const imageElement = new Image();
  //     imageElement.src = feature.image;
  //     imgs.push(imageElement);
  //   }
  //   setImages(imgs);
  //   imgs[0].onload = () => {
  //     setReady(true);
  //   };
  // }, []);

  // const renderCustomIndicator = (
  //   clickHandler: (e: React.MouseEvent | React.KeyboardEvent) => void,
  //   isSelected: boolean,
  //   index: number,
  //   label: string,
  // ) => {
  //   return (
  //     <li
  //       className={`dot ${isSelected ? 'selected' : ''}`}
  //       onClick={(e) => {
  //         clickHandler(e);
  //         setPageIndex(index);
  //       }}></li>
  //   );
  // };

  if (!show) return null;
  //TODO change classes as need
  else
    return (
      <PopupContainer data-testid="whats-new-popup" className="whats-new">
        <div className="popup-title">"Onboarding Tutorial"</div>

        <div className="popup-footer"></div>
      </PopupContainer>
    );
};

export const TutorialPopupComponent = TutorialPopup;
