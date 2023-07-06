import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ActionButtonList } from 'src/popup/hive/pages/app-container/home/actions-section/action-button.list';
import { ActionButtonComponent } from 'src/popup/hive/pages/app-container/home/actions-section/action-button/action-button.component';
import { RootState } from 'src/popup/hive/store';
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
          importedIcon={actionButton.importedIcon}
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
