import { ResourceItemComponent } from '@popup/pages/app-container/home/resources-section/resource-item/resource-item.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import HiveUtils from 'src/utils/hive.utils';
import './resources-section.component.scss';

const ResourcesSection = ({
  activeAccount,
  globalProperties,
}: PropsFromRedux) => {
  const [votingMana, setVotingMana] = useState('--');
  const [votingValue, setVotingValue] = useState<any>();
  const [rc, setRc] = useState('--');

  useEffect(() => {
    if (
      activeAccount?.account?.voting_manabar?.current_mana &&
      activeAccount.rc?.percentage
    ) {
      setVotingMana(HiveUtils.getVP(activeAccount.account)?.toFixed(2) + ' %');
      const manaValue = HiveUtils.getVotingDollarsPerAccount(
        100,
        globalProperties,
        activeAccount.account,
        false,
      ) as string;
      setVotingValue(parseFloat(manaValue).toFixed(2) + ' $');
      setRc((activeAccount.rc.percentage / 100).toFixed(2) + ' %');
    }
  }, [activeAccount]);

  return (
    <div className="resources-section">
      <ResourceItemComponent
        label={'popup_html_vm'}
        value={votingMana}
        secondaryValue={votingValue}
        icon={'bg_voting'}
        tooltipText={'Heelo'}
      />
      <ResourceItemComponent
        label={'popup_html_rc'}
        value={rc}
        icon={'bg_rc'}
        tooltipText={'hello'}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    globalProperties: state.globalProperties,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ResourcesSectionComponent = connector(ResourcesSection);
