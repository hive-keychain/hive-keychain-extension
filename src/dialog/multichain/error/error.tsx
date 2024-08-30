import React from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

type Props = {
  data: ErrorMessage;
};

type ErrorMessage = {
  msg: { display_msg: string };
};

const DialogError = ({ data }: Props) => {
  return (
    <div className="error-message-container">
      <div className="message-card">
        <SVGIcon icon={SVGIcons.MESSAGE_ERROR} />
        <div className="title">
          {chrome.i18n.getMessage('message_container_title_fail')}
        </div>
        <div className="message">
          {data.msg.display_msg.split(/<br\s?\/?>/g).map((msg, index) => (
            <p key={`p-${index}`} style={{ wordBreak: 'break-word' }}>
              {msg}
            </p>
          ))}
        </div>
        <ButtonComponent
          label="message_container_close_button"
          onClick={close}
        />
      </div>
    </div>
  );
};

export default DialogError;
