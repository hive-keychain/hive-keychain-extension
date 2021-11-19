import React from 'react';
import DialogHeader from 'src/dialog/components/dialog-header/dialog-header.component';
import FooterButton from 'src/dialog/components/footer-button/footer-button';
import './operation.scss';
type Props = {
  title: string;
  children: JSX.Element[];
  onConfirm: () => void;
};

const Operation = ({ title, children, onConfirm }: Props) => {
  return (
    <>
      <DialogHeader title={title} />
      <div className="operation_body">{...children}</div>
      <div className="operation_footer">
        <div className="operation_buttons">
          <FooterButton
            label="dialog_cancel"
            grey
            onClick={() => {
              window.close();
            }}
          />
          <FooterButton label="dialog_confirm" onClick={onConfirm} />
        </div>
      </div>
    </>
  );
};

export default Operation;
