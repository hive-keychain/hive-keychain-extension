import React, { useEffect } from 'react';
import { ToastContainer, ToastTransitionProps } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const COPY_TOAST_AUTO_CLOSE_MS = 2000;

const CopyToastTransition = ({
  children,
  done,
  isIn,
}: ToastTransitionProps) => {
  useEffect(() => {
    if (!isIn) {
      done();
    }
  }, [done, isIn]);

  return <>{children}</>;
};

export const CopyToastContainer = () => {
  return (
    <ToastContainer
      autoClose={false}
      bodyClassName="copy-toast-body"
      className="copy-toast-container"
      closeButton={false}
      draggable={false}
      hideProgressBar
      icon={false}
      limit={1}
      newestOnTop={false}
      pauseOnFocusLoss={false}
      pauseOnHover={false}
      position="top-center"
      toastClassName="copy-toast copy-toast--success"
      transition={CopyToastTransition}
    />
  );
};

export { COPY_TOAST_AUTO_CLOSE_MS };
