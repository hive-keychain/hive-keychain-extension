import React, { useEffect } from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

type ResultMessagePageType = 'success' | 'error' | 'warning';

interface ResultMessagePageProps {
  type: ResultMessagePageType;
  title: string;
  message: string;
  titleParams?: string[];
  messageParams?: string[];
  warningMessage?: string;
  warningParams?: string[];
  skipTitleTranslation?: boolean;
  skipMessageTranslation?: boolean;
  skipWarningTranslation?: boolean;
  autoCloseDelayMs?: number;
  onClose: () => void;
}

const ResultMessagePage = ({
  type,
  title,
  message,
  titleParams,
  messageParams,
  warningMessage,
  warningParams,
  skipTitleTranslation,
  skipMessageTranslation,
  skipWarningTranslation,
  autoCloseDelayMs,
  onClose,
}: ResultMessagePageProps) => {
  useEffect(() => {
    if (!autoCloseDelayMs) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onClose();
    }, autoCloseDelayMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [autoCloseDelayMs, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'error':
        return SVGIcons.MESSAGE_ERROR;
      case 'warning':
        return SVGIcons.MESSAGE_WARNING;
      default:
        return SVGIcons.MESSAGE_SUCCESS;
    }
  };

  return (
    <div className="result-message-page">
      <div className="result-message-container">
        <div className="message-card">
          <SVGIcon icon={getIcon()} />
          <div className={`title ${type === 'success' ? 'success' : ''}`}>
            {skipTitleTranslation
              ? title
              : chrome.i18n.getMessage(title, titleParams)}
          </div>
          <div
            className="message"
            dangerouslySetInnerHTML={{
              __html: skipMessageTranslation
                ? message
                : chrome.i18n.getMessage(message, messageParams),
            }}></div>
          {warningMessage && (
            <div
              className="warning-message"
              dangerouslySetInnerHTML={{
                __html: skipWarningTranslation
                  ? warningMessage
                  : chrome.i18n.getMessage(warningMessage, warningParams),
              }}></div>
          )}
        </div>
      </div>
      <ButtonComponent
        additionalClass={type === 'success' ? 'success-button' : ''}
        label="message_container_close_button"
        onClick={onClose}
      />
    </div>
  );
};

export const ResultMessagePageComponent = ResultMessagePage;
