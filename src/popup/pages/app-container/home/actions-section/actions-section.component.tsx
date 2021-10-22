import { ActionButtonList } from '@popup/pages/app-container/home/actions-section/action-button.list';
import { ActionButtonComponent } from '@popup/pages/app-container/home/actions-section/action-button/action-button.component';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './actions-section.component.scss';

const ActionsSection = ({}: PropsFromRedux) => {
  return (
    <div className="actions-section">
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

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ActionsSectionComponent = connector(ActionsSection);
