import { ResultMessagePageComponent } from '@common-ui/result-message-page/result-message-page.component';
import { ResultMessage } from '@dialog/interfaces/messages.interface';
import { DIALOG_FEEDBACK_DISPLAY_MS } from '@reference-data/dialog-feedback.constants';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useEffect } from 'react';

type Props = {
  data: ResultMessage;
  onClose?: () => void;
};

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const feedbackMessageHtml = (data: ResultMessage): string => {
  const raw = String(data.msg.message ?? '');
  switch (data.command) {
    case DialogCommand.ANSWER_EVM_REQUEST:
      return escapeHtml(raw);
    case DialogCommand.ANSWER_REQUEST:
      return raw
        .split(/<br\s?\/?>/g)
        .map(
          (part) => `<p style="word-break:break-word">${escapeHtml(part)}</p>`,
        )
        .join('');
    default:
      return escapeHtml(raw);
  }
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
      message={feedbackMessageHtml(data)}
      skipMessageTranslation={true}
      onClose={handleClose}
    />
  );
};
