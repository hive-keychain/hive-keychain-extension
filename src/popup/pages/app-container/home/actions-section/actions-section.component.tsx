import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './actions-section.component.scss';

const ActionsSection = ({}: PropsFromRedux) => {
  return <div className="actions-section">Action section</div>;
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ActionsSectionComponent = connector(ActionsSection);
