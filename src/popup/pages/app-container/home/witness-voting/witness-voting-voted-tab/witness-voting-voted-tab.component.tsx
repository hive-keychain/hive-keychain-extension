import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import './witness-voting-voted-tab.component.scss';

const WitnessVotingVotedTab = ({}: PropsFromRedux) => {
  return <div className="witness-voting-voted-tab">Voted</div>;
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessVotingVotedTabComponent = connector(WitnessVotingVotedTab);
