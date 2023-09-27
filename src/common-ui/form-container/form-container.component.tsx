import React, { useEffect } from 'react';

interface FormContainerProps {
  children: any;
  onSubmit?: (...params: any) => void;
}

export const FormContainer = ({ children, onSubmit }: FormContainerProps) => {
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent) => {
    console.log(event.code);
    if (event.code === 'Enter' || event.code === 'NumpadEnter') {
      if (onSubmit) {
        onSubmit();
      }
    }
  };

  return <div className="form-container">{children}</div>;
};
