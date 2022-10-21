import { Asset, PrivateKey } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { GlobalProperties } from '@interfaces/global-properties.interface';
import { RcDelegation } from '@interfaces/rc-delegation.interface';
import HiveUtils from 'src/utils/hive.utils';

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

const sendDelegation = (
  value: number,
  delegatee: string,
  activeAccount: ActiveAccount,
) => {
  console.log({
    id: 'custom',
    required_auths: [activeAccount.name!],
    required_posting_auths: activeAccount.keys.posting
      ? []
      : [activeAccount.name!],
    json: JSON.stringify([
      'delegate_rc',
      {
        from: activeAccount.name!,
        delegatees: [delegatee],
        max_rc: value,
      },
    ]),
  });
  return HiveUtils.sendOperationWithConfirmation(
    HiveUtils.getClient().broadcast.json(
      {
        id: 'rc',
        required_posting_auths: [activeAccount.name!],
        required_auths: [],
        json: JSON.stringify([
          'delegate_rc',
          {
            from: activeAccount.name!,
            delegatees: [delegatee],
            max_rc: value,
          },
        ]),
      },
      PrivateKey.fromString(activeAccount.keys.posting as string),
    ),
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
    (rc * RcDelegationsUtils.getHivePerVests(properties)) /
    1000000
  ).toFixed(3);
};

const hpToGigaRc = (value: string, properties: GlobalProperties) => {
  const hp = Number(value);
  return (
    ((hp / RcDelegationsUtils.getHivePerVests(properties)) * 1000000) /
    1000000000
  ).toFixed(3);
};

const rcToGigaRc = (rc: number) => {
  return (rc / 1000000000).toFixed(3);
};

const gigaRcToRc = (gigaRc: number) => {
  return gigaRc * 1000000000;
};

export const RcDelegationsUtils = {
  getAllIncomingDelegations,
  getAllOutgoingDelegations,
  sendDelegation,
  getHivePerVests,
  gigaRcToHp,
  hpToGigaRc,
  rcToGigaRc,
  gigaRcToRc,
};
