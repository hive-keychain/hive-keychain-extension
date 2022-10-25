import { Survey } from '@popup/pages/app-container/survey/survey.interface';
import React, { useEffect, useState } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { SurveyUtils } from 'src/utils/survey.utils';
import './survey.component.scss';

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
      <div aria-label="survey-component" className="survey">
        <div className="overlay"></div>
        <div className="survey-container">
          <div className="survey-title">{survey.title}</div>
          {image && (
            <div className="image">
              <img src={image.src} />
            </div>
          )}
          <div className="description">
            {survey.description.map((desc) => (
              <p>{desc}</p>
            ))}
          </div>
          <div className="button-panel">
            <ButtonComponent
              type={ButtonType.NO_BORDER}
              label="popup_html_survey_no_thanks"
              onClick={() => noThanks()}
            />
            <ButtonComponent
              ariaLabel="help-us-page"
              type={ButtonType.STROKED}
              label="popup_html_survey_help_us"
              onClick={() => helpUs()}
            />
          </div>
        </div>
      </div>
    );
};

export const SurveyComponent = Survey;
