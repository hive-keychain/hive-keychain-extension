import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import './witness-voting-add-tab.component.scss';

const WitnessVotingAddTab = ({}: PropsFromRedux) => {
  return <div className="witness-voting-add-tab">Add</div>;
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessVotingAddTabComponent = connector(WitnessVotingAddTab);
