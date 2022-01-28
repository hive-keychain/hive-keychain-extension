import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './proxy-suggestion.component.scss';

const ProxySuggestion = ({}: PropsType) => {
  return <div></div>;
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsType = ConnectedProps<typeof connector>;

export const ProxySuggestionComponent = connector(ProxySuggestion);
