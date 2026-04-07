import React, { useEffect, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';

export interface EditAccountParams {
  initialValue: string;
  onSubmit: (...params: any) => void;
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

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <PopupContainer className="seed-nickname-popup">
      <div className="popup-title">{chrome.i18n.getMessage(title)}</div>
      {caption && (
        <div className="caption">{chrome.i18n.getMessage(caption)}</div>
      )}
      <InputComponent
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          onInputChange?.(newValue);
        }}
        label={inputLabel ?? 'evm_address_nickname'}
        placeholder={inputPlaceholder ?? 'evm_address_nickname'}
        type={inputType ?? InputType.TEXT}
      />
      {errorMessage && (
        <div className="caption error-message">
          {chrome.i18n.getMessage(errorMessage)}
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
          onClick={() => onSubmit(value)}
          height="small"
        />
      </div>
    </PopupContainer>
  );
};
