import { HiveInternalMarketLockedInOrders } from '@interfaces/hive-market.interface';
import { HiveTxUtils } from '@popup/hive/utils/hive-tx.utils';
import Logger from 'src/utils/logger.utils';

const getHiveInternalMarketOrders = async (username: string) => {
  let totals: HiveInternalMarketLockedInOrders = {
    hive: 0,
    hbd: 0,
  };
  try {
    const openMarketOrders = await HiveTxUtils.getData(
      'condenser_api.get_open_orders',
      [username],
    );
    totals.hive = openMarketOrders
      .filter((order: any) => order.sell_price.base.includes('HIVE'))
      .reduce(
        (acc: number, openOrder: any) =>
          acc + parseFloat(openOrder.sell_price.base.split(' ')[0]),
        0,
      );
    totals.hbd = openMarketOrders
      .filter((order: any) => order.sell_price.base.includes('HBD'))
      .reduce(
        (acc: number, openOrder: any) =>
          acc + parseFloat(openOrder.sell_price.base.split(' ')[0]),
        0,
      );
  } catch (error) {
    Logger.log('Error getting Hive Open orders for user', { error });
  } finally {
    return totals;
  }
};

export const HiveInternalMarketUtils = {
  getHiveInternalMarketOrders,
};
