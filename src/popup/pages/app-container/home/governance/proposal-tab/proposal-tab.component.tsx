import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import ReactTooltip from 'react-tooltip';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import FormatUtils from 'src/utils/format.utils';
import ProposalUtils from 'src/utils/proposal.utils';
import './proposal-tab.component.scss';

export interface Proposal {
  id: number;
  creator: string;
  dailyPay: string;
  startDate: moment.Moment;
  endDate: moment.Moment;
  receiver: string;
  status: string;
  totalVotes: string;
  subject: string;
  link: string;
  proposalId: number;
  voted: boolean;
}

const ProposalTab = ({}: PropsFromRedux) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  useEffect(() => {
    initList();
  }, []);

  const initList = async () => {
    const proposals = await ProposalUtils.getProposalList();
    setProposals(proposals);
  };

  const goTo = (link: Proposal['link']) => {
    chrome.tabs.create({ url: link });
  };

  const support = (id: Proposal['id']) => {
    console.log(`supporting #${id}`);
  };

  return (
    <div className="proposal-tab">
      <div className="proposal-list">
        {proposals.map((proposal) => (
          <div className="proposal-item" key={proposal.proposalId}>
            <div className="title" onClick={() => goTo(proposal.link)}>
              #{proposal.id} - {proposal.subject}
            </div>
            <div className="additional-info">
              <div className="left-panel">
                <div className="creator">
                  <img
                    src={`https://images.hive.blog/u/${proposal.creator}/avatar`}
                    onError={(e: any) => {
                      e.target.onError = null;
                      e.target.src = '/assets/images/accounts.png';
                    }}
                  />
                  <span>By @{proposal.creator}</span>
                </div>
                <div
                  className="remaining-days"
                  data-for={`remaining-tooltip`}
                  data-tip={`start ${proposal.startDate.format(
                    'L',
                  )}\n\r ${proposal.endDate.format('L')}`}
                  data-iscapture="true">
                  {chrome.i18n.getMessage('popup_html_days_remaining', [
                    proposal.endDate
                      .diff(moment(new Date()), 'days')
                      .toString(),
                  ])}{' '}
                  - {proposal.dailyPay}/{chrome.i18n.getMessage('day')}
                </div>
                <ReactTooltip
                  id={'remaining-tooltip'}
                  place="top"
                  type="light"
                  effect="solid"
                  multiline={true}
                />
              </div>
              <div className="nb-votes">
                <Icon
                  onClick={() => support(proposal.id)}
                  additionalClassName={
                    (proposal.voted ? 'voted' : 'not-voted') + ' '
                  }
                  name={Icons.ARROW_CIRCLE_UP}
                  type={IconType.OUTLINED}
                />
                <span>{FormatUtils.withCommas(proposal.totalVotes)} HP</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ProposalTabComponent = connector(ProposalTab);
