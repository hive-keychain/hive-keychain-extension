import { TransactionOptionsMetadata } from '@interfaces/keys.interface';
import React, { useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';

interface MetadataPopupProps {
  initialMetadata: TransactionOptionsMetadata;
  onSubmit: (metadata: TransactionOptionsMetadata) => void;
  onCancel: () => void;
}

export const MetadataPopup = ({
  initialMetadata,
  onSubmit,
  onCancel,
}: MetadataPopupProps) => {
  const [metadataForm, setMetadataForm] =
    useState<TransactionOptionsMetadata>(initialMetadata);

  const updateMetadataForm = (
    section: keyof TransactionOptionsMetadata,
    key: string,
    value: any,
  ) => {
    setMetadataForm((old: TransactionOptionsMetadata) => {
      const newState = { ...old };
      if (newState && newState[section]) {
        newState[section]![key] = value;
      }
      return newState;
    });
  };

  return (
    <div className="metadata-popup">
      <div className="metadata-content">
        {metadataForm.twoFACodes !== undefined && (
          <div className="two-fa-codes">
            <div className="section-title">
              {chrome.i18n.getMessage('multisig_bot_two_fa_codes')}
            </div>
            {Object.keys(metadataForm.twoFACodes).map((botName: string) => (
              <InputComponent
                type={InputType.TEXT}
                key={`bot-${botName}`}
                label={chrome.i18n.getMessage('multisig_bot_two_fa_code', [
                  botName,
                ])}
                skipLabelTranslation
                value={metadataForm.twoFACodes![botName]}
                onChange={(newValue) => {
                  updateMetadataForm('twoFACodes', botName, newValue);
                }}
              />
            ))}
          </div>
        )}
      </div>
      <div className="metadata-footer">
        <ButtonComponent
          label="popup_html_button_label_cancel"
          onClick={() => onCancel()}
          type={ButtonType.ALTERNATIVE}
          height="small"
        />
        <ButtonComponent
          label="popup_html_submit"
          onClick={() => onSubmit(metadataForm)}
          height="small"
        />
      </div>
    </div>
  );
};
