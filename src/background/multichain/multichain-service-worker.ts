import { EvmServiceWorker } from '@background/evm/evm-service-worker';
import { HiveServiceWorker } from '@background/hive/hive-service-worker';

HiveServiceWorker.initializeServiceWorker();
EvmServiceWorker.initializeServiceWorker();
