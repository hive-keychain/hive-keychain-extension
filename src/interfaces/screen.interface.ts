import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { HiveScreen } from '@popup/hive/reference-data/hive-screen.enum';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';

export const Screen = { ...MultichainScreen, ...HiveScreen, ...EvmScreen };
export type Screen = MultichainScreen | HiveScreen | EvmScreen;
