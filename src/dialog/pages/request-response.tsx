import React from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import DialogHeader from 'src/dialog/components/dialog-header/dialog-header.component';

type Props = {
  data: ResultMessage;
};

type ResultMessage = {
  msg: { message: string; success: boolean };
};

const RequestResponse = ({ data }: Props) => {
  if (data.msg.success) {
    setTimeout(() => {
      window.close();
    }, 3000);
  }
  return (
    <>
      <DialogHeader
        title={
          data.msg.success
            ? `${chrome.i18n.getMessage('dialog_header_success')} !`
            : `${chrome.i18n.getMessage('dialog_header_error')} !`
        }
      />
      <p
        dangerouslySetInnerHTML={{
          __html: data.msg.message,
        }}
        style={{ wordBreak: 'break-word' }}></p>

      <ButtonComponent
        label={'dialog_ok'}
        fixToBottom
        onClick={() => {
          window.close();
        }}
      />
    </>
  );
};

export default RequestResponse;
