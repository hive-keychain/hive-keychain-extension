import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import Config from 'src/config';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const TutorialPopup = () => {
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

  const handleClick = (option: 'show' | 'skip') => {
    if (option === 'show') {
      chrome.tabs.create({
        url: `${Config.tutorial.baseUrl}/#/extension`,
      });
    }
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.SKIP_TUTORIAL,
      true,
    );
    setShow(false);
  };

  if (!show) return null;
  else
    return (
      <PopupContainer data-testid="tutorial-popup" className="tutorial">
        <div className="popup-title">
          {chrome.i18n.getMessage('popup_html_tutorial_popup_title')}
        </div>
        <img
          src={'/assets/images/popup/landscape_tutorial_popup.png'}
          alt="tutorial-popup-image"
          className="image"
        />
        <div
          className="sub-title"
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage(
              'popup_html_tutorial_popup_description',
            ),
          }}></div>
        <div className="buttons-container">
          <ButtonComponent
            label="popup_html_tutorial_popup_skip_label"
            type={ButtonType.ALTERNATIVE}
            onClick={() => handleClick('skip')}
            additionalClass="button"
          />
          <ButtonComponent
            label="popup_html_tutorial_popup_show_label"
            type={ButtonType.IMPORTANT}
            onClick={() => handleClick('show')}
            additionalClass="button"
          />
        </div>
        <div className="popup-footer"></div>
      </PopupContainer>
    );
};

export const TutorialPopupComponent = TutorialPopup;
