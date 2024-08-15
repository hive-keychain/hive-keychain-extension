import Logger from 'src/utils/logger.utils';

const initializeServiceWorker = async () => {
  Logger.info('Starting EVM service worker');
};

export const EvmServiceWorker = { initializeServiceWorker };
