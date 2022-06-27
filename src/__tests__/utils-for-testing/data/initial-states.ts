import mk from 'src/__tests__/utils-for-testing/data/mk';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';

const iniState = { mk: mk.user.one, accounts: [] } as RootState;

export default { iniState };
