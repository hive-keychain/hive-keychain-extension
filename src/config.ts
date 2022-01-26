const Config = {
  hiveEngine: {
    mainNet: 'ssc-mainnet-hive',
  },
  claims: {
    FREQUENCY: +(process.env.DEV_CLAIM_FREQUENCY || 10 * 60 * 1000),
    freeAccount: {
      MIN_RC: +(process.env.DEV_CLAIM_ACCOUNT_RC || 95),
      MIN_HP: +(process.env.DEV_CLAIM_ACCOUNT_HP || 5000),
    },
  },
};

export default Config;
