import React from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import Config from 'src/config';

import { I18nUtils } from 'src/utils/i18n.utils';
export const ErrorFallback = ({ error, resetErrorBoundary }: any) => {
  const formattedErrorMessage = `
    \`\`\` 
    ${error.message} \n\r
    ${error.stack} \n\r
    \`\`\`
    `;

  const handleClickOnCopy = async () => {
    await navigator.clipboard.writeText(formattedErrorMessage);
    chrome.tabs.create({ url: Config.social.discord });
  };

  const handleClickOnReset = async () => {
    await resetErrorBoundary();
  };

  return (
    <div className="error-page">
      <SVGIcon icon={SVGIcons.MESSAGE_ERROR} />
      <div className="title">
        {I18nUtils.getMessage('error_message_title')}
      </div>

      <div className="detail">
        <div className="message">{error.message.toString()}</div>
        <div className="stack">{error.stack.toString()}</div>
      </div>
      <div className="buttons-container">
        <ButtonComponent
          onClick={() => handleClickOnCopy()}
          label="html_popup_copy_error"
          type={ButtonType.ALTERNATIVE}
          height="small"
        />
        <ButtonComponent
          onClick={() => handleClickOnReset()}
          label="reload_extension"
          type={ButtonType.IMPORTANT}
          height="small"
        />
      </div>
    </div>
  );
};
