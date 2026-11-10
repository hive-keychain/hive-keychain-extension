import React, { useEffect, useRef, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';

import { I18nUtils } from 'src/utils/i18n.utils';
import Logger from 'src/utils/logger.utils';
export interface EditAccountParams {
  initialValue: string;
  onSubmit: (value: string) => Promise<void> | void;
  onCancel: () => void;
  title: string;
  caption?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputType?: InputType;
  confirmLabel?: string;
  errorMessage?: string;
  onInputChange?: (value: string) => void;
}

interface Props {
  editParams: EditAccountParams;
}

export const EvmEditAccountPopup = ({ editParams }: Props) => {
  const {
    initialValue,
    onSubmit,
    onCancel,
    title,
    caption,
    inputLabel,
    inputPlaceholder,
    inputType,
    confirmLabel,
    errorMessage,
    onInputChange,
  } = editParams;

  const [value, setValue] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string>();
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setValue(initialValue);
    setSubmitErrorMessage(undefined);
  }, [initialValue]);

  const handleSubmit = async (): Promise<void> => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitErrorMessage(undefined);
    try {
      await onSubmit(value);
    } catch (error) {
      Logger.error('Unable to save EVM account changes', error);
      if (isMountedRef.current) {
        setSubmitErrorMessage('unknown_error');
      }
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  const displayedErrorMessage = errorMessage ?? submitErrorMessage;

  return (
    <PopupContainer className="seed-nickname-popup">
      <div className="popup-title">{I18nUtils.getMessage(title)}</div>
      {caption && (
        <div className="caption">{I18nUtils.getMessage(caption)}</div>
      )}
      <InputComponent
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          setSubmitErrorMessage(undefined);
          onInputChange?.(newValue);
        }}
        label={inputLabel ?? 'evm_address_nickname'}
        placeholder={inputPlaceholder ?? 'evm_address_nickname'}
        type={inputType ?? InputType.TEXT}
      />
      {displayedErrorMessage && (
        <div className="caption error-message">
          {I18nUtils.getMessage(displayedErrorMessage)}
        </div>
      )}
      <div className="popup-footer">
        <ButtonComponent
          label="dialog_cancel"
          type={ButtonType.ALTERNATIVE}
          onClick={onCancel}
          height="small"
        />
        <ButtonComponent
          type={ButtonType.IMPORTANT}
          label={confirmLabel ?? 'popup_html_confirm'}
          onClick={() => void handleSubmit()}
          height="small"
          disabled={isSubmitting}
        />
      </div>
    </PopupContainer>
  );
};
