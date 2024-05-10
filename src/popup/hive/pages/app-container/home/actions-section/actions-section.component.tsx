import { ActionButtonList } from '@popup/hive/pages/app-container/home/actions-section/action-button.list';
import React from 'react';
import { ActionButtonComponent } from 'src/popup/hive/pages/app-container/home/actions-section/action-button/action-button.component';

type Props = {
  selectedToken: string;
  additionalClass?: string;
};
export const ActionsSectionComponent = ({
  selectedToken,
  additionalClass,
}: Props) => {
  return (
    <div className={`actions-section ${additionalClass ?? ''}`}>
      {ActionButtonList(selectedToken).map((actionButton, index) => (
        <ActionButtonComponent
          key={index}
          label={actionButton.label}
          icon={actionButton.icon}
          nextScreen={actionButton.nextScreen}
          nextScreenParams={actionButton.nextScreenParams}
        />
      ))}
    </div>
  );
};
