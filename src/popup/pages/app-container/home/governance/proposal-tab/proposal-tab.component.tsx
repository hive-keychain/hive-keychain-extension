import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import './proposal-tab.component.scss';

const ProposalTab = ({}: PropsFromRedux) => {
  return (
    <div className="proposal-tab">
      {chrome.i18n.getMessage('popup_html_proposal')}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ProposalTabComponent = connector(ProposalTab);
