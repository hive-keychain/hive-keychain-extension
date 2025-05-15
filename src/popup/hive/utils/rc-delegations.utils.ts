import { Key, KeyType, TransactionOptions } from '@interfaces/keys.interface';
import { RcDelegation } from '@interfaces/rc-delegation.interface';
import { Asset, GlobalProperties } from 'hive-keychain-commons';
import { CustomJsonUtils } from 'src/popup/hive/utils/custom-json.utils';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';

const GIGA = 1000000000;

const getAllOutgoingDelegations = async (
  username: string,
): Promise<RcDelegation[]> => {
  const result = await HiveTxUtils.getData(
    'rc_api.list_rc_direct_delegations',
    { start: [username, ''], limit: 1000 },
  );
  let list = result
    ? result.rc_direct_delegations.map((delegation: any) => {
        return {
          value: delegation.delegated_rc,
          delegatee: delegation.to,
          delegator: delegation.from,
        };
      })
    : [];
  return list;
};
/* istanbul ignore next */
const cancelDelegation = async (
  delegatee: string,
  username: string,
  postingKey: Key,
  options?: TransactionOptions,
) => {
  return sendDelegation(0, delegatee, username, postingKey, options);
};
/* istanbul ignore next */
const sendDelegation = async (
  value: number,
  delegatee: string,
  username: string,
  postingKey: Key,
  options?: TransactionOptions,
) => {
  return HiveTxUtils.sendOperation(
    [RcDelegationsUtils.getRcDelegationOperation(delegatee, value, username)],
    postingKey,
    false,
    options,
  );
};
/* istanbul ignore next */
const getRcDelegationOperation = (
  delegatee: string,
  value: number,
  username: string,
) => {
  return CustomJsonUtils.getCustomJsonOperation(
    [
      'delegate_rc',
      {
        from: username,
        delegatees: [delegatee],
        max_rc: value,
      },
    ],
    username,
    KeyType.POSTING,
    'rc',
  );
};

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
    (rc * GIGA * RcDelegationsUtils.getHivePerVests(properties)) /
    1000000
  ).toFixed(3);
};

const hpToGigaRc = (value: string, properties: GlobalProperties) => {
  const hp = Number(value);
  return (
    ((hp / RcDelegationsUtils.getHivePerVests(properties)) * 1000000) /
    GIGA
  ).toFixed(3);
};

const rcToGigaRc = (rc: number) => {
  return (rc / GIGA).toFixed(3);
};

const formatRcWithUnit = (value: string, fromGiga?: boolean) => {
  let valueNumber = Number(value);
  if (fromGiga) {
    valueNumber = gigaRcToRc(valueNumber);
  }
  if (valueNumber / GIGA < 1000) {
    return `${(valueNumber / GIGA).toFixed(3)} G RC`;
  }
  valueNumber = valueNumber / 1000;
  if (valueNumber / GIGA < 1000) {
    return `${(valueNumber / GIGA).toFixed(3)} T RC`;
  }
  valueNumber = valueNumber / 1000;
  return `${(valueNumber / GIGA).toFixed(3)} P RC`;
};

const gigaRcToRc = (gigaRc: number) => {
  return gigaRc * GIGA;
};

const rcToHp = (rc: string, globalProperties: GlobalProperties) => {
  return gigaRcToHp(rcToGigaRc(Number(rc)), globalProperties);
};

export const RcDelegationsUtils = {
  getAllOutgoingDelegations,
  sendDelegation,
  getHivePerVests,
  gigaRcToHp,
  hpToGigaRc,
  rcToGigaRc,
  gigaRcToRc,
  rcToHp,
  cancelDelegation,
  formatRcWithUnit,
  getRcDelegationOperation,
};
