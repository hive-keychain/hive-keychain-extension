import { KeychainRequest } from 'hive-keychain-commons';
import React from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

type Props = {
  data: ResultMessage;
};

type ResultMessage = {
  msg: { message: string; success: boolean; data: KeychainRequest };
};

const RequestResponse = ({ data }: Props) => {
  if (data.msg.success) {
    setTimeout(() => {
      window.close();
    }, 3000);
  }
  return (
<<<<<<< HEAD
    <>
      <DialogHeader
        title={
          data.msg.success
            ? `${chrome.i18n.getMessage('dialog_header_success')} !`
            : `${chrome.i18n.getMessage('dialog_header_error')} !`
        }
      />
      {data.msg.message.split(/<br\s?\/?>/g).map((msg) => (
        <p style={{ wordBreak: 'break-word' }}>{msg}</p>
      ))}
      {
        /* {data.msg.data.type === KeychainRequestTypes.swap && (
        <ButtonComponent
          label={'html_popup_token_swaps_history'}
          additionalClass="almost-bottom"
          fixToBottom
          onClick={() => {
            window.close();
          }}
        />
      )} */
        //TODO: Show history directly
      }
      <ButtonComponent
        label={'dialog_ok'}
        fixToBottom
        onClick={() => {
          window.close();
        }}
      />
    </>
=======
    <div className="response-message-container">
      <div className="message-card">
        <SVGIcon
          icon={
            data.msg.success ? NewIcons.MESSAGE_SUCCESS : NewIcons.MESSAGE_ERROR
          }
        />
        <div className="title">
          {chrome.i18n.getMessage(
            data.msg.success
              ? 'message_container_title_success'
              : 'message_container_title_fail',
          )}
        </div>
        <div className="message">
          {data.msg.message.split(/<br\s?\/?>/g).map((msg, index) => (
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
>>>>>>> refactor/ui-ux2
  );
};

export default RequestResponse;
