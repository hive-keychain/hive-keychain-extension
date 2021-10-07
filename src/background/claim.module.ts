let claimRewards = false;
let claimAccounts = false;

const updateClaims = (claims: any) => {
  claimRewards = claims.claimRewards;
  claimAccounts = claims.claimAccounts;
};

const ClaimModule = {
  updateClaims,
};

export default ClaimModule;
