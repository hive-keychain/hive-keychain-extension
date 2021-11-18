import { TokenBalance } from '@interfaces/tokens.interface';
import { navigateToWithParams } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import './tokens-history.component.scss';

const TokensHistory = ({
  activeAccount,
  userTokens,
  currentToken,
  navigateToWithParams,
}: PropsFromRedux) => {
  return (
    <div className="tokens-history">
      <PageTitleComponent
        title="popup_html_tokens_history"
        titleParams={[currentToken.symbol]}
        isBackButtonEnabled={true}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    userTokens: state.userTokens,
    currentToken: state.navigation.params?.token as TokenBalance,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensHistoryComponent = connector(TokensHistory);
