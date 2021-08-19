import { ResourceItemComponent } from '@popup/pages/app-container/home/resources-section/resource-item/resource-item.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './resources-section.component.scss';

const ResourcesSection = ({ activeAccount }: PropsFromRedux) => {
  const [votingMana, setVotingMana] = useState('--');
  const [rc, setRc] = useState('--');

  useEffect(() => {
    if (
      activeAccount?.account?.voting_manabar?.current_mana &&
      activeAccount.rc?.percentage
    ) {
      const currentMana = parseFloat(
        activeAccount.account.voting_manabar.current_mana.toString(),
      );
      setVotingMana(
        ((activeAccount.rc.max_mana / currentMana) * 100).toFixed(2) + ' %',
      );

      setRc((activeAccount.rc.percentage / 100).toFixed(2) + ' %');
    }
  }, [activeAccount]);

  return (
    <div className="resources-section">
      <ResourceItemComponent
        label={'popup_html_vm'}
        value={votingMana}
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
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ResourcesSectionComponent = connector(ResourcesSection);
