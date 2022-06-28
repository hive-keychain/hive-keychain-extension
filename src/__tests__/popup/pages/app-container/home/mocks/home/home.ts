import { LocalAccount } from '@interfaces/local-account.interface';
import { ReactElement } from 'react';
import alHomeInformation from 'src/__tests__/utils-for-testing/aria-labels/al-home-information';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksDefault from 'src/__tests__/utils-for-testing/defaults/mocks';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import { actAdvanceTime } from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const vpValue = mocksDefault._defaults._app.getVP?.toFixed(2).toString();
const resourceCredits = mocksDefault._defaults._app.getVotingDollarsPerAccount
  ?.toFixed(2)
  .toString();

const beforeEach = async (
  component: ReactElement,
  accounts: LocalAccount[],
) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(3300);
  mockPreset.setOrDefault({});
  renders.wInitialState(component, {
    ...initialStates.iniState,
    accounts: accounts,
  });
};
/**
 * Conveniently to add data to be check on home page, as text or aria labels.
 */
const userInformation = () => {
  assertion.getByText([
    { arialabelOrText: mk.user.one, query: QueryDOM.BYTEXT },
    {
      arialabelOrText: alHomeInformation.elements.asText.estimated,
      query: QueryDOM.BYTEXT,
    },
    {
      arialabelOrText: alHomeInformation.elements.asText.currencies.hbd,
      query: QueryDOM.BYTEXT,
    },
    {
      arialabelOrText: alHomeInformation.elements.asText.currencies.hive,
      query: QueryDOM.BYTEXT,
    },
    {
      arialabelOrText: alHomeInformation.elements.asText.currencies.hp,
      query: QueryDOM.BYTEXT,
    },
    {
      arialabelOrText: 'Voting Mana',
      query: QueryDOM.BYTEXT,
    },
    {
      arialabelOrText: `${vpValue} % (${vpValue} $)`,
      query: QueryDOM.BYTEXT,
    },
    {
      arialabelOrText: 'Resource Credits',
      query: QueryDOM.BYTEXT,
    },
    {
      arialabelOrText: `${resourceCredits} %`,
      query: QueryDOM.BYTEXT,
    },
  ]);
};

export default { beforeEach, userInformation };
