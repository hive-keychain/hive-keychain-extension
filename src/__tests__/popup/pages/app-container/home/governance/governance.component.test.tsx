import KeychainApi from '@api/keychain';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import App from '@popup/App';
import '@testing-library/jest-dom';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import React from 'react';
import HiveUtils from 'src/utils/hive.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import ProxyUtils from 'src/utils/proxy.utils';
import BlockchainTransactionUtils from 'src/utils/tokens.utils';
import WitnessUtils from 'src/utils/witness.utils';
import al from 'src/__tests__/utils-for-testing/end-to-end-aria-labels';
import fakeData from 'src/__tests__/utils-for-testing/end-to-end-data';
import { userEventPendingTimers } from 'src/__tests__/utils-for-testing/end-to-end-events';
import mocks from 'src/__tests__/utils-for-testing/end-to-end-mocks';
import mockPreset, {
  MockPreset,
} from 'src/__tests__/utils-for-testing/end-to-end-mocks-presets';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import { customRender } from 'src/__tests__/utils-for-testing/renderSetUp';

const chrome = require('chrome-mock');
global.chrome = chrome;
jest.setTimeout(10000);
const mk = fakeData.mk.userData1;
const accounts = fakeData.accounts.twoAccounts;
const arcangeLink = 'https://hive.arcange.eu/witnesses/';
//const initState = { mk: mk, accounts: accounts } as RootState;
const inactiveKey = 'STM1111111111111111111111111111111114T1Anm';
const fakeWitnessesRankingWInactive = {
  data: [
    ...utilsT.fakeWitnessesRankingResponse.data,
    {
      name: 'theghost1980',
      rank: '200',
      votes: '1000',
      votes_count: 1000,
      signing_key: inactiveKey,
      url: 'https://saturnoman.com',
    },
  ],
};
const extendedAccountFullNoProxy = [
  {
    ...fakeData.accounts.extendedAccountFull[0],
    proxy: '',
    // witness_votes: [],
    witnesses_voted_for: 0,
  },
];
const onlyActiveWitnesses = fakeWitnessesRankingWInactive.data.filter(
  (item) => item.signing_key !== inactiveKey,
);

let customRerender: (
  ui: React.ReactElement<any, string | React.JSXElementConstructor<any>>,
) => void;
let containerRender: HTMLElement;
let spyChromeTabs: jest.SpyInstance;
// beforeEach(() => {
//   // jest.useFakeTimers('legacy');
//   // act(() => {
//   //   jest.advanceTimersByTime(4300);
//   // });
// });
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  cleanup();
  spyChromeTabs.mockClear();
  spyChromeTabs.mockReset();
});
describe('governance.component tests:\n', () => {
  describe('Witness tab:\n', () => {
    const tabNames = ['Witness', 'Proxy', 'Proposal'];
    describe('No errors at loading:\n', () => {
      //Mock all default
      beforeEach(async () => {
        jest.useFakeTimers('legacy');
        act(() => {
          jest.advanceTimersByTime(4300);
        });
        mockPreset.load(MockPreset.HOMEDEFAULT, mk, accounts).preset;
        //just overwrited for now
        chrome.i18n.getMessage = jest
          .fn()
          .mockImplementation(mocks.i18nGetMessageCustom);
        KeychainApi.get = jest
          .fn()
          .mockResolvedValue(fakeWitnessesRankingWInactive);
        ProxyUtils.findUserProxy = jest.fn().mockResolvedValue(null);
        //end overwrited
        spyChromeTabs = jest.spyOn(chrome.tabs, 'create');
        customRender(<App />, {
          initialState: { mk: mk, accounts: accounts } as RootState,
        });
        expect(await screen.findByText(mk)).toBeDefined();
        await act(async () => {
          await userEventPendingTimers.click(
            screen.getByLabelText(al.button.actionBtn.governance),
          );
        });
      });
      it('Must load the governance component, displaying the correct data', async () => {
        act(() => {
          jest.runOnlyPendingTimers();
        });
        const governancePage = await screen.findByLabelText(
          al.component.governancePage,
        );
        expect(governancePage).toBeInTheDocument();
        expect(screen.getAllByRole('tablist').length).toBe(1);
        tabNames.map((tabName) => {
          expect(screen.getByText(tabName)).toBeInTheDocument();
        });
      });
      it('Must display more information message and opens a new page if clicked on', async () => {
        //  => calling chrome.tabs.create
        const informationMessage = mocks.i18nGetMessage(
          'html_popup_link_to_witness_website',
        );
        expect(screen.getByText(informationMessage)).toBeInTheDocument();
        const link = screen.getByLabelText(
          al.link.linkToArcange,
        ) as HTMLDivElement;
        await act(async () => {
          await userEventPendingTimers.click(link);
        });
        expect(spyChromeTabs).toBeCalledTimes(1);
        expect(spyChromeTabs).toBeCalledWith({ url: arcangeLink });
      });
      it('Must display no witnesses when typying a non existing witness search filter box', async () => {
        const inputRankingFilter = screen.getByLabelText(
          al.input.filter.ranking,
        );
        await act(async () => {
          await userEventPendingTimers.type(
            inputRankingFilter,
            'non_existentWITNESS',
          );
        });
        const rankingDiv = screen.getByLabelText(
          al.div.ranking,
        ) as HTMLDivElement;
        expect(rankingDiv).toBeInTheDocument();
        expect(rankingDiv.childNodes.length).toBe(0);
      });
      it('Must display 1 witness when typying blocktrades on search filter box', async () => {
        const inputRankingFilter = screen.getByLabelText(
          al.input.filter.ranking,
        );
        await act(async () => {
          await userEventPendingTimers.type(inputRankingFilter, 'blocktrades');
        });
        const rankingDiv = screen.getByLabelText(
          al.div.ranking,
        ) as HTMLDivElement;
        expect(rankingDiv).toBeInTheDocument();
        expect(screen.getAllByLabelText(al.div.rankingItem).length).toBe(1);
      });
      it('Must display all received active witnesses when typying one common letter, on search filter box', async () => {
        const inputRankingFilter = screen.getByLabelText(
          al.input.filter.ranking,
        );
        await act(async () => {
          await userEventPendingTimers.type(inputRankingFilter, 'a');
        });
        const rankingDiv = screen.getByLabelText(
          al.div.ranking,
        ) as HTMLDivElement;
        expect(rankingDiv).toBeInTheDocument();
        expect(screen.getAllByLabelText(al.div.rankingItem).length).toBe(
          onlyActiveWitnesses.length,
        );
      });
      it('Must show the inactive witness when unchecking on hide inactive', async () => {
        const checkEl = screen.getByLabelText(
          al.switchesPanel.witness.hideInactive,
        );
        await act(async () => {
          await userEventPendingTimers.click(checkEl);
        });
        await waitFor(() => {
          expect(screen.getAllByLabelText(al.div.rankingItem).length).toBe(
            fakeWitnessesRankingWInactive.data.length,
          );
          expect(screen.getByText('@theghost1980')).toBeInTheDocument();
        });
      });
      it('Must show only voted witnesses when checking on voted only', async () => {
        const checkEl = screen.getByLabelText(
          al.switchesPanel.witness.votedOnly,
        );
        await act(async () => {
          await userEventPendingTimers.click(checkEl);
        });
        await waitFor(() => {
          expect(screen.getAllByLabelText(al.div.rankingItem).length).toBe(
            fakeData.accounts.extendedAccountFull[0].witness_votes.length,
          );
        });
      });
      it('Must create a new tab when clicking on witness link', async () => {
        let rankingItems: HTMLElement[];
        await waitFor(() => {
          rankingItems = screen.getAllByLabelText(al.icon.witness.linkToPage);
        });
        await act(async () => {
          await userEventPendingTimers.click(rankingItems[0]);
        });
        expect(spyChromeTabs).toBeCalledWith({
          url: fakeWitnessesRankingWInactive.data[0].url,
        });
      });
      it('Must show error when unvoting fails', async () => {
        const errorMessage = mocks.i18nGetMessageCustom(
          'popup_error_unvote_wit',
          ['blocktrades'],
        );
        BlockchainTransactionUtils.delayRefresh = jest.fn();
        WitnessUtils.unvoteWitness = jest.fn().mockResolvedValueOnce(false);
        await act(async () => {
          await userEventPendingTimers.click(
            (
              await screen.findAllByLabelText(al.icon.witness.voting)
            )[0],
          );
        });
        await waitFor(() => {
          expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
      });
      it('Must show success message when unvoting', async () => {
        const sucessMessage = mocks.i18nGetMessageCustom(
          'popup_success_unvote_wit',
          ['blocktrades'],
        );
        BlockchainTransactionUtils.delayRefresh = jest.fn();
        WitnessUtils.unvoteWitness = jest.fn().mockResolvedValueOnce(true);
        await act(async () => {
          await userEventPendingTimers.click(
            (
              await screen.findAllByLabelText(al.icon.witness.voting)
            )[0],
          );
        });
        await waitFor(() => {
          expect(screen.getByText(sucessMessage)).toBeInTheDocument();
        });
      });
      it('Must show error when voting fails', async () => {
        const errorMessage = mocks.i18nGetMessageCustom('popup_error_wit', [
          fakeWitnessesRankingWInactive.data[4].name,
        ]);
        BlockchainTransactionUtils.delayRefresh = jest.fn();
        WitnessUtils.voteWitness = jest.fn().mockResolvedValueOnce(false);
        await act(async () => {
          await userEventPendingTimers.click(
            (
              await screen.findAllByLabelText(al.icon.witness.voting)
            )[4],
          );
        });
        await waitFor(() => {
          expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
      });
      it('Must show sucess message when voting', async () => {
        const successMessage = mocks.i18nGetMessageCustom('popup_success_wit', [
          fakeWitnessesRankingWInactive.data[4].name,
        ]);
        BlockchainTransactionUtils.delayRefresh = jest.fn();
        WitnessUtils.voteWitness = jest.fn().mockResolvedValueOnce(true);
        await act(async () => {
          await userEventPendingTimers.click(
            (
              await screen.findAllByLabelText(al.icon.witness.voting)
            )[4],
          );
        });
        await waitFor(() => {
          expect(screen.getByText(successMessage)).toBeInTheDocument();
        });
      });
    });

    describe('With errors on load:\n', () => {
      //Mock all default + overwrite KeychainApi.get to cause error
      beforeEach(async () => {
        jest.useFakeTimers('legacy');
        act(() => {
          jest.advanceTimersByTime(4300);
        });
        mockPreset.load(MockPreset.HOMEDEFAULT, mk, accounts).preset;
        //just overwrited for now
        chrome.i18n.getMessage = jest
          .fn()
          .mockImplementation(mocks.i18nGetMessageCustom);
        KeychainApi.get = jest.fn().mockResolvedValue({ data: '' });
        //end overwrited
        //spyChromeTabs = jest.spyOn(chrome.tabs, 'create');
        const { rerender } = customRender(<App />, {
          initialState: { mk: mk, accounts: accounts } as RootState,
        });
        expect(await screen.findByText(mk)).toBeDefined();
        //customRerender = rerender;
        await act(async () => {
          await userEventPendingTimers.click(
            screen.getByLabelText(al.button.actionBtn.governance),
          );
        });
      });
      it('Must show error if data not received from HIVE', async () => {
        const errorMessage = mocks.i18nGetMessage(
          'popup_html_error_retrieving_witness_ranking',
        );
        const divEl = (await screen.findByLabelText(
          al.div.error.witness.tab,
        )) as HTMLDivElement;
        expect(divEl).toBeInTheDocument();
        await waitFor(() => {
          expect(screen.getAllByText(errorMessage).length).toBe(2);
        });
      });
    });

    //for a new vote
  });
  describe('Proxy tab:\n', () => {
    beforeEach(async () => {
      jest.useFakeTimers('legacy');
      act(() => {
        jest.advanceTimersByTime(4300);
      });
      mockPreset.load(MockPreset.HOMEDEFAULT, mk, accounts).preset;
      //just overwrited for now
      chrome.i18n.getMessage = jest
        .fn()
        .mockImplementation(mocks.i18nGetMessageCustom);
      KeychainApi.get = jest
        .fn()
        .mockResolvedValue(fakeWitnessesRankingWInactive);
      ProxyUtils.findUserProxy = jest.fn().mockResolvedValue(null);
      HiveUtils.getClient().database.getAccounts = jest
        .fn()
        .mockResolvedValue(extendedAccountFullNoProxy);
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(null);
      //ActiveAccountUtils.isEmpty = jest.fn().mockReturnValue(true);
      //end overwrited
      spyChromeTabs = jest.spyOn(chrome.tabs, 'create');
      const { rerender, container } = customRender(<App />, {
        initialState: { mk: mk, accounts: accounts } as RootState,
      });
      //customRerender = rerender;
      containerRender = container;
      expect(await screen.findByText(mk)).toBeDefined();
    });
    //for proxy-suggestion
    it('Must show proxy suggestion after homepage loads', async () => {
      expect(
        screen.getByLabelText(al.component.proxySuggestion),
      ).toBeInTheDocument();
    });
    it('Must set @keychain as proxy', async () => {
      WitnessUtils.setAsProxy = jest.fn().mockResolvedValue(true);
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.operation.proxySuggestion.ok),
        );
      });
      expect(
        screen.getByText(
          mocks.i18nGetMessageCustom('popup_success_proxy', ['keychain']),
        ),
      ).toBeInTheDocument();
    });
    it('Must close suggestion after clicking close', async () => {
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue({ 'keychain.tests': true });
      LocalStorageUtils.saveValueInLocalStorage = jest.fn();
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.panel.close),
        );
      });
      await waitFor(() => {
        expect(
          containerRender.getElementsByClassName('proxy-suggestion hide')
            .length,
        ).toBe(1);
      });
    });
    it('Must show error if suggestion operations fails by HIVE', async () => {
      const errorMessage = mocks.i18nGetMessageCustom('popup_error_proxy', [
        'keychain',
      ]);
      WitnessUtils.setAsProxy = jest.fn().mockResolvedValue(false);
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.operation.proxySuggestion.ok),
        );
      });
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
    //END for proxy-suggestion
    it.todo('Must set user proxy as keychain and show message');
    it.todo('Must show error when trying to set keychain as proxy');
    it.todo('Must close suggestion message clicking cancel');
    //END just for the homepage initial proxy message
    it.todo("Must show actual user's proxy");
    it.todo('Must remove proxy when clicking on clear proxy');
    it.todo('Must show error trying to clear the proxy');
    it.todo('Must show empty as proxy');
    it.todo('Must set proxy when entering a valid account and show message');
    it.todo('Must show error if account not valid');
    it.todo('Must show error if unsuccessful operation');
  });
  describe('Proxy suggestion error case', () => {
    beforeEach(async () => {
      jest.useFakeTimers('legacy');
      act(() => {
        jest.advanceTimersByTime(4300);
      });
      const accountsNoActiveKey = JSON.parse(JSON.stringify(accounts));
      delete accountsNoActiveKey[1].keys.active;
      delete accountsNoActiveKey[1].keys.activePubkey;
      mockPreset.load(MockPreset.HOMEDEFAULT, mk, accountsNoActiveKey).preset;
      //just overwrited for now
      chrome.i18n.getMessage = jest
        .fn()
        .mockImplementation(mocks.i18nGetMessageCustom);
      KeychainApi.get = jest
        .fn()
        .mockResolvedValue(fakeWitnessesRankingWInactive);
      ProxyUtils.findUserProxy = jest.fn().mockResolvedValue(null);
      HiveUtils.getClient().database.getAccounts = jest
        .fn()
        .mockResolvedValue(extendedAccountFullNoProxy);
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(null);
      //end overwrited
      spyChromeTabs = jest.spyOn(chrome.tabs, 'create');
      const { rerender, container } = customRender(<App />, {
        initialState: { mk: mk, accounts: accountsNoActiveKey } as RootState,
      });
      //customRerender = rerender;
      containerRender = container;
      expect(await screen.findByText(mk)).toBeDefined();
    });
    it('Must show error if suggestion operations fails by no active key', async () => {
      const errorMessage = mocks.i18nGetMessageCustom('popup_missing_key', [
        KeychainKeyTypesLC.active,
      ]);
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.operation.proxySuggestion.ok),
        );
      });
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });
  describe('Proposal tab:\n', () => {
    it.todo('Must show actual proposals when clicking on tab');
    it.todo('Must show proposal details when clicking on dropdown icon');
    it.todo('Must show tooltip as funded when proposal is funded');
    it.todo(
      'Must opens a new windows tab when clicking on proposal item title',
    );
    //  => calling chrome.tabs.create
    //voting proposal
    it.todo('Must vote for proposal and show message');
    it.todo('Must show error if voting operation unsuccessful');
  });
});
