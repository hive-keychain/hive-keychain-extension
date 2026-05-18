import { ResultMessagePageComponent } from '@common-ui/result-message-page/result-message-page.component';
import { ErrorMessage } from '@dialog/interfaces/messages.interface';
import React from 'react';

type Props = {
  data: ErrorMessage;
  onClose?: () => void;
};

export const DialogError = ({ data, onClose }: Props) => {
  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }
    window.close();
  };

  return (
    <ResultMessagePageComponent
      type="error"
      title="message_container_title_fail"
      message={data.msg.display_msg}
      skipMessageTranslation={true}
      onClose={handleClose}
    />
  );
};
