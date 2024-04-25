import Moralis from 'moralis';

const initialise = async () => {
  await Moralis.start({
    apiKey: process.env.MORALIS_API_KEY,
  });
};

export const MoralisUtils = { initialise };
