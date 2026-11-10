import { ResultMessagePageComponent } from '@common-ui/result-message-page/result-message-page.component';
import { ResultMessage } from '@dialog/interfaces/messages.interface';
import { DIALOG_FEEDBACK_DISPLAY_MS } from '@reference-data/dialog-feedback.constants';
import React, { useEffect } from 'react';

type Props = {
  data: ResultMessage;
  onClose?: () => void;
};

export const RequestResponse = ({ data, onClose }: Props) => {
  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }
    window.close();
  };

  useEffect(() => {
    if (!data.msg.success) {
      return;
    }

    const timeout = window.setTimeout(() => {
      handleClose();
    }, DIALOG_FEEDBACK_DISPLAY_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [data.msg.success, onClose]);

  return (
    <ResultMessagePageComponent
      type={data.msg.success ? 'success' : 'error'}
      title={
        data.msg.success
          ? 'message_container_title_success'
          : 'message_container_title_fail'
      }
      message={data.msg.message}
      messageI18nKey={data.msg.messageKey}
      messageI18nParams={data.msg.messageParams}
      skipMessageTranslation={!data.msg.messageKey}
      onClose={handleClose}
    />
  );
};
