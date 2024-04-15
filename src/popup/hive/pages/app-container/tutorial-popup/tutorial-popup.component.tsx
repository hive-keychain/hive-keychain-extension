import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';

interface Props {
  username: string;
}

const TutorialPopup = ({ username }: Props) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async (reset?: boolean) => {
    //TODO remove reset option after finishing tutorial
    if (reset) {
      console.log('Reset SKIP_TUTORIAL!');
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.SKIP_TUTORIAL,
        null,
      );
      return;
    }
    const skipTutorial = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.SKIP_TUTORIAL,
    );
    if (!skipTutorial) {
      setShow(true);
    }
  };

  const handleClick = (option: 'tutorial_seen' | 'tutorial_opted_out') => {
    if (option === 'tutorial_seen') {
      //TODO somehow pass user session data to url
      chrome.tabs.create({ url: 'http://localhost:3000/' });
    }
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.SKIP_TUTORIAL,
      option,
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
        <div className="sub-title">
          {chrome.i18n.getMessage('popup_html_tutorial_popup_sub_title')}
        </div>
        <div className="buttons-container">
          <ButtonComponent
            label="popup_html_tutorial_popup_user_opt_out_label"
            type={ButtonType.ALTERNATIVE}
            onClick={() => handleClick('tutorial_opted_out')}
            additionalClass="button"
          />
          <ButtonComponent
            label="popup_html_tutorial_popup_seen_label"
            type={ButtonType.IMPORTANT}
            onClick={() => handleClick('tutorial_seen')}
            additionalClass="button"
          />
        </div>
        <div className="popup-footer"></div>
      </PopupContainer>
    );
};

export const TutorialPopupComponent = TutorialPopup;
