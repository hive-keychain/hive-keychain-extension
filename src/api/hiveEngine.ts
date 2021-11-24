import axios from 'axios';
import SSC from 'sscjs';

export const hsc = new SSC('https://api.hive-engine.com/rpc');

export const hiveEngineAPI = axios.create({
  baseURL: 'https://accounts.hive-engine.com/',
});
