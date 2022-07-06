import { Icons } from '@popup/icons.enum';
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
  const [manaReadyIn, setManaReadyIn] = useState('');
  const [rcReadyIn, setRcReadyIn] = useState('');

  useEffect(() => {
    if (
      activeAccount?.account?.voting_manabar?.current_mana !== undefined &&
      activeAccount.rc?.percentage !== undefined
    ) {
      const hasMana =
        activeAccount?.account?.voting_manabar?.current_mana !== 0;

      const mana = HiveUtils.getVP(activeAccount.account);
      const manaValue = HiveUtils.getVotingDollarsPerAccount(
        100,
        globalProperties,
        activeAccount.account,
        false,
      ) as string;
      const voting = parseFloat(manaValue);
      const resources = activeAccount.rc.percentage / 100;

      if (hasMana) {
        setVotingMana(mana?.toFixed(2) + ' %');
        setVotingValue(voting.toFixed(2) + ' $');
      } else {
        setVotingMana('--');
        setVotingValue(null);
      }

      setRc(resources.toFixed(2) + ' %');

      setManaReadyIn(
        hasMana
          ? HiveUtils.getTimeBeforeFull(mana!)
          : chrome.i18n.getMessage('html_popup_voting_no_hp'),
      );
      setRcReadyIn(HiveUtils.getTimeBeforeFull(resources));
    }
  }, [activeAccount]);

  return (
    <div className="resources-section">
      <ResourceItemComponent
        ariaLabel="resource-item-voting-mana"
        label={'popup_html_vm'}
        value={votingMana}
        secondaryValue={votingValue}
        icon={Icons.ARROW_UP}
        tooltipText={manaReadyIn}
      />
      <ResourceItemComponent
        ariaLabel="resource-item-resource-credits"
        label={'popup_html_rc'}
        value={rc}
        icon={Icons.RC}
        tooltipText={rcReadyIn}
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
