import React, { useEffect } from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

import { HtmlUtils } from 'src/utils/html.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
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
  /** Locale key resolved in the dialog via getSafeI18nHtml (params escaped at render). */
  messageI18nKey?: string;
  messageI18nParams?: string[];
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
  messageI18nKey,
  messageI18nParams,
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

  const getMessageHtml = () => {
    if (messageI18nKey) {
      return HtmlUtils.getSafeI18nHtml(messageI18nKey, messageI18nParams);
    }

    if (skipMessageTranslation) {
      return HtmlUtils.escapeHtml(message);
    }

    return HtmlUtils.getSafeI18nHtml(message, messageParams);
  };

  return (
    <div className="result-message-page">
      <div className="result-message-container">
        <div className="message-card">
          <SVGIcon icon={getIcon()} />
          <div className={`title ${type === 'success' ? 'success' : ''}`}>
            {skipTitleTranslation
              ? title
              : I18nUtils.getMessage(title, titleParams)}
          </div>
          <div
            className="message"
            dangerouslySetInnerHTML={{
              __html: getMessageHtml(),
            }}></div>
          {warningMessage && (
            <div
              className="warning-message"
              dangerouslySetInnerHTML={{
                __html: skipWarningTranslation
                  ? HtmlUtils.escapeHtml(warningMessage)
                  : HtmlUtils.getSafeI18nHtml(warningMessage, warningParams),
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
