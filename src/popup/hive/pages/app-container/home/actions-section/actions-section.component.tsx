import { ActionButton } from '@interfaces/action-button.interface';
import React from 'react';
import { ActionButtonComponent } from 'src/popup/hive/pages/app-container/home/actions-section/action-button/action-button.component';

type Props = {
  additionalClass?: string;
  actionButtonList: ActionButton[];
};
export const ActionsSectionComponent = ({
  additionalClass,
  actionButtonList,
}: Props) => {
  return (
    <div className={`actions-section ${additionalClass ?? ''}`}>
      {actionButtonList.map((actionButton, index) => (
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
