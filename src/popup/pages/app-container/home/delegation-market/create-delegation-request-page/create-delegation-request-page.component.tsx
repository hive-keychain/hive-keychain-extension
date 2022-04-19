import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import './delegation-market.component.scss';

const DelegationMarket = ({
  activeAccount,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_delegation_market',
      isBackButtonEnabled: true,
    });
  }, []);

  return (
    <div className="create-delegation-request-page">
      <div className="introduction">
        {chrome.i18n.getMessage(
          'popup_html_delegation_market_request_introduction',
        )}
      </div>
      <div className="form">
        <InputComponent
          onChange={function (value: any): void {
            throw new Error('Function not implemented.');
          }}
          value={undefined}
          placeholder={''}
          type={InputType.TEXT}
        />
        <InputComponent
          onChange={function (value: any): void {
            throw new Error('Function not implemented.');
          }}
          value={undefined}
          placeholder={''}
          type={InputType.TEXT}
        />
        <InputComponent
          onChange={function (value: any): void {
            throw new Error('Function not implemented.');
          }}
          value={undefined}
          placeholder={''}
          type={InputType.TEXT}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const DelegationMarketComponent = connector(DelegationMarket);
