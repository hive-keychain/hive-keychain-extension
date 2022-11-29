import {
  CollateralizedConvertOperation,
  ConvertOperation,
} from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { CollateralizedConversion } from '@interfaces/collaterelized-conversion.interface';
import { Conversion } from '@interfaces/conversion.interface';
import { ConversionType } from '@popup/pages/app-container/home/conversion/conversion-type.enum';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

const getConversionRequests = async (name: string): Promise<Conversion[]> => {
  const [hbdConversions, hiveConversions] = await Promise.all([
    ConversionUtils.getHdbConversions(name),
    ConversionUtils.getHiveConversions(name),
  ]);

  return [
    ...hiveConversions.map((conv: CollateralizedConversion) => ({
      amount: conv.collateral_amount,
      conversion_date: conv.conversion_date,
      id: conv.id,
      owner: conv.owner,
      requestid: conv.requestid,
      collaterized: true,
    })),
    ...hbdConversions.map((conv: any) => ({
      ...conv,
      collaterized: false,
    })),
  ].sort(
    (a, b) =>
      new Date(a.conversion_date).getTime() -
      new Date(b.conversion_date).getTime(),
  );
};

const getHdbConversions = (username: string) => {
  return HiveTxUtils.getData('condenser_api.get_conversion_requests', [
    username,
  ]);
};

const getHiveConversions = (username: string) => {
  return HiveTxUtils.getData(
    'condenser_api.get_collateralized_conversion_requests',
    [username],
  );
};

/* istanbul ignore next */
const sendConvert = async (
  activeAccount: ActiveAccount,
  conversions: Conversion[],
  amount: string,
  conversionType: ConversionType,
) => {
  return HiveTxUtils.sendOperation(
    [
      ConversionUtils.getConvertOperation(
        activeAccount.name!,
        conversions,
        amount,
        conversionType,
      ),
    ],
    activeAccount.keys.active!,
  );
};

const getConvertOperation = (
  activeAccountName: string,
  conversions: Conversion[],
  amount: string,
  conversionType: ConversionType,
): ConvertOperation | CollateralizedConvertOperation => {
  const requestId = Math.max(...conversions.map((e) => e.requestid), 0) + 1;
  return [
    conversionType,
    { owner: activeAccountName, requestid: requestId, amount: amount },
  ];
};

export const ConversionUtils = {
  getConversionRequests,
  getHdbConversions,
  getHiveConversions,
  getConvertOperation,
  sendConvert,
};
