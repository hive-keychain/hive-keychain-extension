import { DelegationRequest } from '@popup/pages/app-container/home/delegation-market/delegation-market.interface';
import { DelegationRequestItemComponent } from '@popup/pages/app-container/home/delegation-market/delegation-request-item/delegation-request-item.component';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './tab-container.component.scss';

interface TabContainerProps {
  delegationRequests: DelegationRequest[] | undefined;
  hideDisplayChip?: boolean;
}

const TabContainer = ({
  delegationRequests,
  hideDisplayChip,
}: PropsFromRedux) => {
  useEffect(() => {}, []);

  return (
    <div className="tab-container">
      {delegationRequests &&
        delegationRequests.map((delegationRequest: DelegationRequest) => (
          <DelegationRequestItemComponent
            key={delegationRequest.id}
            delegationRequest={delegationRequest}
            hideDisplayChip={hideDisplayChip}
          />
        ))}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector> & TabContainerProps;

export const TabContainerComponent = connector(TabContainer);
