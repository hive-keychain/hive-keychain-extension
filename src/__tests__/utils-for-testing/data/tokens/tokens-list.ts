const alltokens = [
  {
    _id: 1,
    issuer: 'null',
    symbol: 'BEE',
    name: 'Hive Engine Token',
    metadata:
      '{"url":"https://hive-engine.com","icon":"https://s3.amazonaws.com/steem-engine/images/icon_steem-engine_gradient.svg","desc":"BEE is the native token for the Hive Engine platform"}',
    precision: 8,
    maxSupply: '9007199254740991.00000000',
    supply: '2613917.42989258',
    circulatingSupply: '2152123.32229227',
    stakingEnabled: true,
    unstakingCooldown: 40,
    delegationEnabled: true,
    undelegationCooldown: 7,
    numberTransactions: 4,
    totalStaked: '301758.28987919',
  },
  {
    _id: 2,
    issuer: 'honey-swap',
    symbol: 'SWAP.HIVE',
    name: 'HIVE Pegged',
    metadata:
      '{"desc":"HIVE backed by the hive-engine team","url":"https://hive-engine.com","icon":"https://files.peakd.com/file/peakd-hive/aggroed/edUxk8GJ-logo_transparent1.png"}',
    precision: 8,
    maxSupply: '9007199254740991.00000000',
    supply: '9007199254740991.00000000',
    circulatingSupply: '9007199254740987.85453686',
    stakingEnabled: false,
    unstakingCooldown: 1,
    delegationEnabled: false,
    undelegationCooldown: 0,
  },
  {
    _id: 3,
    issuer: 'steemmonsters',
    symbol: 'ORB',
    name: 'Essence Orbs',
    metadata:
      '{"url":"https://splinterlands.com","icon":"https://s3.amazonaws.com/steemmonsters/website/ui_elements/open_packs/img_essence-orb.png","desc":"Each ORB token represents one, unopened, promotional Splinterlands Essence Orb booster pack."}',
    precision: 0,
    maxSupply: '200000',
    supply: '200000',
    circulatingSupply: '10163',
    stakingEnabled: false,
    unstakingCooldown: 1,
    delegationEnabled: false,
    undelegationCooldown: 0,
  },
] as any[];

export default { alltokens };
