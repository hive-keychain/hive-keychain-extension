// This file is the hiveTxBundle entry so LavaMoat creates the root compartment
// before the hive-tx package reads globals. Do not point that entry at the package.
export { config } from 'hive-tx';
