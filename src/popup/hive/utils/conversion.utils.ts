import {
  CollateralizedConvertOperation,
  ConvertOperation,
} from '@hiveio/dhive';
import { CollateralizedConversion } from '@interfaces/collaterelized-conversion.interface';
import { Conversion } from '@interfaces/conversion.interface';
import { Key, TransactionOptions } from '@interfaces/keys.interface';
import { ConversionType } from 'src/popup/hive/pages/app-container/home/conversion/conversion-type.enum';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';

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

const convert = async (
  username: string,
  conversions: Conversion[],
  amount: string,
  conversionType: ConversionType,
  activeKey: Key,
  options?: TransactionOptions,
) => {
  const requestId = Math.max(...conversions.map((e) => e.requestid), 0) + 1;
  return ConversionUtils.sendConvert(
    username,
    requestId,
    amount,
    conversionType,
    activeKey,
    options,
  );
};

/* istanbul ignore next */
const sendConvert = async (
  username: string,
  requestId: number,
  amount: string,
  conversionType: ConversionType,
  activeKey: Key,
  options?: TransactionOptions,
) => {
  return HiveTxUtils.sendOperation(
    [
      ConversionUtils.getConvertOperation(
        username,
        requestId,
        amount,
        conversionType,
      ),
    ],
    activeKey,
    false,
    options,
  );
};

const getConvertOperation = (
  username: string,
  requestId: number,
  amount: string,
  conversionType: ConversionType,
): ConvertOperation | CollateralizedConvertOperation => {
  return [
    conversionType,
    { owner: username, requestid: requestId, amount: amount },
  ];
};

const getConvertTransaction = (
  username: string,
  requestId: number,
  amount: string,
  conversionType: ConversionType,
) => {
  return HiveTxUtils.createTransaction([
    ConversionUtils.getConvertOperation(
      username,
      requestId,
      amount,
      conversionType,
    ),
  ]);
};

export const ConversionUtils = {
  getConversionRequests,
  getHdbConversions,
  getHiveConversions,
  getConvertOperation,
  sendConvert,
  convert,
  getConvertTransaction,
};
