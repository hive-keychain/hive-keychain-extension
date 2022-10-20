import { Asset } from '@hiveio/dhive';
import { GlobalProperties } from '@interfaces/global-properties.interface';
import { RcDelegation } from '@interfaces/rc-delegation.interface';

const getAllIncomingDelegations = async (
  username: string,
): Promise<RcDelegation[]> => {
  return [];
};

const getAllOutgoingDelegations = async (
  username: string,
): Promise<RcDelegation[]> => {
  return [];
};

const sendDelegation = (value: number, delegatee: string) => {};

const getHivePerVests = (properties: GlobalProperties) => {
  const totalVestingFund = Asset.fromString(
    properties.globals?.total_vesting_fund_hive.toString()!,
  ).amount;
  const totalVestingShares = Asset.fromString(
    properties.globals?.total_vesting_shares.toString()!,
  ).amount;
  return totalVestingFund / totalVestingShares;
};

const gigaRcToHp = (value: string, properties: GlobalProperties) => {
  const rc = Number(value);
  return (
    ((rc * RcDelegationsUtils.getHivePerVests(properties)) / 1000000) *
    1000000000
  ).toFixed(3);
};

const hpToGigaRc = (value: string, properties: GlobalProperties) => {
  const hp = Number(value);
  return (
    ((hp / RcDelegationsUtils.getHivePerVests(properties)) * 1000000) /
    1000000000
  ).toFixed(3);
};

export const RcDelegationsUtils = {
  getAllIncomingDelegations,
  getAllOutgoingDelegations,
  sendDelegation,
  getHivePerVests,
  gigaRcToHp,
  hpToGigaRc,
};
