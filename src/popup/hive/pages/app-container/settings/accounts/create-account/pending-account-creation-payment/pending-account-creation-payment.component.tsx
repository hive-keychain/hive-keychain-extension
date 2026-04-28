import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

const PendingAccountCreationPayment = ({
  setTitleContainerProperties,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_create_account',
      isBackButtonEnabled: true,
    });
  }, []);

  return <div className="pending-account-creation-payment"></div>;
};

const connector = connect(null, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const PendingAccountCreationPaymentComponent = connector(
  PendingAccountCreationPayment,
);
