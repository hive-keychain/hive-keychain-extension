import React from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import DialogHeader from 'src/dialog/components/dialog-header/dialog-header.component';
//import './unlock.scss';

type Props = {
  data: ErrorMessage;
};

type ErrorMessage = {
  msg: { display_msg: string };
};

const DialogError = ({ data }: Props) => {
  return (
    <>
      <DialogHeader title={chrome.i18n.getMessage('dialog_header_error')} />
      <p style={{ wordBreak: 'break-word' }}>{data.msg.display_msg}</p>

      <ButtonComponent
        label={'dialog_ok'}
        onClick={() => {
          window.close();
        }}
      />
    </>
  );
};

export default DialogError;
