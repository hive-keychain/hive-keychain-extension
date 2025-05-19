import React, { useState } from 'react';
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
}

interface Props {
  editParams: EditAccountParams;
}

export const EvmEditAccountPopup = ({ editParams }: Props) => {
  const { initialValue, onSubmit, onCancel, title, caption } = editParams;

  const [value, setValue] = useState(initialValue);

  return (
    <PopupContainer className="seed-nickname-popup">
      <div className="popup-title">{chrome.i18n.getMessage(title)}</div>
      {caption && (
        <div className="caption">{chrome.i18n.getMessage(caption)}</div>
      )}
      <InputComponent
        value={value}
        onChange={setValue}
        label="evm_address_nickname"
        placeholder="evm_address_nickname"
        type={InputType.TEXT}
      />
      <div className="popup-footer">
        <ButtonComponent
          label="dialog_cancel"
          type={ButtonType.ALTERNATIVE}
          onClick={onCancel}
          height="small"
        />
        <ButtonComponent
          type={ButtonType.IMPORTANT}
          label="popup_html_confirm"
          onClick={() => onSubmit(value)}
          height="small"
        />
      </div>
    </PopupContainer>
  );
};
