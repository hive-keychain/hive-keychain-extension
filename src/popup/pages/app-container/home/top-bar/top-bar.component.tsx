import { forgetMk } from '@popup/actions/mk.actions';
import { navigateTo, resetNav } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Screen } from 'src/reference-data/screen.enum';
import './top-bar.component.css';

const TopBar = ({ forgetMk, navigateTo, resetNav }: PropsFromRedux) => {
  const lockPopup = (): void => {
    resetNav();
    forgetMk();
  };

  return (
    <div className="top-bar">
      <img src="/assets/images/keychain_icon_small.png" />
      <div className="spacer"></div>
      <img
        className="button lock-button"
        src="/assets/images/lock_wallet.png"
        onClick={() => lockPopup()}
      />
      <img
        className="button settings-button"
        src="/assets/images/squares.png"
        onClick={() => navigateTo(Screen.SETTINGS_MAIN_PAGE)}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, { forgetMk, navigateTo, resetNav });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TopBarComponent = connector(TopBar);
