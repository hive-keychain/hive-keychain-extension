import React from 'react';
import { ActionButtonList } from 'src/popup/hive/pages/app-container/home/actions-section/action-button.list';
import { ActionButtonComponent } from 'src/popup/hive/pages/app-container/home/actions-section/action-button/action-button.component';
import './actions-section.component.scss';

type Props = {
  additionalClass?: string;
};
export const ActionsSectionComponent = ({ additionalClass }: Props) => {
  return (
    <div className={`actions-section ${additionalClass}`}>
      {ActionButtonList.map((actionButton, index) => (
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
