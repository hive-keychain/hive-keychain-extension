import { ExtendedAccount } from '@hiveio/dhive';
import { GlobalProperties } from '@interfaces/global-properties.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { HiveEngineConfigUtils } from '@popup/hive/utils/hive-engine-config.utils';
import { HiveTxUtils } from '@popup/hive/utils/hive-tx.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Config from 'src/config';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getLabelCell = (key: string) => {
  switch (key) {
    case 'vesting_shares':
      return 'HP';
    case 'name':
      return 'ACCOUNT';
    case 'balance':
      return 'HIVE';
    case 'hbd_balance':
      return 'HBD';
    default:
      return key;
  }
};

const getFormatedOrDefaultValue = (
  value: string,
  globalProperties: GlobalProperties | null,
) => {
  switch (true) {
    case value.includes('VESTS'):
      return FormatUtils.withCommas(
        FormatUtils.toHP(
          (value as string).split(' ')[0],
          globalProperties?.globals,
        ).toString(),
      );
    case value.includes('HBD'):
      return FormatUtils.withCommas((value as string).split(' ')[0]);
    case value.includes('HIVE'):
      return FormatUtils.withCommas((value as string).split(' ')[0]);
    default:
      return value;
  }
};

const getHiveTotal = (
  key: 'balance' | 'hbd_balance' | 'vesting_shares',
  list: ExtendedAccount[],
) => {
  if (key === 'balance') {
    return (
      list
        .reduce(
          (acc, curr) => acc + Number((curr.balance as string).split(' ')[0]),
          0,
        )
        .toString() + ' HIVE'
    );
  } else if (key === 'hbd_balance') {
    return (
      list
        .reduce(
          (acc, curr) =>
            acc + Number((curr.hbd_balance as string).split(' ')[0]),
          0,
        )
        .toString() + ' HBD'
    );
  } else if (key === 'vesting_shares') {
    return (
      list
        .reduce(
          (acc, curr) =>
            acc + Number((curr.vesting_shares as string).split(' ')[0]),
          0,
        )
        .toString() + ' VESTS'
    );
  } else {
    return '0';
  }
};

const loadAndSetRPCsAndApis = async () => {
  //load rpc.
  const current_rpc: Rpc = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.CURRENT_RPC,
  );
  let rpc = current_rpc || Config.rpc.DEFAULT;
  const HiveEngineConfig = {
    rpc: Config.hiveEngine.rpc,
    mainnet: Config.hiveEngine.mainnet,
    accountHistoryApi: Config.hiveEngine.accountHistoryApi,
  };

  //set rpcs by hand
  HiveTxUtils.setRpc(rpc);
  HiveEngineConfigUtils.setActiveApi(HiveEngineConfig.rpc);
  HiveEngineConfigUtils.setActiveAccountHistoryApi(
    HiveEngineConfig.accountHistoryApi,
  );
};

export const PortfolioUtils = {
  getFormatedOrDefaultValue,
  getLabelCell,
  getHiveTotal,
  loadAndSetRPCsAndApis,
};
