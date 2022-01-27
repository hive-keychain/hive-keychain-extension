const Config = {
  hiveEngine: {
    MAINNET: 'ssc-mainnet-hive',
  },
  claims: {
    FREQUENCY: +(process.env.DEV_CLAIM_FREQUENCY || 10 * 60 * 1000),
    freeAccount: {
      MIN_RC_PCT: +(process.env.DEV_CLAIM_ACCOUNT_RC_PCT || 85),
      MIN_RC: +(process.env.DEV_CLAIM_ACCOUNT_MIN_RC || 1.2 * 10 * 10 ** 12), // 20% more than 10^13 (current creation cost)
    },
  },
};

export default Config;
