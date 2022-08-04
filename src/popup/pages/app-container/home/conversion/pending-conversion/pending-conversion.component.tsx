import { Conversion } from '@interfaces/conversion.interface';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { RootState } from '@popup/store';
import moment from 'moment';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './pending-conversion.component.scss';

const PendingConversionPage = ({
  navParams,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_pending_currency',
      titleParams: navParams.currency,
      isBackButtonEnabled: true,
    });
  }, []);

  return (
    <div
      className="pending-conversion-page"
      aria-label="pending-conversion-page">
      {navParams.pendingConversions.map((pendingConversion: Conversion) => (
        <div className="pending-undelegation">
          <div className="expiration-date">
            {moment(pendingConversion.conversion_date).format('L')}
          </div>
          <div className="amount">{pendingConversion.amount}</div>
        </div>
      ))}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    navParams: state.navigation.stack[0].params,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const PendingConersionPageComponent = connector(PendingConversionPage);
