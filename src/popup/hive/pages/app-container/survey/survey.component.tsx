import React, { useEffect, useState } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { Survey } from 'src/popup/hive/pages/app-container/survey/survey.interface';
import { SurveyUtils } from 'src/popup/hive/utils/survey.utils';

interface Props {
  survey: Survey;
}

const Survey = ({ survey }: Props) => {
  const [ready, setReady] = useState(false);
  const [image, setImage] = useState<HTMLImageElement>();

  useEffect(() => {
    const imageElement = new Image();
    imageElement.src = survey.image;
    setImage(imageElement);
    imageElement.onload = () => {
      setReady(true);
    };
  }, []);

  const noThanks = () => {
    SurveyUtils.setCurrentAsSeen();
    setReady(false);
  };

  const helpUs = () => {
    chrome.tabs.create({ url: survey.link });
    SurveyUtils.setCurrentAsSeen();
  };

  if (!ready) return null;
  else
    return (
      <PopupContainer data-testid="survey-component" className="survey">
        <div className="popup-title">{survey.title}</div>
        {image && (
          <div className="image">
            <img src={image.src} />
          </div>
        )}
        <div className="caption">
          {survey.description.map((desc) => (
            <div>{desc}</div>
          ))}
        </div>
        <div className="popup-footer">
          <ButtonComponent
            type={ButtonType.ALTERNATIVE}
            label="popup_html_survey_no_thanks"
            onClick={() => noThanks()}
          />
          <ButtonComponent
            dataTestId="help-us-page"
            type={ButtonType.IMPORTANT}
            label="popup_html_survey_help_us"
            onClick={() => helpUs()}
          />
        </div>
      </PopupContainer>
    );
};

export const SurveyComponent = Survey;
