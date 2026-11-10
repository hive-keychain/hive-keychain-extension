import React from 'react';
import { toast } from 'react-toastify';
import Logger from 'src/utils/logger.utils';
import { COPY_TOAST_AUTO_CLOSE_MS } from './copy-toast.component';
import { CopyToastContent } from './copy-toast-content.component';

const COPY_TOAST_ID = 'copy-feedback-toast';

export const COPY_GENERIC_MESSAGE_KEY = 'swap_copied_to_clipboard';

let dismissTimeout: ReturnType<typeof setTimeout> | undefined;

const scheduleToastDismiss = () => {
  if (dismissTimeout) {
    clearTimeout(dismissTimeout);
  }

  dismissTimeout = setTimeout(() => {
    toast.dismiss(COPY_TOAST_ID);
    dismissTimeout = undefined;
  }, COPY_TOAST_AUTO_CLOSE_MS);
};

export const showCopyToast = (messageKey: string) => {
  const message = React.createElement(CopyToastContent, { messageKey });

  if (toast.isActive(COPY_TOAST_ID)) {
    toast.update(COPY_TOAST_ID, {
      autoClose: false,
      render: message,
    });
  } else {
    toast(message, {
      autoClose: false,
      closeButton: false,
      hideProgressBar: true,
      icon: false,
      pauseOnFocusLoss: false,
      pauseOnHover: false,
      toastId: COPY_TOAST_ID,
    });
  }

  scheduleToastDismiss();
};

export const copyTextWithToast = async (
  text: string,
  messageKey: string = COPY_GENERIC_MESSAGE_KEY,
) => {
  try {
    await navigator.clipboard.writeText(text);
    showCopyToast(messageKey);
    return true;
  } catch (error) {
    Logger.error(error);
    return false;
  }
};
