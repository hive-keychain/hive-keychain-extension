import { FundedOption } from '@interfaces/proposal.interface';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import proposal from 'src/__tests__/utils-for-testing/data/proposal';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import proposalUtilsMocks from 'src/__tests__/utils/mocks/proposal.utils-mocks';
import ProposalUtils from 'src/utils/proposal.utils';
describe('proposal.utils tests:\n', () => {
  const { mocks, methods, constants } = proposalUtilsMocks;
  methods.afterEach;
  methods.beforeEach;
  describe('hasVotedForProposal tests:\n', () => {
    test('Must return true if voted', async () => {
      mocks.hiveTxUtils.getData(proposal.fakeVotedAccountResponse);
      const result = await ProposalUtils.hasVotedForProposal('theghost1980');
      expect(result).toBe(true);
    });

    test('Must return true if voted on specified proposalId', async () => {
      mocks.hiveTxUtils.getData(proposal.fakeVotedAccountResponse);
      const result = await ProposalUtils.hasVotedForProposal(
        'theghost1980',
        proposal.fakeListProposalVotesResponse[0].id,
      );
      expect(result).toBe(true);
    });

    test('Must return false if not voted', async () => {
      mocks.hiveTxUtils.getData(proposal.fakeVotedAccountResponse);
      const result = await ProposalUtils.hasVotedForProposal('no_voted_acount');
      expect(result).toBe(false);
    });
  });

  describe('getProposalList tests:\n', () => {
    test('Passing a user that hasnt voted on any proposal, must return a list of proposal with a field false on each one', async () => {
      mocks.getProposalDailyBudget(proposal.fakeDailyBudgetResponse);
      mocksImplementation.hiveTxUtils.getData({
        listProposals: proposal.fakeProposalListResponseHiveTx.proposals,
        listProposalVotes: proposal.fakeListProposalVotesResponse,
      });
      const result = await ProposalUtils.getProposalList(
        'theghost1980',
        dynamic.globalProperties,
      );
      expect(result).toEqual(proposal.expectedResultProposal);
    });

    test('Passing a user that has voted on the keychain proposal, must return a list of proposal with one voted proposal', async () => {
      mocks.getProposalDailyBudget(proposal.fakeDailyBudgetResponse);
      mocksImplementation.hiveTxUtils.getData({
        listProposals: constants.withKeyChainProposal.proposals,
        listProposalVotes: proposal.fakeListProposalVotesResponse,
      });

      const result = await ProposalUtils.getProposalList(
        'theghost1980',
        dynamic.globalProperties,
      );
      expect(result).toEqual(constants.expectedResultProposalWithkeyChain);
    });
  });

  describe('getFundedOption cases:\n', () => {
    it('Must return TOTALLY_FUNDED', () => {
      expect(ProposalUtils.getFundedOption(1, 10)).toBe(
        FundedOption.TOTALLY_FUNDED,
      );
    });

    it('Must return PARTIALLY_FUNDED', () => {
      expect(ProposalUtils.getFundedOption(10, 1)).toBe(
        FundedOption.PARTIALLY_FUNDED,
      );
    });

    it('Must return NOT_FUNDED', () => {
      expect(ProposalUtils.getFundedOption(10, -1)).toBe(
        FundedOption.NOT_FUNDED,
      );
    });
  });
  //TODO check & fix cases bellow
  // describe('isRequestingProposalVotes cases:\n', () => {
  //   it('Must return true', async () => {
  //     mocks.getProposalDailyBudget(0.01);
  //     mocks.hiveTxUtils.getData(constants.withKeyChainProposal.proposals);
  //     mocks.store.getState({
  //       globalProperties: { global: dynamic.globalProperties },
  //     });
  //     expect(
  //       await ProposalUtils.isRequestingProposalVotes(dynamic.globalProperties),
  //     ).toBe(true);
  //   });

  //   //TODO check & fix!
  //   // it('Must return true with one partially_funded proposal', async () => {
  //   //   const cloneResponse = objects.clone(
  //   //     constants.withKeyChainProposal.proposals,
  //   //   ) as any;
  //   //   cloneResponse[0].daily_pay = '1000000000 HBD';
  //   //   mocks.getProposalDailyBudget(10000);
  //   //   mocks.hiveTxUtils.getData(cloneResponse);
  //   //   mocks.store.getState({
  //   //     globalProperties: { global: dynamic.globalProperties },
  //   //   });
  //   //   expect(
  //   //     await ProposalUtils.isRequestingProposalVotes(dynamic.globalProperties),
  //   //   ).toBe(true);
  //   // });
  // });
});
