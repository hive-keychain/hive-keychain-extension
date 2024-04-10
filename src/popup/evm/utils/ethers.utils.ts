import { ethers } from 'ethers';

const getProvider = () => {
  return new ethers.InfuraProvider(
    undefined,
    process.env.INFURA_PROJECT_ID,
    process.env.INFURA_SECRET,
  );
  // return ethers.getDefaultProvider();
};

const EthersUtils = { getProvider };

export default EthersUtils;
