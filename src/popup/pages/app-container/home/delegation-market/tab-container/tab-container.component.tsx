import { navigateTo } from '@popup/actions/navigation.actions';
import { Icons } from '@popup/icons.enum';
import { DelegationRequest } from '@popup/pages/app-container/home/delegation-market/delegation-market.interface';
import { DelegationRequestItemComponent } from '@popup/pages/app-container/home/delegation-market/delegation-request-item/delegation-request-item.component';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import './tab-container.component.scss';

interface TabContainerProps {
  delegationRequests: DelegationRequest[] | undefined;
  hideDisplayChip?: boolean;
  displayAddButton?: boolean;
}

const TabContainer = ({
  delegationRequests,
  hideDisplayChip,
  displayAddButton,
  navigateTo,
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
      {displayAddButton && (
        <div
          className="add-button"
          onClick={() => navigateTo(Screen.DELEGATION_MARKET_REQUEST_PAGE)}>
          <Icon type={IconType.OUTLINED} name={Icons.ADD_CIRCLE} />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, { navigateTo });
type PropsFromRedux = ConnectedProps<typeof connector> & TabContainerProps;

export const TabContainerComponent = connector(TabContainer);
