import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';

const WitnessVoting = ({}: PropsFromRedux) => {
  return (
    <div className="witness-voting-page">
      <PageTitleComponent
        title="popup_html_witness_title"
        isBackButtonEnabled={true}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessVotingComponent = connector(WitnessVoting);
