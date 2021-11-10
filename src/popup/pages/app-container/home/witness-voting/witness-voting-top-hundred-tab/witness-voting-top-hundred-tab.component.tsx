import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import './witness-voting-top-hundred-tab.component.scss';

const WitnessVotingTopHundredTab = ({}: PropsFromRedux) => {
  return <div className="witness-voting-top-hundred-tab">Top 100</div>;
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessVotingTopHundredTabComponent = connector(
  WitnessVotingTopHundredTab,
);
